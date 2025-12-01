import express from "express";
import { getAllOrders } from "../services/orderService";
import { redis } from "../redisClient";

const router = express.Router();

function isAdmin(req: express.Request) {
  return req.header("x-admin") === "true";
}

router.get("/stats", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });

  const orders = await getAllOrders();
  const totalAmount = orders.reduce((sum, o) => sum + o.subtotalCents, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + o.discountCents, 0);

  res.json({
    totalOrders: orders.length,
    totalAmount,
    totalDiscount,
    orders,
  });
});

export default router;
