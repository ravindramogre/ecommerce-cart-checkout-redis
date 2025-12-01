import { redis } from "../redisClient";
import { Order } from "../models";
import { v4 as uuid } from "uuid";

export async function createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const id = uuid();
  const full = { ...order, id, createdAt: new Date().toISOString() };

  await redis.set(`order:${id}`, JSON.stringify(full));
  await redis.rpush("orders:ids", id);

  return full;
}

export async function getAllOrders(): Promise<Order[]> {
  const ids = await redis.lrange("orders:ids", 0, -1);
  const results: Order[] = [];

  for (const id of ids) {
    const raw = await redis.get(`order:${id}`);
    if (raw) results.push(JSON.parse(raw));
  }

  return results;
}
