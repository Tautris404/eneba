package store

import "errors"

var (
	errProductNotFound   = errors.New("product not found")
	errInvalidPriceRange = errors.New("invalid price range")
	errInvalidSort       = errors.New("invalid product sort")
	errInvalidPagination = errors.New("page must be a positive integer and page_size must be between 1 and 100")
	errSingleCountry     = errors.New("only one country can be selected")
)

const (
	msgStoreError = "could not load store data, please try again"
	logStoreError = "load store data: %v"
)
