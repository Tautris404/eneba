package store

type productFilters struct {
	deals                                                      bool
	search, minPrice, maxPrice, sort, country                  string
	productTypes, operatingSystems, platforms, genres, regions []string
}

type product struct {
	Slug             string   `json:"slug"`
	Name             string   `json:"name"`
	Regions          []string `json:"regions"`
	Price            *float64 `json:"price"`
	DiscountedPrice  *float64 `json:"discounted_price,omitempty"`
	DiscountPercent  *int     `json:"discount_percent,omitempty"`
	CoverImageURL    *string  `json:"cover_image_url"`
	PlatformName     string   `json:"platform_name"`
	PlatformImageURL *string  `json:"platform_image_url"`
}

type productPage struct {
	Products []product     `json:"products"`
	Page     int64         `json:"page"`
	PageSize int64         `json:"page_size"`
	Total    int64         `json:"total"`
	Filters  filterOptions `json:"filters"`
}

type searchProduct struct {
	Slug            string   `json:"slug"`
	CoverImageURL   *string  `json:"cover_image_url"`
	Name            string   `json:"name"`
	Price           *float64 `json:"price"`
	DiscountedPrice *float64 `json:"discounted_price,omitempty"`
}

type productDetails struct {
	Slug             string            `json:"slug"`
	Name             string            `json:"name"`
	Description      string            `json:"description"`
	CoverImageURL    *string           `json:"cover_image_url"`
	Platforms        []productPlatform `json:"platforms"`
	OperatingSystems []string          `json:"operating_systems"`
	Genres           []string          `json:"genres"`
	Regions          []string          `json:"regions"`
	Countries        []string          `json:"countries"`
	Offers           []productOffer    `json:"offers"`
}

type productPlatform struct {
	Name       string  `json:"name"`
	ImageURL   *string `json:"image_url"`
	WebsiteURL *string `json:"website_url"`
}

type productOffer struct {
	ID              int64    `json:"id"`
	Price           float64  `json:"price"`
	DiscountedPrice *float64 `json:"discounted_price,omitempty"`
	Discount        *int     `json:"discount,omitempty"`
	SellerName      string   `json:"seller_name"`
	SellerImageURL  *string  `json:"seller_image_url"`
}

type filterOption struct {
	Value string `json:"value"`
	Label string `json:"label"`
	Count *int64 `json:"count,omitempty"`
}

type filterOptions map[string][]filterOption
