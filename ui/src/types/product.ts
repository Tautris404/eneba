export type FilterKey = 'product_type' | 'operating_system' | 'platform' | 'genre' | 'region';

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type FilterOptions = {
  product_type: FilterOption[];
  operating_system: FilterOption[];
  platform: FilterOption[];
  genre: FilterOption[];
  region: FilterOption[];
  country: FilterOption[];
};

export type StoreProduct = {
  slug: string;
  name: string;
  regions: string[];
  price: number | null;
  discounted_price?: number | null;
  discount_percent?: number | null;
  cover_image_url: string | null;
  platform_name: string;
  platform_image_url: string | null;
};

export type ProductListResponse = {
  products: StoreProduct[];
  page: number;
  page_size: number;
  total: number;
  filters: FilterOptions;
};

export type ProductOffer = {
  id: number;
  price: number;
  discounted_price?: number | null;
  discount?: number | null;
  seller_name: string;
  seller_image_url: string | null;
};

export type ProductPlatform = {
  name: string;
  image_url: string | null;
  website_url: string | null;
};

export type ProductDetails = {
  slug: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  platforms: ProductPlatform[];
  operating_systems: string[];
  genres: string[];
  regions: string[];
  countries: string[];
  offers: ProductOffer[];
};

export type SearchProduct = {
  slug: string;
  name: string;
  cover_image_url: string | null;
  price: number | null;
  discounted_price?: number | null;
};
