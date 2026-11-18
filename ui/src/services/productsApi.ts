import type { ProductDetails, ProductListResponse, SearchProduct } from '../types/product';
import { checkResponse } from './apiClient';

const productsErrorMessage = 'Could not load products. Please try again.';

export async function getProducts(query: string, signal: AbortSignal): Promise<ProductListResponse> {
  const params = new URLSearchParams(query);
  if (!params.get('sort')) params.set('sort', 'popularity');

  const response = await fetch(`/api/store/products?${params}`, { signal });
  await checkResponse(response, productsErrorMessage);
  return response.json();
}

export async function getProductDetails(slug: string, signal?: AbortSignal): Promise<ProductDetails> {
  const response = await fetch(`/api/store/products/${encodeURIComponent(slug)}`, { signal });
  await checkResponse(response, productsErrorMessage);
  return response.json();
}

export async function searchProducts(search: string, signal: AbortSignal): Promise<SearchProduct[]> {
  const params = new URLSearchParams({ search });
  const response = await fetch(`/api/store/search?${params}`, { signal });
  await checkResponse(response, 'Could not load search results');
  return response.json();
}
