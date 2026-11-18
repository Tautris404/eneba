package register

import (
	"errors"
	"log"
	"net/http"

	"eneba/api/internal/auth"
	"eneba/api/internal/httpapi"
)

type Handler struct {
	service *Service
}

func NewRegistrationHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var input registerRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	id, err := h.service.startRegistration(r.Context(), input.Email, input.Password)
	if err != nil {
		writeRegistrationError(w, err)
		return
	}
	httpapi.WriteJSON(w, http.StatusAccepted, registerResponse{ID: id})
}

func (h *Handler) ConfirmRegistration(w http.ResponseWriter, r *http.Request) {
	var input confirmationRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	tokens, err := h.service.confirm(r.Context(), input.ID, input.Code)
	if err != nil {
		writeRegistrationError(w, err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	httpapi.WriteJSON(w, http.StatusCreated, tokens)
}

func (h *Handler) ResendConfirmation(w http.ResponseWriter, r *http.Request) {
	var input resendRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	if err := h.service.resend(r.Context(), input.ID); err != nil {
		writeRegistrationError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeRegistrationError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, auth.ErrInvalidEmail), errors.Is(err, auth.ErrInvalidPassword),
		errors.Is(err, auth.ErrPasswordNeedsDigitOrSymbol), errors.Is(err, auth.ErrInvalidCode), errors.Is(err, auth.ErrInvalidConfirmationID):
		httpapi.WriteError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, auth.ErrEmailTaken), errors.Is(err, auth.ErrConfirmationPending):
		httpapi.WriteError(w, http.StatusConflict, err.Error())
	case errors.Is(err, auth.ErrResendTooSoon), errors.Is(err, auth.ErrConfirmationAttempts), errors.Is(err, auth.ErrConfirmationEmailLimit):
		httpapi.WriteError(w, http.StatusTooManyRequests, err.Error())
	case errors.Is(err, auth.ErrConfirmationMissing):
		httpapi.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, auth.ErrEmailDelivery):
		log.Printf(auth.LogRegisterError, err)
		httpapi.WriteError(w, http.StatusServiceUnavailable, auth.MsgEmailDelivery)
	default:
		log.Printf(auth.LogRegisterError, err)
		httpapi.WriteError(w, http.StatusInternalServerError, auth.MsgRegisterFailed)
	}
}
