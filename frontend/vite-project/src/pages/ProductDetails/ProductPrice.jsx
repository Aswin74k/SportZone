import React from "react";

export default function ProductPrice({ price, variant = "default" }) {
  const mrp = Math.round(Number(price) * 1.25);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp - price;

  if (variant === "desktop-panel") {
    return (
      <div>
        <div className="small text-muted font-semibold">Price:</div>
        <div className="sz-pd-price-flex align-items-baseline">
          <span className="sz-pd-current-price" style={{ fontSize: "2rem" }}>
            ₹{Number(price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          {discount > 0 && (
            <span className="sz-pd-strike-price" style={{ fontSize: "1.1rem" }}>
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <div className="text-success small fw-bold mt-1">
          Free shipping included
        </div>
      </div>
    );
  }

  return (
    <div className="sz-pd-price-card">
      <div className="sz-pd-price-flex">
        <span className="sz-pd-current-price">
          ₹{Number(price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
        {discount > 0 && (
          <>
            <span className="sz-pd-strike-price">₹{mrp.toLocaleString("en-IN")}</span>
            <span className="sz-pd-pct-discount">{discount}% OFF</span>
          </>
        )}
      </div>
      {discount > 0 && (
        <div className="sz-pd-savings-banner">
          Instant Savings: ₹{savings.toLocaleString("en-IN")}
        </div>
      )}
    </div>
  );
}
