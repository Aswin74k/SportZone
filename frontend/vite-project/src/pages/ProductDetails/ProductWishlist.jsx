import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function ProductWishlist({ wishlisted, toggleWishlist }) {
  return (
    <button
      type="button"
      className={`sz-pd-action-icon-btn ${wishlisted ? "wishlisted" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist();
      }}
      aria-label="Save to Wishlist"
    >
      {wishlisted ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
    </button>
  );
}
