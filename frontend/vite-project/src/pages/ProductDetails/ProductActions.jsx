import React from "react";
import { FaBolt, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ProductActions({
  product,
  selectedSize,
  qty,
  inStock,
  cartLoading,
  addToCartNow,
  navigate,
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
    <div className="sz-pd-purchase-ctas mt-2">
      <button
        type="button"
        className="sz-purchase-btn buy-now"
        onClick={handleBuyNow}
        disabled={!inStock}
      >
        <FaBolt /> Buy Now
      </button>
      <button
        type="button"
        className="sz-purchase-btn add-to-cart"
        onClick={handleAddToCart}
        disabled={!inStock || cartLoading}
      >
        <FaShoppingCart /> {cartLoading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
