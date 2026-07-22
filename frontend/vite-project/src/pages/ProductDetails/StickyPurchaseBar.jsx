import React from "react";
import { FaBolt, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

export default function StickyPurchaseBar({
  inStock,
  cartLoading,
  addToCartNow,
  navigate,
  product,
  selectedSize,
  qty,
  showSizes,
  setSizeError,
  sizeSectionRef
}) {
  const handleBuyNow = () => {
    if (showSizes && !selectedSize) {
      toast.error("Please select a size first.");
      setSizeError(true);
      sizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    navigate("/checkout", { state: { product, size: selectedSize || "N/A", quantity: qty } });
  };

  const handleAddToCart = () => {
    addToCartNow(sizeSectionRef);
  };

  return (
    <div className="sz-pd-mobile-footer-bar d-lg-none">
      <button
        type="button"
        className="sz-mobile-bar-btn cart"
        onClick={handleAddToCart}
        disabled={!inStock || cartLoading}
      >
        <FaShoppingCart /> {cartLoading ? "Adding..." : "Add to Cart"}
      </button>
      <button
        type="button"
        className="sz-mobile-bar-btn buy"
        onClick={handleBuyNow}
        disabled={!inStock}
      >
        <FaBolt /> Buy Now
      </button>
    </div>
  );
}
