package httpapi

import (
	"context"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	errAccessTokenTTL  = errors.New("ACCESS_TOKEN_TTL must be a duration of at least 1 second")
	errRefreshTokenTTL = errors.New("REFRESH_TOKEN_TTL must be a positive duration")
	errTokenTTLOrder   = errors.New("expected ACCESS_TOKEN_TTL <= REFRESH_TOKEN_TTL")
	errJWTSecret       = errors.New("JWT_SECRET must contain at least 32 bytes")
)

type userIDKey struct{}

type AuthMiddleware struct {
	Key        string
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

func NewAuthMiddleware() (*AuthMiddleware, error) {
	secret := os.Getenv("JWT_SECRET")
	if err := validateJWTSecret(secret); err != nil {
		return nil, err
	}
	accessTTL, refreshTTL, err := validateTokenTTLs(
		os.Getenv("ACCESS_TOKEN_TTL"),
		os.Getenv("REFRESH_TOKEN_TTL"),
	)
	if err != nil {
		return nil, err
	}
	return &AuthMiddleware{
		Key:        secret,
		AccessTTL:  accessTTL,
		RefreshTTL: refreshTTL,
	}, nil
}

func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	key := []byte(m.Key)
	return func(w http.ResponseWriter, r *http.Request) {
		header := strings.Fields(r.Header.Get("Authorization"))
		if len(header) != 2 || !strings.EqualFold(header[0], "Bearer") {
			writeUnauthorized(w)
			return
		}
		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(
			header[1], 
			claims, 
			func(_ *jwt.Token) (any, error) { return key, nil }, 
			jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
			jwt.WithExpirationRequired(), jwt.WithIssuedAt())
		
		if err != nil || !token.Valid {
			writeUnauthorized(w)
			return
		}

		userID, err := strconv.ParseInt(claims.Subject, 10, 64)
		if err != nil || userID <= 0 {
			writeUnauthorized(w)
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey{}, userID)
		next(w, r.WithContext(ctx))
	}
}

func UserIDFromContext(ctx context.Context) (int64, bool) {
	id, ok := ctx.Value(userIDKey{}).(int64)
	return id, ok
}

func validateTokenTTLs(access, refresh string) (time.Duration, time.Duration, error) {
	accessTTL, err := time.ParseDuration(access)
	if err != nil || accessTTL < time.Second {
		return 0, 0, errAccessTokenTTL
	}
	refreshTTL, err := time.ParseDuration(refresh)
	if err != nil || refreshTTL <= 0 {
		return 0, 0, errRefreshTokenTTL
	}
	if accessTTL > refreshTTL {
		return 0, 0, errTokenTTLOrder
	}
	return accessTTL, refreshTTL, nil
}

func validateJWTSecret(secret string) error {
	if len(secret) < 32 {
		return errJWTSecret
	}
	return nil
}
