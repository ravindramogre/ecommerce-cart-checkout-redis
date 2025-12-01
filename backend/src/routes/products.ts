import express from "express";
import { listProducts } from "../services/productService";

const router = express.Router();

router.get("/", async (_req, res) => {
  const products = await listProducts();
  res.json(products);
});

export default router;
