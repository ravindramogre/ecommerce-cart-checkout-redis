import React, { useEffect } from "react";

export default function Toast({ message, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        backgroundColor: "#d4edda",
        border: "2px solid #28a745",
        borderRadius: 8,
        padding: 16,
        maxWidth: 400,
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        animation: "slideIn 0.3s ease-out"
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ color: "#155724", fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
        🎉 Congratulations!
      </div>
      {message}
    </div>
  );
}
