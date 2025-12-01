import express from "express";
import bodyParser from "body-parser";
import { seedProducts } from "./seedProducts";
import productsRouter from "./routes/products";
import cors from "cors";
import cartRouter from "./routes/cart";
import checkoutRouter from "./routes/checkout";
import adminRouter from "./routes/admin";
import { redis } from "./redisClient";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/checkout", checkoutRouter);
app.use("/api/v1/admin", adminRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  await seedProducts();
  await redis.set("global:ordersCounter", "0");

  app.listen(PORT, () => {
    console.log("Backend running on port", PORT);
  });
}

start();
