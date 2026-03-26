import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlistBusy } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const rawImage = product.image;
  const imageSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `http://127.0.0.1:8000${rawImage}`
    : "/no-image.png";

  const wishlisted = isWishlisted(product.id);

  return (
    <div
      className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/product/${product.id}`);
      }}
    >

      <div className="product-image-container position-relative">
        <button
          type="button"
          className="wishlist-heart-btn position-absolute top-0 end-0 m-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishlistBusy}
        >
          {wishlisted ? (
            <FaHeart className="wishlist-heart-icon" />
          ) : (
            <FaRegHeart className="wishlist-heart-icon" />
          )}
        </button>

        <img
          src={imageSrc}
          alt={product.name || "Product"}
          className="card-img-top product-image"
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />
      </div>

      <div className="card-body d-flex flex-column p-4">

        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="fw-bold text-truncate me-3">{product.name}</h5>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Rating value={product?.rating ?? 4.8} size={14} showValue />
          <span className="fw-bold text-primary fs-5">
            ₹{Number(product?.price || 0).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        <button
          className="btn btn-primary rounded-pill w-100 fw-semibold"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              setLoading(true);
              await addToCart({
                product_id: product.id,
                size: "N/A",
                quantity: 1
              });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;