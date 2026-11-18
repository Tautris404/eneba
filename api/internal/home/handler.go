package home

import (
	"log"
	"net/http"

	"eneba/api/internal/httpapi"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Banners(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.banners(r.Context())
	writeHomeResult(w, result, err)
}

func (h *Handler) Shortcuts(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.shortcuts(r.Context())
	writeHomeResult(w, result, err)
}

func (h *Handler) GiftCards(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.giftCards(r.Context())
	writeHomeResult(w, result, err)
}

func (h *Handler) Genres(w http.ResponseWriter, r *http.Request) {
	result, err := h.service.genres(r.Context())
	writeHomeResult(w, result, err)
}

func writeHomeResult(w http.ResponseWriter, result any, err error) {
	switch {
	case err == nil:
		httpapi.WriteJSON(w, http.StatusOK, result)
	default:
		log.Printf(logHomeError, err)
		httpapi.WriteError(w, http.StatusInternalServerError, msgHomeError)
	}
}
