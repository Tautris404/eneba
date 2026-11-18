import type { CartItem } from '../types/cart';

function toCents(price: number) {
  return Math.round(price * 100);
}

export function countCartItems(items: CartItem[]) {
  let count = 0;
  for (const item of items) {
    count += item.quantity;
  }
  return count;
}

export function cartTotal(items: CartItem[]) {
  let totalCents = 0;
  for (const item of items) {
    totalCents += toCents(item.price) * item.quantity;
  }
  return totalCents / 100;
}

export function discountedCartTotal(items: CartItem[], discountPercent: number) {
  let totalCents = 0;
  for (const item of items) {
    const discountedCents = Math.round((toCents(item.price) * (100 - discountPercent)) / 100);
    totalCents += discountedCents * item.quantity;
  }
  return totalCents / 100;
}
