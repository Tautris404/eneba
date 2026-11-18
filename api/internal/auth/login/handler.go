package login

import (
	"errors"
	"log"
	"net/http"

	"eneba/api/internal/auth"
	"eneba/api/internal/auth/authsessions"
	"eneba/api/internal/httpapi"
)

type Handler struct {
	service *Service
}

func NewLoginHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var input loginRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	pair, err := h.service.loginWithPassword(r.Context(), input.Email, input.Password)
	writeLoginTokens(w, pair, err)
}

func (h *Handler) ConfirmCode(w http.ResponseWriter, r *http.Request) {
	var input confirmCodeRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	pair, err := h.service.loginWithCode(r.Context(), input.ID, input.Code)
	writeLoginTokens(w, pair, err)
}

func writeLoginTokens(w http.ResponseWriter, pair authsessions.TokenPair, err error) {
	w.Header().Set("Cache-Control", "no-store")
	if err != nil {
		writeLoginError(w, err)
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, pair)
}

func (h *Handler) RequestCode(w http.ResponseWriter, r *http.Request) {
	var input codeRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	id, err := h.service.requestLoginCode(r.Context(), input.Email)
	writeCodeResult(w, id, err)
}

func (h *Handler) ResendCode(w http.ResponseWriter, r *http.Request) {
	var input resendCodeRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	if err := h.service.resendLoginCode(r.Context(), input.ID); err != nil {
		writeLoginError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeCodeResult(w http.ResponseWriter, id string, err error) {
	if err != nil {
		writeLoginError(w, err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	httpapi.WriteJSON(w, http.StatusAccepted, codeResponse{ID: id})
}

func writeLoginError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, auth.ErrInvalidEmail), errors.Is(err, auth.ErrLoginPassword),
		errors.Is(err, auth.ErrLoginCode), errors.Is(err, auth.ErrInvalidConfirmationID):
		httpapi.WriteError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, auth.ErrCredentials):
		httpapi.WriteError(w, http.StatusUnauthorized, err.Error())
	case errors.Is(err, auth.ErrLocked), errors.Is(err, auth.ErrCodeLimit):
		httpapi.WriteError(w, http.StatusTooManyRequests, err.Error())
	default:
		log.Printf(auth.LogLoginError, err)
		httpapi.WriteError(w, http.StatusInternalServerError, auth.MsgLoginFailed)
	}
}
