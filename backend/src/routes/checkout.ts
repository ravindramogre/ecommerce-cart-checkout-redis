import express from "express";
import Redlock from "redlock";
import { redis } from "../redisClient";
import { getCart, clearCart } from "../services/cartService";
import { getProduct } from "../services/productService";
import { createOrder } from "../services/orderService";
import {
  getCoupon,
  markCouponUsed,
  generateNthOrderCoupon,
} from "../services/couponService";

const router = express.Router();
const redlock = new Redlock([redis]);

router.post("/", async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ message: "User ID required" });

  const lock = await redlock.acquire([`lock:checkout:${userId}`], 2000);

  try {
    const cart = await getCart(userId);
    if (!cart.items.length) return res.status(400).json({ message: "Cart empty" });

    // Compute subtotal
    let subtotal = 0;
    for (const item of cart.items) {
      const prod = await getProduct(item.productId);
      subtotal += prod!.priceCents * item.quantity;
    }

    let discount = 0;

    if (cart.appliedCoupon) {
      const coupon = await getCoupon(cart.appliedCoupon);
      if (coupon && !coupon.used) {
        discount = Math.round(subtotal * (coupon.discountPercent / 100));
      }
    }

    const total = subtotal - discount;

    // Increment order counter and get order number
    const orderCount = await redis.incr("global:ordersCounter");

    const order = await createOrder({
      userId,
      orderNumber: orderCount,
      items: cart.items,
      subtotalCents: subtotal,
      discountCents: discount,
      totalCents: total,
      couponCodeApplied: cart.appliedCoupon || null,
      status: "SUCCESS",
    });

    if (cart.appliedCoupon) {
      await markCouponUsed(cart.appliedCoupon, order.id, userId);
    }

    // Nth order coupon logic
    let newCoupon = null;
    const N = 5;
    if (orderCount % N === 0) {
      newCoupon = await generateNthOrderCoupon(order.id, userId);
    }

    await clearCart(userId);

    await lock.release();
    res.json({ order, generatedCoupon: newCoupon });
  } catch (e) {
    await lock.release();
    res.status(500).json({ error: e.toString() });
  }
});

export default router;
