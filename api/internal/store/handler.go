package store

import (
	"errors"
	"log"
	"net/http"
	"net/url"

	"eneba/api/internal/httpapi"
)

type Handler struct {
	service *Service
}

func NewStoreHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Products(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	filters, err := readProductFilters(query)
	if err != nil {
		writeStoreResult(w, nil, err)
		return
	}
	products, err := h.service.listProducts(r.Context(), filters, query.Get("page"), query.Get("page_size"))
	writeStoreResult(w, products, err)
}

func (h *Handler) ProductDetails(w http.ResponseWriter, r *http.Request) {
	product, err := h.service.getProductDetails(r.Context(), r.PathValue("slug"))
	writeStoreResult(w, product, err)
}

func (h *Handler) SearchProducts(w http.ResponseWriter, r *http.Request) {
	products, err := h.service.searchProducts(r.Context(), r.URL.Query().Get("search"))
	writeStoreResult(w, products, err)
}

func readProductFilters(query url.Values) (productFilters, error) {
	if len(query["country"]) > 1 {
		return productFilters{}, errSingleCountry
	}
	return productFilters{
		deals:  query.Get("deals") == "1",
		search: query.Get("search"), minPrice: query.Get("min_price"), maxPrice: query.Get("max_price"),
		sort:    query.Get("sort"),
		country: query.Get("country"), productTypes: query["product_type"],
		operatingSystems: query["operating_system"], platforms: query["platform"],
		genres: query["genre"], regions: query["region"],
	}, nil
}

func writeStoreResult(w http.ResponseWriter, result any, err error) {
	switch {
	case err == nil:
		httpapi.WriteJSON(w, http.StatusOK, result)
	case errors.Is(err, errProductNotFound):
		httpapi.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, errInvalidPriceRange), errors.Is(err, errInvalidSort), errors.Is(err, errInvalidPagination), errors.Is(err, errSingleCountry):
		httpapi.WriteError(w, http.StatusBadRequest, err.Error())
	default:
		log.Printf(logStoreError, err)
		httpapi.WriteError(w, http.StatusInternalServerError, msgStoreError)
	}
}
