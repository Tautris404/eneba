package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

const (
	msgRequestBodyTooLarge = "request body is too large"
	msgInvalidJSONBody     = "invalid JSON body"
)

var errMultipleJSONValues = errors.New("multiple JSON values")

func ReadRequest(w http.ResponseWriter, r *http.Request, input any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(input)
	if err == nil {
		err = decoder.Decode(new(json.RawMessage))
		if err == io.EOF {
			err = nil
		} else if err == nil {
			err = errMultipleJSONValues
		}
	}
	if err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			WriteError(w, http.StatusRequestEntityTooLarge, msgRequestBodyTooLarge)
		} else {
			WriteError(w, http.StatusBadRequest, msgInvalidJSONBody)
		}
		return false
	}
	return true
}

func writeUnauthorized(w http.ResponseWriter) {
	w.Header().Set("WWW-Authenticate", "Bearer")
	WriteError(w, http.StatusUnauthorized, "unauthorized")
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error": message})
}

func WriteJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
