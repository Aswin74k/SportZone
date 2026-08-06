import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function EmptyCheckout({ onBrowseShop }) {
  return (
    <div className="sz-co-wrap">
      <div className="sz-co-empty-wrapper">
        <FaExclamationTriangle size={40} />
        <h3>Products Unavailable</h3>
        <p>Some items in your cart are no longer available. Please return to the shop and choose another product.</p>
        <button type="button" className="sz-co-shop-redirect-btn" onClick={onBrowseShop}>
          Browse Shop
        </button>
      </div>
    </div>
  );
}
