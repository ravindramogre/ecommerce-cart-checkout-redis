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

export async function removeItemFromCart(userId: string, productId: string) {
  const cart = await getCart(userId);
  cart.items = cart.items.filter((i) => i.productId !== productId);
  await saveCart(cart);
  return cart;
}

export async function reduceItemQuantity(userId: string, productId: string, qty: number) {
  const cart = await getCart(userId);
  const item = cart.items.find((i) => i.productId === productId);

  if (item) {
    item.quantity -= qty;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    }
  }

  await saveCart(cart);
  return cart;
}
