package login

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

type Service struct {
	sessions   *authsessions.Service
	repo       *Repository
	sender     *email.Sender
	codeSecret []byte
}

func NewLoginService(repo *Repository, sender *email.Sender, codeSecret string, sessions *authsessions.Service) *Service {
	return &Service{sessions: sessions, repo: repo, sender: sender, codeSecret: []byte(codeSecret)}
}

func (s *Service) loginWithPassword(ctx context.Context, email, password string) (authsessions.TokenPair, error) {
	address, err := auth.NormalizeEmail(email)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if !auth.ValidLoginPassword(password) {
		return authsessions.TokenPair{}, auth.ErrLoginPassword
	}
	tx, err := s.repo.begin(ctx)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	defer tx.Rollback(ctx)

	account, err := findAccount(ctx, tx, address)
	if err := checkAccount(account, err); err != nil {
		return authsessions.TokenPair{}, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(account.passwordHash), []byte(password))
	if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
		return authsessions.TokenPair{}, failedLogin(ctx, tx, account.id)
	}
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	return s.finishLogin(ctx, tx, account.id)
}

func (s *Service) loginWithCode(ctx context.Context, rawID, code string) (authsessions.TokenPair, error) {
	id, err := auth.ParseConfirmationID(rawID)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if !auth.ValidCode(code) {
		return authsessions.TokenPair{}, auth.ErrLoginCode
	}
	tx, err := s.repo.begin(ctx)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	defer tx.Rollback(ctx)

	account, storedHash, err := loadLoginCode(ctx, tx, id)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if !auth.MatchesCode(storedHash, auth.HashCode(s.codeSecret, "login\x00", account.email, code)) {
		return authsessions.TokenPair{}, failedLogin(ctx, tx, account.id)
	}
	if err := deleteLoginCode(ctx, tx, id); err != nil {
		return authsessions.TokenPair{}, err
	}
	return s.finishLogin(ctx, tx, account.id)
}

func (s *Service) requestLoginCode(ctx context.Context, rawEmail string) (string, error) {
	address, err := auth.NormalizeEmail(rawEmail)
	if err != nil {
		return "", err
	}
	code, err := auth.GenerateCode()
	if err != nil {
		return "", err
	}
	id, err := s.saveCode(ctx, address, auth.HashCode(s.codeSecret, "login\x00", address, code))
	if err != nil {
		return "", err
	}
	if err := s.sendLoginCode(ctx, address, code); err != nil {
		return "", err
	}
	return id.String(), nil
}

func (s *Service) resendLoginCode(ctx context.Context, rawID string) error {
	id, err := auth.ParseConfirmationID(rawID)
	if err != nil {
		return err
	}
	for {
		code, err := auth.GenerateCode()
		if err != nil {
			return err
		}
		address, err := s.replaceCode(ctx, id, code)
		if errors.Is(err, auth.ErrCodeRepeated) {
			continue
		}
		if err != nil {
			return err
		}
		return s.sendLoginCode(ctx, address, code)
	}
}

func (s *Service) sendLoginCode(ctx context.Context, address, code string) error {
	data := struct{ Code string }{Code: code}
	subject := fmt.Sprintf(auth.SubjectLoginCode, code)
	return s.sender.Send(ctx, address, subject, "login", data)
}

func (s *Service) finishLogin(ctx context.Context, tx pgx.Tx, userID int64) (authsessions.TokenPair, error) {
	if err := resetLoginAttempts(ctx, tx, userID); err != nil {
		return authsessions.TokenPair{}, err
	}
	pair, err := s.sessions.Create(ctx, tx, userID)
	if err != nil {
		return authsessions.TokenPair{}, err
	}
	if err := commitLoginTransaction(ctx, tx); err != nil {
		return authsessions.TokenPair{}, err
	}
	return pair, nil
}

func failedLogin(ctx context.Context, tx pgx.Tx, userID int64) error {
	locked, err := recordFailedLogin(ctx, tx, userID)
	if err != nil {
		return err
	}
	if err := commitLoginTransaction(ctx, tx); err != nil {
		return err
	}
	if locked {
		return auth.ErrLocked
	}
	return auth.ErrCredentials
}

func (s *Service) saveCode(ctx context.Context, address string, hash []byte) (pgtype.UUID, error) {
	tx, err := s.repo.begin(ctx)
	if err != nil {
		return pgtype.UUID{}, err
	}
	defer tx.Rollback(ctx)

	account, err := findAccount(ctx, tx, address)
	if err := checkAccount(account, err); err != nil {
		return pgtype.UUID{}, err
	}
	if err := checkSendLimit(ctx, tx, account.id); err != nil {
		return pgtype.UUID{}, err
	}
	id, err := insertLoginCode(ctx, tx, account.id, hash)
	if err != nil {
		return pgtype.UUID{}, err
	}
	return id, commitLoginTransaction(ctx, tx)
}

func (s *Service) replaceCode(ctx context.Context, id pgtype.UUID, code string) (string, error) {
	tx, err := s.repo.begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	account, storedHash, err := loadLoginCode(ctx, tx, id)
	if err != nil {
		return "", err
	}
	if err := checkSendLimit(ctx, tx, account.id); err != nil {
		return "", err
	}
	hash := auth.HashCode(s.codeSecret, "login\x00", account.email, code)
	if auth.MatchesCode(storedHash, hash) {
		return "", auth.ErrCodeRepeated
	}
	if err := updateLoginCode(ctx, tx, id, hash); err != nil {
		return "", err
	}
	return account.email, commitLoginTransaction(ctx, tx)
}

func loadLoginCode(ctx context.Context, tx pgx.Tx, id pgtype.UUID) (account, []byte, error) {
	account, err := findAccountByCode(ctx, tx, id)
	if err := checkAccount(account, err); err != nil {
		return account, nil, err
	}
	hash, err := activeCodeHash(ctx, tx, id, account.id)
	return account, hash, err
}

func checkAccount(account account, err error) error {
	if err != nil {
		return err
	}
	if account.locked {
		return auth.ErrLocked
	}
	return nil
}

func checkSendLimit(ctx context.Context, tx pgx.Tx, userID int64) error {
	limited, err := sendLimitReached(ctx, tx, userID)
	if err != nil {
		return err
	}
	if limited {
		return auth.ErrCodeLimit
	}
	return nil
}

func (s *Service) CleanExpiredCodes(ctx context.Context) {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			queryCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
			err := s.repo.deleteExpiredCodes(queryCtx)
			cancel()
			if err != nil {
				log.Printf(auth.LogLoginCodeCleanupError, err)
			}
		}
	}
}
