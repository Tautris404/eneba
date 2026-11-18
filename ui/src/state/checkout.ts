import { useSyncExternalStore } from 'react';
import type { CartItem, Discount } from '../types/cart';
import { countCartItems } from '../utils/cartTotals';
import { readStorage, removeFromStorage, writeStorage } from '../utils/storage';
import { isRecord } from '../utils/validation';
import { isCartItem, maxCartItems, removeFromCart, removeFromSavedCart, removeManyFromCart, setCartQuantity } from './cart';

const purchaseKey = 'eneba.checkout';
const discountKey = 'eneba.checkout.discount';
const pendingOrderKey = 'eneba.pendingOrderId';

export const paymentPagePath = '/checkout/payment';

function readSavedPurchase(): CartItem[] {
  const value = readStorage('session', purchaseKey);
  if (Array.isArray(value)) return value.filter(isCartItem);
  if (isCartItem(value)) return [value];
  return [];
}

let purchase: CartItem[] = readSavedPurchase();
const listeners = new Set<() => void>();

function setPurchase(next: CartItem[]) {
  purchase = next;
  writeStorage('session', purchaseKey, purchase);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getPurchase() {
  return purchase;
}

export function usePurchase() {
  return useSyncExternalStore(subscribe, getPurchase);
}

export function beginCheckout(items: CartItem[], nextPage = paymentPagePath, discount: Discount | null = null) {
  writeStorage('session', purchaseKey, items);
  if (discount) writeStorage('session', discountKey, discount);
  else removeFromStorage('session', discountKey);
  window.location.assign(nextPage);
}

export function buyNow(item: CartItem) {
  beginCheckout([item]);
}

export function readCheckoutDiscount(): Discount | null {
  const value = readStorage('session', discountKey);
  if (!isRecord(value)) return null;
  if (typeof value.code !== 'string' || typeof value.percent !== 'number') return null;
  return { code: value.code, percent: value.percent };
}

export function changePurchaseQuantity(offerId: number, change: number) {
  if (change > 0 && countCartItems(purchase) >= maxCartItems) return;
  setPurchase(purchase.map((item) => (item.offerId === offerId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)));

  const updated = purchase.find((item) => item.offerId === offerId);
  if (updated) setCartQuantity(offerId, updated.quantity);
}

export function removeFromPurchase(offerId: number) {
  setPurchase(purchase.filter((item) => item.offerId !== offerId));
  removeFromCart(offerId);
}

function boughtOfferIds() {
  return new Set(purchase.map((item) => item.offerId));
}

function forgetSavedPurchase() {
  removeFromStorage('session', purchaseKey);
  removeFromStorage('session', discountKey);
}

export function clearCartForPayment() {
  removeFromSavedCart(boughtOfferIds());
  forgetSavedPurchase();
}

export function finishPurchase() {
  removeManyFromCart(boughtOfferIds());
  setPurchase([]);
  forgetSavedPurchase();
}

export function rememberPendingOrder(orderId: number) {
  writeStorage('session', pendingOrderKey, orderId);
}

export function isPendingOrder(orderId: string) {
  const savedId = readStorage('session', pendingOrderKey);
  return savedId !== null && String(savedId) === orderId;
}

export function forgetPendingOrder() {
  removeFromStorage('session', pendingOrderKey);
}
