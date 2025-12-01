import express from "express";
import { addItemToCart, getCart, saveCart, removeItemFromCart, reduceItemQuantity } from "../services/cartService";
import { getProduct } from "../services/productService";
import { getAvailableCoupons } from "../services/couponService";

const router = express.Router();

router.post("/items", async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ message: "User ID required" });

  const { productId, quantity } = req.body;
  const product = await getProduct(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const cart = await addItemToCart(userId, productId, quantity);
  res.json(cart);
});

router.get("/", async (req, res) => {
  const userId = req.header("x-user-id");
  const cart = await getCart(userId!);
  res.json(cart);
});

router.post("/apply-coupon", async (req, res) => {
  const userId = req.header("x-user-id");
  const { couponCode } = req.body;

  const cart = await getCart(userId!);
  cart.appliedCoupon = couponCode;
  await saveCart(cart);

  res.json({ message: "Coupon applied", cart });
});

router.post("/items/:productId/remove", async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ message: "User ID required" });

  const { productId } = req.params;
  const cart = await removeItemFromCart(userId, productId);
  res.json(cart);
});

router.post("/items/:productId/reduce", async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ message: "User ID required" });

  const { productId } = req.params;
  const { quantity } = req.body;
  const qty = quantity || 1;

  const cart = await reduceItemQuantity(userId, productId, qty);
  res.json(cart);
});

router.get("/available-coupons", async (req, res) => {
  const coupons = await getAvailableCoupons();
  res.json({ coupons });
});

export default router;
