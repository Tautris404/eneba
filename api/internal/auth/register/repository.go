package register

import (
	"context"
	"errors"

	"eneba/api/internal/auth"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRegistrationRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) lockConfirmation(ctx context.Context, email string) (pgx.Tx, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	_, err = tx.Exec(ctx, "SELECT pg_advisory_xact_lock(hashtextextended(lower($1::text), 0))", email)
	if err != nil {
		_ = tx.Rollback(ctx)
		return nil, err
	}
	return tx, nil
}

func commitRegistrationTransaction(ctx context.Context, tx pgx.Tx) error {
	return tx.Commit(ctx)
}

func (r *Repository) confirmationEmail(ctx context.Context, id pgtype.UUID) (string, error) {
	var email string
	err := r.db.QueryRow(ctx, "SELECT email FROM pending_confirmations WHERE id = $1", id).Scan(&email)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", auth.ErrConfirmationMissing
	}
	return email, err
}

func userExists(ctx context.Context, tx pgx.Tx, email string) (bool, error) {
	var exists bool
	err := tx.QueryRow(ctx,
		"SELECT EXISTS (SELECT 1 FROM users WHERE lower(email) = lower($1))",
		email,
	).Scan(&exists)
	return exists, err
}

func upsertPendingConfirmation(ctx context.Context, tx pgx.Tx, email, passwordHash string, codeHash []byte) (pgtype.UUID, error) {
	var id pgtype.UUID
	err := tx.QueryRow(ctx, `
		INSERT INTO pending_confirmations (email, password_hash, code_hash)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO UPDATE SET
			id = EXCLUDED.id,
			password_hash = EXCLUDED.password_hash,
			code_hash = EXCLUDED.code_hash,
			attempts = DEFAULT,
			sent_at = DEFAULT,
			emails_sent = DEFAULT,
			expires_at = DEFAULT
		WHERE pending_confirmations.expires_at <= statement_timestamp()
		RETURNING id
	`, email, passwordHash, codeHash).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return id, auth.ErrConfirmationPending
	}
	return id, err
}

func findConfirmation(ctx context.Context, tx pgx.Tx, id pgtype.UUID) (pendingConfirmation, error) {
	var pending pendingConfirmation
	err := tx.QueryRow(ctx, `
		SELECT password_hash, code_hash, emails_sent > 1 AND sent_at > statement_timestamp() - interval '30 seconds',
			attempts, emails_sent
		FROM pending_confirmations
		WHERE id = $1 AND expires_at > statement_timestamp()
		FOR UPDATE
	`, id).Scan(&pending.passwordHash, &pending.codeHash, &pending.coolingDown, &pending.attempts, &pending.emailsSent)
	if errors.Is(err, pgx.ErrNoRows) {
		return pending, auth.ErrConfirmationMissing
	}
	return pending, err
}

func updateConfirmationCode(ctx context.Context, tx pgx.Tx, id pgtype.UUID, codeHash []byte) error {
	_, err := tx.Exec(ctx, `
		UPDATE pending_confirmations
		SET code_hash = $2, sent_at = statement_timestamp(), emails_sent = emails_sent + 1
		WHERE id = $1
	`, id, codeHash)
	return err
}

func recordFailedConfirmation(ctx context.Context, tx pgx.Tx, id pgtype.UUID) (int, error) {
	var attempts int
	err := tx.QueryRow(ctx, `
		UPDATE pending_confirmations SET attempts = attempts + 1
		WHERE id = $1 RETURNING attempts
	`, id).Scan(&attempts)
	return attempts, err
}

func createConfirmedUser(ctx context.Context, tx pgx.Tx, id pgtype.UUID, email, passwordHash string) (int64, error) {
	var userID int64
	err := tx.QueryRow(ctx, `
		INSERT INTO users (email, password_hash) VALUES ($1, $2)
		ON CONFLICT (lower(email)) DO NOTHING
		RETURNING id
	`, email, passwordHash).Scan(&userID)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return 0, err
	}
	if _, deleteErr := tx.Exec(ctx, "DELETE FROM pending_confirmations WHERE id = $1", id); deleteErr != nil {
		return 0, deleteErr
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, auth.ErrEmailTaken
	}
	return userID, nil
}

func (r *Repository) deleteExpiredConfirmations(ctx context.Context) error {
	_, err := r.db.Exec(ctx, "DELETE FROM pending_confirmations WHERE expires_at <= statement_timestamp()")
	return err
}
