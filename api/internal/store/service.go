package store

import (
	"context"
	"errors"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
)

var (
	storePricePattern  = regexp.MustCompile(`^[0-9]{1,8}(\.[0-9]{1,2})?$`)
	storeSearchEscaper = strings.NewReplacer(`\`, `\\`, "%", `\%`, "_", `\_`)
)

type Service struct {
	repo *Repository
}

func NewStoreService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) getProductDetails(ctx context.Context, slug string) (productDetails, error) {
	product, err := s.repo.findProductDetails(ctx, slug)
	if errors.Is(err, pgx.ErrNoRows) {
		return productDetails{}, errProductNotFound
	}
	return product, err
}

func (s *Service) searchProducts(ctx context.Context, search string) ([]searchProduct, error) {
	search = normalizeStoreSearch(search)
	if search == "" {
		return []searchProduct{}, nil
	}
	return s.repo.findSearchProducts(ctx, search)
}

func normalizeStoreSearch(search string) string {
	return storeSearchEscaper.Replace(strings.TrimSpace(search))
}

func (s *Service) listProducts(ctx context.Context, filters productFilters, rawPage, rawPageSize string) (productPage, error) {
	if err := validateStorePriceRange(filters.minPrice, filters.maxPrice); err != nil {
		return productPage{}, err
	}
	switch filters.sort {
	case "price_asc", "price_desc", "date_asc", "date_desc", "popularity", "alphabet_asc", "alphabet_desc":
	default:
		return productPage{}, errInvalidSort
	}

	page, pageSize, err := parseProductPagination(rawPage, rawPageSize)
	if err != nil {
		return productPage{}, err
	}
	filters.search = normalizeStoreSearch(filters.search)
	result, err := s.repo.findStoreProducts(ctx, filters, pageSize, (page-1)*pageSize)
	result.Page = page
	result.PageSize = pageSize
	return result, err
}

func parseProductPagination(rawPage, rawPageSize string) (int64, int64, error) {
	if rawPage == "" {
		rawPage = "1"
	}
	if rawPageSize == "" {
		rawPageSize = "20"
	}
	page, pageErr := strconv.ParseInt(rawPage, 10, 64)
	size, sizeErr := strconv.ParseInt(rawPageSize, 10, 64)
	if pageErr != nil || sizeErr != nil || page < 1 || size < 1 || size > 100 || page-1 > math.MaxInt64/size {
		return 0, 0, errInvalidPagination
	}
	return page, size, nil
}

func validateStorePriceRange(minPrice, maxPrice string) error {
	for _, price := range []string{minPrice, maxPrice} {
		if price != "" && !storePricePattern.MatchString(price) {
			return errInvalidPriceRange
		}
	}
	if minPrice != "" && maxPrice != "" {
		minimum, _ := strconv.ParseFloat(minPrice, 64)
		maximum, _ := strconv.ParseFloat(maxPrice, 64)
		if minimum > maximum {
			return errInvalidPriceRange
		}
	}
	return nil
}
