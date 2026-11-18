package home

type banner struct {
	Title             string `json:"title"`
	WideImageURL      string `json:"wide_image_url"`
	CollapsedImageURL string `json:"collapsed_image_url"`
}

type shortcut struct {
	Name    string `json:"name"`
	IconURL string `json:"icon_url"`
	LinkURL string `json:"link_url"`
}

type giftCard struct {
	Name     string `json:"name"`
	ImageURL string `json:"image_url"`
	LinkURL  string `json:"link_url"`
}

type genre struct {
	Name         string `json:"name"`
	ProductCount int64  `json:"product_count"`
	IconURL      string `json:"icon_url"`
	LinkURL      string `json:"link_url"`
}
