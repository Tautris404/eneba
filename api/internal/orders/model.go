package orders

import "time"

type orderRequest struct {
	Items        []requestedItem `json:"items"`
	DiscountCode *string         `json:"discount_code"`
}

type requestedItem struct {
	OfferID  int64 `json:"offer_id"`
	Quantity int   `json:"quantity"`
}

type orderResponse struct {
	ID          int64  `json:"id"`
	CheckoutURL string `json:"checkout_url"`
}

type orderSummary struct {
	ID            int64     `json:"id"`
	Date          time.Time `json:"date"`
	Status        string    `json:"status"`
	Title         string    `json:"title"`
	PaymentMethod string    `json:"payment_method"`
	TotalAmount   float64   `json:"total_amount"`
}

type discountRequest struct {
	Code string `json:"code"`
}

type orderDetails struct {
	ID              int64            `json:"id"`
	Date            time.Time        `json:"date"`
	OrderedProducts []orderedProduct `json:"ordered_products"`
	Status          string           `json:"status"`
	PaymentMethod   string           `json:"payment_method"`
	TotalAmount     float64          `json:"total_amount"`
	CheckoutURL     *string          `json:"checkout_url,omitempty"`
}

type orderedProduct struct {
	ImageURL *string `json:"image_url"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Seller   string  `json:"seller"`
	Key      string  `json:"key,omitempty"`
}

type orderedProductRow struct {
	ImageURL      *string
	Name          string
	Price         float64
	Seller        string
	KeyCiphertext []byte
}

type discountResponse struct {
	DiscountPercent int `json:"discount_percent"`
}

type checkoutOrder struct {
	ID        int64
	Title     string
	Cents     int64
	ExpiresAt time.Time
}
