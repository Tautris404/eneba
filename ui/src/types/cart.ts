export type CartItem = {
  offerId: number;
  slug: string;
  name: string;
  image: string | null;
  seller: string;
  sellerImage: string | null;
  price: number;
  quantity: number;
};

export type Discount = {
  code: string;
  percent: number;
};
