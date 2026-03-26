import React from "react";
import { FaStar } from "react-icons/fa";

function Rating({
  value = 4.8,
  outOf = 5,
  size = 14,
  showValue = true,
}) {
  const numeric = Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const filled = Math.min(outOf, Math.max(0, Math.round(safeValue)));

  return (
    <span className="rating-wrap d-inline-flex align-items-center gap-1">
      {Array.from({ length: outOf }).map((_, idx) => (
        <FaStar
          key={idx}
          size={size}
          style={{
            color: idx < filled ? "#f59e0b" : "#cbd5e1",
          }}
          aria-hidden="true"
        />
      ))}
      {showValue && (
        <span className="fw-bold" style={{ color: "#f59e0b", fontSize: size, marginLeft: '4px' }}>
          {safeValue.toFixed(1)}
        </span>
      )}
    </span>
  );
}

export default Rating;

