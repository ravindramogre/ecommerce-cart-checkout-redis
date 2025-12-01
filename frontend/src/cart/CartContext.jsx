import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../api";

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [cartData, productsData, couponsData] = await Promise.all([
        api.fetchCart(),
        api.fetchProducts(),
        api.fetchAvailableCoupons()
      ]);
      setCart(cartData);
      setProducts(productsData);
      setAvailableCoupons(couponsData);
    } catch (e) {
      console.error("CartProvider refresh failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addToCart(productId, quantity = 1) {
    const res = await api.addToCart(productId, quantity);
    // backend returns updated cart
    if (res) setCart(res);
    return res;
  }

  async function applyCoupon(code) {
    const res = await api.applyCoupon(code);
    await refresh();
    return res;
  }

  async function doCheckout() {
    const res = await api.checkout();
    await refresh();
    return res;
  }

  async function removeItem(productId) {
    const res = await api.removeFromCart(productId);
    if (res) setCart(res);
    return res;
  }

  async function reduceItem(productId, quantity = 1) {
    const res = await api.reduceCartItem(productId, quantity);
    if (res) setCart(res);
    return res;
  }

  const value = {
    cart,
    products,
    loading,
    availableCoupons,
    refresh,
    addToCart,
    applyCoupon,
    checkout: doCheckout,
    removeItem,
    reduceItem
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
