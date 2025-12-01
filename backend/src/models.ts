export type ID = string;

export interface Product {
  id: ID;
  name: string;
  priceCents: number;
}

export interface CartItem {
  productId: ID;
  quantity: number;
}

export interface Cart {
  userId: ID;
  items: CartItem[];
  appliedCoupon?: string | null;
}

export interface Order {
  id: ID;
  userId: ID;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  couponCodeApplied?: string | null;
  createdAt: string;
  status: "SUCCESS" | "FAILED";
}

export interface Coupon {
  code: string;
  discountPercent: number;
  createdAt: string;
  used: boolean;
  issuedForOrderId?: string | null;
  issuedToUserId?: string | null;
  usedByOrderId?: string | null;
}
