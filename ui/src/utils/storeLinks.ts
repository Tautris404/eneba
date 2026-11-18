export type SortOrder = 'popularity' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'alphabet_asc' | 'alphabet_desc';

export type StoreFilters = {
  deals?: '1';
  product_type?: string | string[];
  platform?: string | string[];
  genre?: string | string[];
  operating_system?: string | string[];
  region?: string | string[];
  country?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  sort?: SortOrder;
  page?: string;
  page_size?: string;
  product?: string;
};

export const storeQueryChangeEvent = 'storequerychange';

export function productLink(slug: string) {
  return `/${encodeURIComponent(slug)}`;
}

export function storeLink(filters: StoreFilters = {}) {
  const params = new URLSearchParams({ sort: filters.sort ?? 'popularity' });

  for (const [name, value] of Object.entries(filters)) {
    if (name === 'sort' || value === undefined || value === '') continue;
    const values = Array.isArray(value) ? value : [value];
    for (const entry of values) params.append(name, entry);
  }

  return `/store/all?${params}`;
}
