package authsessions

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"strconv"
	"time"

	"eneba/api/internal/auth"
	"eneba/api/internal/httpapi"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
)

type Service struct {
	repo       *Repository
	key        []byte
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewSessionService(repo *Repository, tokens *httpapi.AuthMiddleware) *Service {
	return &Service{
		repo: repo, key: []byte(tokens.Key),
		accessTTL: tokens.AccessTTL, refreshTTL: tokens.RefreshTTL,
	}
}

func (s *Service) Create(ctx context.Context, tx pgx.Tx, userID int64) (TokenPair, error) {
	for {
		if err := ctx.Err(); err != nil {
			return TokenPair{}, err
		}
		refreshToken := newRefreshToken()
		err := s.repo.save(ctx, tx, userID, hashRefreshToken(refreshToken), s.refreshTTL)
		if errors.Is(err, errRefreshTokenCollision) {
			continue
		}
		if err != nil {
			return TokenPair{}, err
		}
		return s.issuePair(userID, refreshToken)
	}
}

func (s *Service) refreshSession(ctx context.Context, oldToken string) (TokenPair, error) {
	if oldToken == "" {
		return TokenPair{}, auth.ErrRefreshTokenRequired
	}

	oldHash := hashRefreshToken(oldToken)
	for {
		if err := ctx.Err(); err != nil {
			return TokenPair{}, err
		}
		newToken := newRefreshToken()
		newHash := hashRefreshToken(newToken)
		if bytes.Equal(oldHash, newHash) {
			continue
		}
		userID, err := s.repo.rotate(ctx, oldHash, newHash, s.refreshTTL)
		if errors.Is(err, errRefreshTokenCollision) {
			continue
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return TokenPair{}, auth.ErrInvalidRefreshToken
		}
		if err != nil {
			return TokenPair{}, err
		}
		return s.issuePair(userID, newToken)
	}
}

func (s *Service) logoutSession(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return auth.ErrRefreshTokenRequired
	}
	return s.repo.revoke(ctx, hashRefreshToken(refreshToken))
}

func (s *Service) issuePair(userID int64, refreshToken string) (TokenPair, error) {
	accessToken, err := s.issueAccessToken(userID)
	if err != nil {
		return TokenPair{}, err
	}
	return TokenPair{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

func (s *Service) issueAccessToken(userID int64) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   strconv.FormatInt(userID, 10),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTTL)),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.key)
}

func newRefreshToken() string {
	var data [32]byte
	rand.Read(data[:])
	return base64.RawURLEncoding.EncodeToString(data[:])
}

func hashRefreshToken(token string) []byte {
	hash := sha256.Sum256([]byte(token))
	return hash[:]
}
