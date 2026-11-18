package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"math/big"
)

func GenerateCode() (string, error) {
	number, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", number.Int64()), nil
}

func HashCode(secret []byte, prefix, email, code string) []byte {
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(prefix + email + "\x00" + code))
	return mac.Sum(nil)
}

func MatchesCode(storedHash, codeHash []byte) bool {
	return subtle.ConstantTimeCompare(storedHash, codeHash) == 1
}
