package login

import (
	"context"
	"errors"

	"eneba/api/internal/auth"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

const maxLoginAttempts = 5

func (r *Repository) deleteExpiredCodes(ctx context.Context) error {
	_, err := r.db.Exec(ctx, "DELETE FROM login_codes WHERE expires_at <= statement_timestamp()")
	return err
}

type Repository struct {
	db *pgxpool.Pool
}

func NewLoginRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) begin(ctx context.Context) (pgx.Tx, error) {
	return r.db.Begin(ctx)
}

func commitLoginTransaction(ctx context.Context, tx pgx.Tx) error {
	return tx.Commit(ctx)
}

func findAccount(ctx context.Context, tx pgx.Tx, address string) (account, error) {
	var found account
	err := tx.QueryRow(ctx, `
		SELECT id, password_hash, COALESCE(login_locked_until > clock_timestamp(), false)
		FROM users WHERE lower(email) = $1
		FOR UPDATE
	`, address).Scan(&found.id, &found.passwordHash, &found.locked)
	return found, accountQueryError(err)
}

func recordFailedLogin(ctx context.Context, tx pgx.Tx, userID int64) (bool, error) {
	var locked bool
	err := tx.QueryRow(ctx, `
		UPDATE users
		SET login_attempts = CASE WHEN login_locked_until IS NULL THEN login_attempts + 1 ELSE 1 END,
			login_locked_until = CASE
				WHEN login_locked_until IS NULL AND login_attempts + 1 >= $2
				THEN statement_timestamp() + interval '5 minutes'
			END
		WHERE id = $1
		RETURNING login_locked_until IS NOT NULL
	`, userID, maxLoginAttempts).Scan(&locked)
	return locked, err
}

func insertLoginCode(ctx context.Context, tx pgx.Tx, userID int64, codeHash []byte) (pgtype.UUID, error) {
	var id pgtype.UUID
	err := tx.QueryRow(ctx, `
		INSERT INTO login_codes (user_id, code_hash)
		VALUES ($1, $2)
		RETURNING id
	`, userID, codeHash).Scan(&id)
	return id, err
}

func updateLoginCode(ctx context.Context, tx pgx.Tx, id pgtype.UUID, codeHash []byte) error {
	_, err := tx.Exec(ctx, `
		UPDATE login_codes
		SET code_hash = $2, sent_at = statement_timestamp(), emails_sent = emails_sent + 1
		WHERE id = $1
	`, id, codeHash)
	return err
}

func sendLimitReached(ctx context.Context, tx pgx.Tx, userID int64) (bool, error) {
	var limited bool
	err := tx.QueryRow(ctx, `
		SELECT COALESCE(
			sum(emails_sent) >= 5
			OR max(sent_at) > statement_timestamp() - interval '30 seconds',
			false
		)
		FROM login_codes
		WHERE user_id = $1
	`, userID).Scan(&limited)
	return limited, err
}

func findAccountByCode(ctx context.Context, tx pgx.Tx, id pgtype.UUID) (account, error) {
	var found account
	err := tx.QueryRow(ctx, `
		SELECT u.id, lower(u.email), COALESCE(u.login_locked_until > clock_timestamp(), false)
		FROM login_codes c JOIN users u ON u.id = c.user_id
		WHERE c.id = $1
		FOR UPDATE OF u
	`, id).Scan(&found.id, &found.email, &found.locked)
	return found, accountQueryError(err)
}

func activeCodeHash(ctx context.Context, tx pgx.Tx, id pgtype.UUID, userID int64) ([]byte, error) {
	var storedHash []byte
	err := tx.QueryRow(ctx, `
		SELECT code_hash FROM login_codes
		WHERE id = $1 AND user_id = $2 AND expires_at > statement_timestamp()
		FOR UPDATE
	`, id, userID).Scan(&storedHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, auth.ErrCredentials
	}
	return storedHash, err
}

func resetLoginAttempts(ctx context.Context, tx pgx.Tx, userID int64) error {
	_, err := tx.Exec(ctx, `
		UPDATE users SET login_attempts = 0, login_locked_until = NULL WHERE id = $1
	`, userID)
	return err
}

func deleteLoginCode(ctx context.Context, tx pgx.Tx, id pgtype.UUID) error {
	_, err := tx.Exec(ctx, "DELETE FROM login_codes WHERE id = $1", id)
	return err
}

func accountQueryError(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return auth.ErrCredentials
	}
	return err
}
