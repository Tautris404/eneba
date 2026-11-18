package orders

import (
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"

	"eneba/api/internal/httpapi"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	userID, _ := httpapi.UserIDFromContext(r.Context())
	orders, err := h.service.list(r.Context(), userID)
	if writeOrderError(w, err) {
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, orders)
}

func (h *Handler) Details(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeOrderError(w, errInvalidOrderID)
		return
	}
	userID, _ := httpapi.UserIDFromContext(r.Context())
	order, err := h.service.details(r.Context(), userID, id)
	if writeOrderError(w, err) {
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	httpapi.WriteJSON(w, http.StatusOK, order)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var input orderRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	userID, _ := httpapi.UserIDFromContext(r.Context())
	order, err := h.service.create(r.Context(), userID, input)
	if writeOrderError(w, err) {
		return
	}
	httpapi.WriteJSON(w, http.StatusCreated, order)
}

func (h *Handler) ValidateDiscount(w http.ResponseWriter, r *http.Request) {
	var input discountRequest
	if !httpapi.ReadRequest(w, r, &input) {
		return
	}
	discount, err := h.service.validateDiscount(r.Context(), input.Code)
	if writeOrderError(w, err) {
		return
	}
	httpapi.WriteJSON(w, http.StatusOK, discount)
}

func (h *Handler) StripeWebhook(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
	if err != nil {
		writeOrderError(w, errInvalidStripeWebhook)
		return
	}
	if writeOrderError(w, h.service.handleStripeWebhook(r.Context(), payload, r.Header.Get("Stripe-Signature"))) {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeOrderError(w http.ResponseWriter, err error) bool {
	switch {
	case err == nil:
		return false
	case errors.Is(err, errInvalidStripeWebhook):
		httpapi.WriteError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, errInvalidItems), errors.Is(err, errInvalidDiscount), errors.Is(err, errExpiredDiscount), errors.Is(err, errInvalidOrderID):
		httpapi.WriteError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, errOrderNotFound):
		httpapi.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, errUnavailable), errors.Is(err, errOrderNotPayable):
		httpapi.WriteError(w, http.StatusConflict, err.Error())
	case errors.Is(err, errCheckoutUnavailable):
		log.Printf(logOrderError, err)
		httpapi.WriteError(w, http.StatusBadGateway, errCheckoutUnavailable.Error())
	default:
		log.Printf(logOrderError, err)
		httpapi.WriteError(w, http.StatusInternalServerError, msgOrderError)
	}
	return true
}
