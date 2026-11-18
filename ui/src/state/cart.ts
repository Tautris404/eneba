import { useSyncExternalStore } from 'react';
import type { CartItem } from '../types/cart';
import type { ProductDetails, ProductOffer } from '../types/product';
import { countCartItems } from '../utils/cartTotals';
import { readStorage, writeStorage } from '../utils/storage';
import { isRecord } from '../utils/validation';

const storageKey = 'eneba.cart';

export const maxCartItems = 50;

type CartDialog = 'cart' | 'added' | null;

type CartSnapshot = {
  items: CartItem[];
  dialog: CartDialog;
};

export function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    typeof value.offerId === 'number' &&
    typeof value.slug === 'string' &&
    typeof value.name === 'string' &&
    typeof value.price === 'number' &&
    typeof value.quantity === 'number'
  );
}

function readSavedCart(): CartItem[] {
  const value = readStorage('local', storageKey);
  if (!Array.isArray(value)) return [];
  return value.filter(isCartItem);
}

let items: CartItem[] = readSavedCart();
let dialog: CartDialog = null;
let snapshot: CartSnapshot = { items, dialog };
const listeners = new Set<() => void>();

function notifyListeners() {
  snapshot = { items, dialog };
  for (const listener of listeners) listener();
}

function setItems(next: CartItem[]) {
  items = next;
  writeStorage('local', storageKey, items);
  notifyListeners();
}

window.addEventListener('storage', (event) => {
  if (event.key !== storageKey) return;
  items = readSavedCart();
  notifyListeners();
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function openCart() {
  dialog = 'cart';
  notifyListeners();
}

export function closeCart() {
  dialog = null;
  notifyListeners();
}

export function canAddMore(cartItems: CartItem[]) {
  return countCartItems(cartItems) < maxCartItems;
}

export function createCartItem(product: ProductDetails, offer: ProductOffer): CartItem {
  return {
    offerId: offer.id,
    slug: product.slug,
    name: product.name,
    image: product.cover_image_url,
    seller: offer.seller_name,
    sellerImage: offer.seller_image_url,
    price: offer.discounted_price ?? offer.price,
    quantity: 1,
  };
}

export function addToCart(item: CartItem) {
  if (!canAddMore(items)) throw new Error(`Your cart can contain up to ${maxCartItems} items.`);

  const existing = items.find((line) => line.offerId === item.offerId);
  let nextItems: CartItem[];
  if (existing) {
    nextItems = items.map((line) => (line.offerId === item.offerId ? { ...item, quantity: line.quantity + 1 } : line));
  } else {
    nextItems = [...items, item];
  }

  dialog = 'added';
  setItems(nextItems);
}

export function changeCartQuantity(offerId: number, change: number) {
  if (change > 0 && !canAddMore(items)) return;
  setItems(items.map((item) => (item.offerId === offerId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)));
}

export function setCartQuantity(offerId: number, quantity: number) {
  if (!items.some((item) => item.offerId === offerId)) return;
  setItems(items.map((item) => (item.offerId === offerId ? { ...item, quantity } : item)));
}

export function removeFromCart(offerId: number) {
  setItems(items.filter((item) => item.offerId !== offerId));
}

export function removeManyFromCart(offerIds: Set<number>) {
  if (offerIds.size === 0) return;
  setItems(items.filter((item) => !offerIds.has(item.offerId)));
}

export function removeFromSavedCart(offerIds: Set<number>) {
  writeStorage('local', storageKey, items.filter((item) => !offerIds.has(item.offerId)));
}
