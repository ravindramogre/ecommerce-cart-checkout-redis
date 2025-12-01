import { redis } from "./redisClient";

export async function seedProducts() {
  const products = [
    { id: "p1", name: "T-shirt", priceCents: 999 },
    { id: "p2", name: "Mug", priceCents: 499 },
    { id: "p3", name: "Cap", priceCents: 799 },
  ];

  for (const p of products) {
    await redis.hset(`product:${p.id}`, {
      id: p.id,
      name: p.name,
      priceCents: p.priceCents.toString(),
    });
  }

  await redis.del("products:ids");
  await redis.rpush("products:ids", ...products.map((p) => p.id));
}
