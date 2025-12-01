import React from "react";
import ProductList from "./components/ProductList";
import CartView from "./components/CartView";

export default function App() {
  return (
    <div className="app-container">
      <h1>Ecommerce Demo – Cart & Checkout</h1>
      <p style={{ marginBottom: 20 }}>
        This is demo ecommerce frontend showcasing cart management and checkout
      </p>
      <div className="layout">
        <div className="card" style={{ flex: 2 }}>
          <ProductList />
        </div>
        <div className="card" style={{ width: 380 }}>
          <CartView />
        </div>
      </div>
    </div>
  );
}
