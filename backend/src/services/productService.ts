import { redis } from "../redisClient";
import { Product } from "../models";

export async function listProducts(): Promise<Product[]> {
  const ids = await redis.lrange("products:ids", 0, -1);
  const results: Product[] = [];

  for (const id of ids) {
    const p = await redis.hgetall(`product:${id}`);
    results.push({
      id: p.id,
      name: p.name,
      priceCents: Number(p.priceCents),
    });
  }

  return results;
}

export async function getProduct(id: string): Promise<Product | null> {
  const p = await redis.hgetall(`product:${id}`);
  if (!p || !p.id) return null;
  return { id: p.id, name: p.name, priceCents: Number(p.priceCents) };
}
