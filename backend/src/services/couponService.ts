import { redis } from "../redisClient";
import { Coupon } from "../models";

export async function getCoupon(code: string): Promise<Coupon | null> {
  const raw = await redis.get(`coupon:${code}`);
  return raw ? JSON.parse(raw) : null;
}

export async function markCouponUsed(code: string, orderId: string, userId: string) {
  const c = await getCoupon(code);
  if (!c) return;

  c.used = true;
  c.usedByOrderId = orderId;

  await redis.set(`coupon:${code}`, JSON.stringify(c));
}

export async function generateNthOrderCoupon(orderId: string, userId: string) {
  const code = `COUPON-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const coupon: Coupon = {
    code,
    createdAt: new Date().toISOString(),
    used: false,
    discountPercent: 10,
    issuedForOrderId: orderId,
    issuedToUserId: userId,
  };

  await redis.set(`coupon:${code}`, JSON.stringify(coupon));
  await redis.rpush("coupons:ids", code);

  return coupon;
}

export async function getAvailableCoupons() {
  const allCouponIds = await redis.lrange("coupons:ids", 0, -1);
  const available: Coupon[] = [];

  for (const code of allCouponIds) {
    const c = await getCoupon(code);
    if (c && !c.used) {
      available.push(c);
    }
  }

  // Return only the most recent available coupon (max 1)
  return available.length > 0 ? [available[available.length - 1]] : [];
}
