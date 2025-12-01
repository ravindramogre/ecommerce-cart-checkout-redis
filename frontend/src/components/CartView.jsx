import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../cart/CartContext";

export default function CartView() {
  const { cart, products, loading, applyCoupon, checkout, refresh } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);

  function getProductById(id) {
    return products.find((p) => p.id === id);
  }

  // calculate subtotal from products
  const subtotalCents = cart.items.reduce((sum, item) => {
    const p = getProductById(item.productId);
    if (!p) return sum;
    return sum + p.priceCents * item.quantity;
  }, 0);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) {
      alert("Enter a coupon code");
      return;
    }
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
      await refresh();
      alert("Coupon applied (if valid on backend)");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Failed to apply coupon";
      alert(msg);
    }
  }

  async function handleCheckout() {
    try {
      setCheckoutLoading(true);
      const res = await checkout();
      const { order, generatedCoupon: newCoupon } = res;

      let message = `Order #${order.orderNumber} placed successfully!\nTotal: ₹ ${(order.totalCents / 100).toFixed(
        2
      )}`;
      if (order.couponCodeApplied) {
        message += `\nApplied Coupon: ${order.couponCodeApplied}`;
      }
      if (order.discountCents > 0) {
        message += `\nDiscount: ₹ ${(order.discountCents / 100).toFixed(2)}`;
      }
      if (newCoupon) {
        message += `\n\nYou received a new coupon: ${newCoupon.code} (10% off on next order).`;
        setGeneratedCoupon(newCoupon);
      }

      alert(message);
      await refresh();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Checkout failed";
      alert(msg);
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) return <p>Loading cart...</p>;

  return (
    <div>
      <h2>Cart</h2>
      
      {generatedCoupon && (
        <div style={{
          backgroundColor: "#d4edda",
          border: "2px solid #28a745",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          textAlign: "center"
        }}>
          <div style={{ color: "#155724", fontWeight: "bold", fontSize: 18 }}>
            🎉 Congratulations! You got a coupon!
          </div>
          <div style={{ color: "#155724", fontSize: 24, marginTop: 8, fontFamily: "monospace" }}>
            {generatedCoupon.code}
          </div>
          <div style={{ color: "#155724", fontSize: 12, marginTop: 8 }}>
            10% off on your next order
          </div>
        </div>
      )}

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.items.map((item, idx) => {
              const p = getProductById(item.productId);
              const lineCents = p ? p.priceCents * item.quantity : 0;
              return (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8
                  }}
                >
                  <div>
                    <div>
                      <strong>{p ? p.name : item.productId}</strong>
                    </div>
                    <div>
                      Qty: {item.quantity}
                      {p && (
                        <>
                          {" · "}Price: ₹ {(p.priceCents / 100).toFixed(2)}
                        </>
                      )}
                    </div>
                  </div>
                  <div>₹ {(lineCents / 100).toFixed(2)}</div>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 10 }}>
            <div>
              <strong>Subtotal:</strong> ₹ {(subtotalCents / 100).toFixed(2)}
            </div>
            {cart.appliedCoupon && (
              <div style={{
                backgroundColor: "#e7f3ff",
                border: "2px solid #0066cc",
                borderRadius: 6,
                padding: 10,
                marginTop: 10,
                textAlign: "center"
              }}>
                <div style={{ color: "#0066cc", fontSize: 12, marginBottom: 4 }}>
                  ✓ Coupon Applied
                </div>
                <div style={{ color: "#0066cc", fontSize: 18, fontWeight: "bold", fontFamily: "monospace" }}>
                  {cart.appliedCoupon}
                </div>
                <div style={{ color: "#0066cc", fontSize: 12, marginTop: 4 }}>
                  10% discount will be applied at checkout
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={handleApplyCoupon}>Apply</button>
          </div>

          <div style={{ marginTop: 16 }}>
            <button onClick={handleCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
