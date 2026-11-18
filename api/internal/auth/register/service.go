package register

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"eneba/api/internal/auth"
	"eneba/api/internal/auth/authsessions"
	"eneba/api/internal/email"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

const maxConfirmationAttempts = 5
const maxConfirmationEmails = 5

type Service struct {
	sessions   *authsessions.Service
	repo       *Repository
	sender     *email.Sender
	codeSecret []byte
}

func NewRegistrationService(repo *Repository, sender *email.Sender, codeSecret string, sessions *authsessions.Service) (*Service, error) {
	if len(codeSecret) < 32 {
		return nil, auth.ErrConfirmationConfig
	}
	return &Service{repo: repo, sender: sender, codeSecret: []byte(codeSecret), sessions: sessions}, nil
}

func (s *Service) startRegistration(ctx context.Context, email, password string) (string, error) {
	email, err := auth.NormalizeEmail(email)
	if err != nil {
		return "", err
	}
	if err := auth.ValidateRegistrationPassword(password); err != nil {
		return "", err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	code, err := auth.GenerateCode()
	if err != nil {
		return "", err
	}
	codeHash := auth.HashCode(s.codeSecret, "register\x00", email, code)
	id, err := s.saveConfirmation(ctx, email, string(hash), code, codeHash)
	if err != nil {
		return "", err
	}
	return id.String(), nil
}

func (s *Service) resend(ctx context.Context, rawID string) error {
	id, err := auth.ParseConfirmationID(rawID)
	if err != nil {
		return err
	}
	email, err := s.repo.confirmationEmail(ctx, id)
	if err != nil {
		return err
	}
	for {
		code, err := auth.GenerateCode()
		if err != nil {
			return err
		}
		codeHash := auth.HashCode(s.codeSecret, "register\x00", email, code)
		err = s.replaceConfirmationCode(ctx, id, email, code, codeHash)
		if errors.Is(err, auth.ErrCodeRepeated) {
			continue
		}
		return err
	}
}

func (s *Service) confirm(ctx context.Context, rawID, code string) (authsessions.TokenPair, error) {
	id, err := auth.ParseConfirmationID(rawID)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if !auth.ValidCode(code) {
		return authsessions.TokenPair{}, auth.ErrInvalidCode
	}
	email, err := s.repo.confirmationEmail(ctx, id)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	codeHash := auth.HashCode(s.codeSecret, "register\x00", email, code)
	tx, err := s.repo.lockConfirmation(ctx, email)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	defer tx.Rollback(ctx)

	pending, err := findConfirmation(ctx, tx, id)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if pending.attempts >= maxConfirmationAttempts {
		return authsessions.TokenPair{}, auth.ErrConfirmationAttempts
	}
	if !auth.MatchesCode(pending.codeHash, codeHash) {
		return authsessions.TokenPair{}, failedConfirmation(ctx, tx, id)
	}
	return s.finishConfirmation(ctx, tx, id, email, pending.passwordHash)
}

func (s *Service) sendConfirmationCode(ctx context.Context, email, code string) error {
	data := struct{ Code string }{Code: code}
	subject := fmt.Sprintf(auth.SubjectConfirmationCode, code)
	if err := s.sender.Send(ctx, email, subject, "verification", data); err != nil {
		return fmt.Errorf("%w: %w", auth.ErrEmailDelivery, err)
	}
	return nil
}

func (s *Service) CleanExpiredConfirmations(ctx context.Context) {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			queryCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
			err := s.repo.deleteExpiredConfirmations(queryCtx)
			cancel()
			if err != nil {
				log.Printf(auth.LogCleanupError, err)
			}
		}
	}
}

func (s *Service) saveConfirmation(ctx context.Context, email, passwordHash, code string, codeHash []byte) (pgtype.UUID, error) {
	tx, err := s.repo.lockConfirmation(ctx, email)
	if err != nil {
		return pgtype.UUID{}, err
	}
	defer tx.Rollback(ctx)

	exists, err := userExists(ctx, tx, email)
	if err != nil {
		return pgtype.UUID{}, err
	}
	if exists {
		return pgtype.UUID{}, auth.ErrEmailTaken
	}
	id, err := upsertPendingConfirmation(ctx, tx, email, passwordHash, codeHash)
	if err != nil {
		return pgtype.UUID{}, err
	}
	if err := s.sendConfirmationCode(ctx, email, code); err != nil {
		return pgtype.UUID{}, err
	}
	return id, commitRegistrationTransaction(ctx, tx)
}

func (s *Service) replaceConfirmationCode(ctx context.Context, id pgtype.UUID, email, code string, codeHash []byte) error {
	tx, err := s.repo.lockConfirmation(ctx, email)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	pending, err := findConfirmation(ctx, tx, id)
	if err != nil {
		return err
	}
	if err := checkResend(pending, codeHash); err != nil {
		return err
	}
	if err := updateConfirmationCode(ctx, tx, id, codeHash); err != nil {
		return err
	}
	if err := s.sendConfirmationCode(ctx, email, code); err != nil {
		return err
	}
	return commitRegistrationTransaction(ctx, tx)
}

func checkResend(pending pendingConfirmation, codeHash []byte) error {
	switch {
	case pending.attempts >= maxConfirmationAttempts:
		return auth.ErrConfirmationAttempts
	case pending.emailsSent >= maxConfirmationEmails:
		return auth.ErrConfirmationEmailLimit
	case pending.coolingDown:
		return auth.ErrResendTooSoon
	case auth.MatchesCode(pending.codeHash, codeHash):
		return auth.ErrCodeRepeated
	}
	return nil
}

func failedConfirmation(ctx context.Context, tx pgx.Tx, id pgtype.UUID) error {
	attempts, err := recordFailedConfirmation(ctx, tx, id)
	if err != nil {
		return err
	}
	if err := commitRegistrationTransaction(ctx, tx); err != nil {
		return err
	}
	if attempts >= maxConfirmationAttempts {
		return auth.ErrConfirmationAttempts
	}
	return auth.ErrInvalidCode
}

func (s *Service) finishConfirmation(ctx context.Context, tx pgx.Tx, id pgtype.UUID, email, passwordHash string) (authsessions.TokenPair, error) {
	userID, err := createConfirmedUser(ctx, tx, id, email, passwordHash)
	if errors.Is(err, auth.ErrEmailTaken) {
		if commitErr := commitRegistrationTransaction(ctx, tx); commitErr != nil {
			return authsessions.TokenPair{}, commitErr
		}
	}
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	tokens, err := s.sessions.Create(ctx, tx, userID)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if err := commitRegistrationTransaction(ctx, tx); err != nil {
		return authsessions.TokenPair{}, err
	}
	return tokens, nil
}
