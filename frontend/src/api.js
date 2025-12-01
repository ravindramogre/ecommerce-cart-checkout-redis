import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: API_BASE
});

// simple "auth": random user id stored in localStorage
const USER_ID_KEY = "demo_user_id";

function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getAuthHeaders() {
  return {
    "x-user-id": getUserId()
  };
}

// ---- API functions ----

export async function fetchProducts() {
  const res = await api.get("/products");
  return res.data;
}

export async function fetchCart() {
  const res = await api.get("/cart", {
    headers: getAuthHeaders()
  });
  return res.data;
}

export async function addToCart(productId, quantity = 1) {
  const res = await api.post(
    "/cart/items",
    { productId, quantity },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function applyCoupon(couponCode) {
  const res = await api.post(
    "/cart/apply-coupon",
    { couponCode },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function checkout() {
  const res = await api.post(
    "/checkout",
    {},
    { headers: getAuthHeaders() }
  );
  return res.data; // { order, generatedCoupon }
}

export async function removeFromCart(productId) {
  const res = await api.post(
    `/cart/items/${productId}/remove`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function reduceCartItem(productId, quantity = 1) {
  const res = await api.post(
    `/cart/items/${productId}/reduce`,
    { quantity },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function fetchAvailableCoupons() {
  const res = await api.get("/cart/available-coupons");
  return res.data.coupons;
}
