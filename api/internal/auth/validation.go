package auth

import (
	"net/mail"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/jackc/pgx/v5/pgtype"
)

const maxPasswordBytes = 72

func NormalizeEmail(email string) (string, error) {
	email = strings.TrimSpace(email)
	address, err := mail.ParseAddress(email)
	if len(email) > 254 || err != nil || address.Address != email {
		return "", ErrInvalidEmail
	}
	return strings.ToLower(email), nil
}

func ValidateRegistrationPassword(password string) error {
	if len(password) > maxPasswordBytes || utf8.RuneCountInString(password) < 8 || strings.TrimSpace(password) == "" {
		return ErrInvalidPassword
	}
	if strings.IndexFunc(password, isDigitOrSpecialCharacter) == -1 {
		return ErrPasswordNeedsDigitOrSymbol
	}
	return nil
}

func isDigitOrSpecialCharacter(r rune) bool {
	return unicode.IsDigit(r) || unicode.IsPunct(r) || unicode.IsSymbol(r)
}

func ValidLoginPassword(password string) bool {
	return password != "" && len(password) <= maxPasswordBytes
}

func ValidCode(code string) bool {
	return len(code) == 6 && strings.Trim(code, "0123456789") == ""
}

func ParseConfirmationID(value string) (pgtype.UUID, error) {
	var id pgtype.UUID
	if err := id.Scan(value); err != nil {
		return id, ErrInvalidConfirmationID
	}
	return id, nil
}
