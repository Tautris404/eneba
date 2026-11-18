import type { OrderStatus } from '../../types/order';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatOrderDate(isoDate: string) {
  return dateFormat.format(new Date(isoDate));
}

export function paymentMethodLabel(paymentMethod: string) {
  return paymentMethod === 'Stripe' ? 'Credit or debit card' : paymentMethod;
}

export const deliveryStatusText: Record<OrderStatus, string> = {
  paid: 'Order fulfilled',
  pending: 'Pending',
  cancelled: 'Payment incomplete',
};
