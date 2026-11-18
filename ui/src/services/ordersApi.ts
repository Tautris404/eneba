import { authFetch } from '../state/session';
import type { CartItem } from '../types/cart';
import type { CreatedOrder, Order, OrderSummary } from '../types/order';
import { checkResponse } from './apiClient';

const fallbackMessage = 'Something went wrong. Please try again.';

function postWithSession(path: string, body: unknown) {
  return authFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function validateDiscount(code: string): Promise<{ discount_percent: number }> {
  const response = await postWithSession('/api/discount/validate', { code });
  await checkResponse(response, fallbackMessage);
  return response.json();
}

export async function createOrder(items: CartItem[], discountCode?: string): Promise<CreatedOrder> {
  const response = await postWithSession('/api/orders', {
    items: items.map((item) => ({ offer_id: item.offerId, quantity: item.quantity })),
    discount_code: discountCode || null,
  });
  await checkResponse(response, fallbackMessage);
  return response.json();
}

export async function getOrder(id: string, signal: AbortSignal): Promise<Order> {
  const response = await authFetch(`/api/orders/${id}`, { signal });
  await checkResponse(response, fallbackMessage);
  return response.json();
}

export async function listOrders(signal: AbortSignal): Promise<OrderSummary[]> {
  const response = await authFetch('/api/orders', { signal });
  await checkResponse(response, fallbackMessage);
  return response.json();
}
