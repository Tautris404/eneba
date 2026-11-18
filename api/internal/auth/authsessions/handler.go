package authsessions

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

func NewSessionHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var input refreshRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	pair, err := h.service.refreshSession(r.Context(), input.RefreshToken)
	writeSessionTokens(w, pair, err)
}

func writeSessionTokens(w http.ResponseWriter, pair TokenPair, err error) {
	w.Header().Set("Cache-Control", "no-store")
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrRefreshTokenRequired):
			httpapi.WriteError(w, http.StatusBadRequest, err.Error())
		case errors.Is(err, auth.ErrInvalidRefreshToken):
			httpapi.WriteError(w, http.StatusUnauthorized, err.Error())
		default:
			log.Printf("refresh session: %v", err)
			httpapi.WriteError(w, http.StatusInternalServerError, "could not refresh session")
		}
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, pair)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	var input refreshRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	err := h.service.logoutSession(r.Context(), input.RefreshToken)
	switch {
	case err == nil:
		w.WriteHeader(http.StatusNoContent)
	case errors.Is(err, auth.ErrRefreshTokenRequired):
		httpapi.WriteError(w, http.StatusBadRequest, err.Error())
	default:
		log.Printf(auth.LogLogoutError, err)
		httpapi.WriteError(w, http.StatusInternalServerError, auth.MsgLogoutFailed)
	}
}
