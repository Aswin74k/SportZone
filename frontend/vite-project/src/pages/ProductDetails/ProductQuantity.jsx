import React from "react";

export default function ProductQuantity({ qty, setQty, inStock, variant = "desktop" }) {
  if (!inStock) return null;

  if (variant === "mobile") {
    return (
      <div className="d-flex align-items-center gap-3">
        <span className="small fw-bold uppercase tracking-wider text-dark">Quantity:</span>
        <div className="sz-pd-qty">
          <button
            type="button"
            className="sz-pd-qty-btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
          >
            -
          </button>
          <span className="sz-pd-qty-val">{qty}</span>
          <button
            type="button"
            className="sz-pd-qty-btn"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sz-pd-qty-selector-row">
      <span className="small text-muted font-semibold">Qty:</span>
      <div className="sz-pd-qty">
        <button
          type="button"
          className="sz-pd-qty-btn"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
        >
          -
        </button>
        <span className="sz-pd-qty-val">{qty}</span>
        <button
          type="button"
          className="sz-pd-qty-btn"
          onClick={() => setQty((q) => q + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
