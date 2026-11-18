package authsessions

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

var errRefreshTokenCollision = errors.New("refresh token hash already exists")

type Repository struct {
	db *pgxpool.Pool
}

func NewSessionRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) save(ctx context.Context, tx pgx.Tx, userID int64, hash []byte, ttl time.Duration) error {
	result, err := tx.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, created_at, expires_at)
		VALUES ($1, $2, statement_timestamp(), statement_timestamp() + $3::interval)
 		ON CONFLICT (token_hash) DO NOTHING
	`, userID, hash, interval(ttl))
	if err == nil && result.RowsAffected() == 0 {
		return errRefreshTokenCollision
	}
	return err
}

func (r *Repository) rotate(ctx context.Context, oldHash, newHash []byte, refreshTTL time.Duration) (int64, error) {
	var userID int64
	err := r.db.QueryRow(ctx, `
		UPDATE refresh_tokens
		SET token_hash = $2,
			expires_at = statement_timestamp() + $3::interval
		WHERE token_hash = $1 AND revoked_at IS NULL
			AND expires_at > statement_timestamp()
		RETURNING user_id
	`, oldHash, newHash, interval(refreshTTL)).Scan(&userID)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "refresh_tokens_token_hash_key" {
		return 0, errRefreshTokenCollision
	}
	return userID, err
}

func (r *Repository) revoke(ctx context.Context, hash []byte) error {
	_, err := r.db.Exec(ctx, `
		UPDATE refresh_tokens SET revoked_at = statement_timestamp()
		WHERE token_hash = $1 AND revoked_at IS NULL
	`, hash)
	return err
}

func interval(ttl time.Duration) pgtype.Interval {
	return pgtype.Interval{Microseconds: ttl.Microseconds(), Valid: true}
}
