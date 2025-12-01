import React, { useEffect, useState, useCallback } from "react";
import { useCart } from "../cart/CartContext";
import Toast from "./Toast";

export default function CartView() {
  const { cart, products, loading, applyCoupon, checkout, refresh, removeItem, reduceItem, availableCoupons } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);
  const [showToast, setShowToast] = useState(false);

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
      alert("Coupon applied successfully!");
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
        setShowToast(true);
      } else {
        setGeneratedCoupon(null);
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

      {showToast && generatedCoupon && (
        <Toast
          message={
            <div>
              <div style={{ color: "#155724", fontSize: 18, fontFamily: "monospace", fontWeight: "bold", marginBottom: 8 }}>
                {generatedCoupon.code}
              </div>
              <div style={{ color: "#155724", fontSize: 12 }}>
                10% off on your next order
              </div>
            </div>
          }
          onClose={() => setShowToast(false)}
        />
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
                    alignItems: "center",
                    marginBottom: 12,
                    padding: 10,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 6
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div>
                      <strong>{p ? p.name : item.productId}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      Qty: {item.quantity}
                      {p && (
                        <>
                          {" · "}Price: ₹ {(p.priceCents / 100).toFixed(2)}
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", marginRight: 12 }}>
                    ₹ {(lineCents / 100).toFixed(2)}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => reduceItem(item.productId, 1)}
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffc107",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    >
                      −
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{
                        padding: "6px 10px",
                        fontSize: 12,
                        backgroundColor: "#f8d7da",
                        border: "1px solid #dc3545",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>
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

          {availableCoupons.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#666", marginBottom: 6 }}>
                Available Coupons:
              </div>
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  style={{
                    backgroundColor: "#f0f8ff",
                    border: "1px solid #87ceeb",
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "monospace", fontWeight: "bold", fontSize: 14 }}>
                      {coupon.code}
                    </div>
                    <div style={{ fontSize: 12, color: "#0066cc" }}>
                      {coupon.discountPercent}% off on entire order
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCouponInput(coupon.code);
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      backgroundColor: "#87ceeb",
                      border: "1px solid #0066cc",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          )}

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
