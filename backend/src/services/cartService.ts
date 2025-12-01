import { redis } from "../redisClient";
import { Cart } from "../models";

export async function getCart(userId: string): Promise<Cart> {
  const raw = await redis.get(`cart:${userId}`);
  return raw ? JSON.parse(raw) : { userId, items: [] };
}

export async function saveCart(cart: Cart) {
  await redis.set(`cart:${cart.userId}`, JSON.stringify(cart));
}

export async function addItemToCart(userId: string, productId: string, qty: number) {
  const cart = await getCart(userId);
  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) existing.quantity += qty;
  else cart.items.push({ productId, quantity: qty });

  await saveCart(cart);
  return cart;
}

export async function clearCart(userId: string) {
  await redis.del(`cart:${userId}`);
}
