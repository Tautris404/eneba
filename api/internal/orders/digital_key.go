package orders

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"os"
	"strings"
)

type digitalKeyCipher struct {
	aead cipher.AEAD
}

func newDigitalKeyCipher() (digitalKeyCipher, error) {
	value := strings.TrimSpace(os.Getenv("DIGITAL_KEY_ENCRYPTION_KEY"))
	if value == "" {
		return digitalKeyCipher{}, nil
	}
	key, err := base64.StdEncoding.DecodeString(value)
	if err != nil || len(key) != 32 {
		return digitalKeyCipher{}, errInvalidDigitalKeyEncryptionKey
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return digitalKeyCipher{}, err
	}
	aead, err := cipher.NewGCMWithRandomNonce(block)
	return digitalKeyCipher{aead: aead}, err
}

func (c digitalKeyCipher) decryptDigitalKey(ciphertext []byte) (string, error) {
	if ciphertext == nil {
		return "", nil
	}
	if c.aead == nil {
		return "", errMissingDigitalKeyEncryptionKey
	}
	key, err := c.aead.Open(nil, nil, ciphertext, nil)
	if err != nil {
		return "", errDecryptDigitalKey
	}
	return string(key), nil
}
