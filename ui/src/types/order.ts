export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type OrderedProduct = {
  image_url: string | null;
  name: string;
  price: number;
  seller: string;
  key?: string;
};

export type OrderSummary = {
  id: number;
  date: string;
  status: OrderStatus;
  title: string;
  payment_method: string;
  total_amount: number;
};

export type Order = {
  id: number;
  date: string;
  status: OrderStatus;
  payment_method: string;
  total_amount: number;
  checkout_url?: string;
  ordered_products: OrderedProduct[];
};

export type CreatedOrder = {
  id: number;
  checkout_url: string;
};
