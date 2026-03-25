import React, { useState } from "react";
import { FaShoppingCart, FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useCart } from "../context/CartContext"; // 🔥 ADD THIS
import { useWishlist } from "../context/WishlistContext.jsx";
import { useNavigate } from "react-router-dom";
import './ProductCard.css';

const ProductCard = ({ product }) => {

  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart(); // 🔥 USE CONTEXT
  const { isWishlisted, toggleWishlist, wishlistBusy } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const categoryLabel = product.categoryLabel || product.category;
  const rawImage = product.image;
  const imageSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `http://127.0.0.1:8000${rawImage}`
    : "/no-image.png";

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);

      await addToCart(product.id);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="product-image-container bg-light position-relative">

        <span className="badge bg-white text-primary position-absolute top-0 start-0 m-3 shadow-sm rounded-pill fw-bold">
          {categoryLabel}
        </span>

        <img 
          src={imageSrc}
          alt={product.name || "Product"}
          className="card-img-top product-image p-4"
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />

        <div className="product-overlay d-flex align-items-center justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-light rounded-circle shadow-lg quick-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishlistBusy}
          >
            {wishlisted ? (
              <FaHeart className="text-primary" />
            ) : (
              <FaRegHeart className="text-primary" />
            )}
          </button>
          <button 
            className="btn btn-light rounded-circle shadow-lg quick-icon-btn"
            onClick={handleAddToCart}
            disabled={loading}
            aria-label="Quick add to cart"
          >
            <FaShoppingCart className="text-primary" />
          </button>
        </div>
      </div>
      
      <div className="card-body d-flex flex-column p-4">

        <div className="d-flex justify-content-between mb-2">
          <h5 className="fw-bold text-truncate">{product.name}</h5>
          <span className="text-warning">
            <FaStar /> 4.8
          </span>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">

        <span className="fw-bold text-primary">
  ₹{new Intl.NumberFormat('en-IN').format(product.price || 0)}
</span>

          <button 
            className="btn btn-primary rounded-pill px-4"
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;