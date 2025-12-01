import React, { useEffect, useState } from "react";
import { useCart } from "../cart/CartContext";

export default function ProductList() {
  const [loading, setLoading] = useState(true);
  const { products, addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // products come from CartContext, but we keep a small loading flag here
    (async () => {
      try {
        setLoading(true);
      } catch (e) {
        console.error(e);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [products]);

  async function handleAdd(productId) {
    try {
      setAddingId(productId);
      await addToCart(productId, 1);
      // no need to refetch; context updates cart
    } catch (e) {
      console.error(e);
      alert("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  }

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Products</h2>
      {products.length === 0 && <p>No products available.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((p) => (
          <li
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10
            }}
          >
            <div>
              <div>
                <strong>{p.name}</strong>
              </div>
              <div>₹ {(p.priceCents / 100).toFixed(2)}</div>
            </div>
            <button
              onClick={() => handleAdd(p.id)}
              disabled={addingId === p.id}
            >
              {addingId === p.id ? "Adding..." : "Add to Cart"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
