import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import { mediaUrl } from "../utils/mediaUrl";
import "./BestSellerCard.css";

const BestSellerCard = ({ product, index = 0 }) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlistBusy } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const imageSrc = mediaUrl(product.image) || "/no-image.png";
  const wishlisted = isWishlisted(product.id);
  const stockCount = Number(product.stock || 0);
  const inStock = stockCount > 0;
  
  // Brand name resolution: resolve nested object, string, or use first word of name
  const displayBrand = product.brand?.name || 
    (typeof product.brand === "string" ? product.brand : "") || 
    product.name?.split(" ")[0]?.toUpperCase() || 
    "SPORTZONE";

  const price = Number(product?.price || 0);
  const mrp = product?.original_price ? Number(product.original_price) : Math.round(price * 1.2);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Determine stock status details
  let stockBadgeText = "In Stock";
  let stockBadgeClass = "sz-bs-stock--in";
  if (!inStock) {
    stockBadgeText = "Out of Stock";
    stockBadgeClass = "sz-bs-stock--out";
  } else if (stockCount <= 3) {
    stockBadgeText = `Only ${stockCount} left`;
    stockBadgeClass = "sz-bs-stock--low";
  }

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      className="sz-bs-card d-flex flex-column h-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      {/* CARD IMAGE WRAPPER */}
      <div className="sz-bs-card__img-wrap position-relative overflow-hidden">


        {/* Wishlist Button */}
        <button
          type="button"
          className={`sz-bs-card__wishlist position-absolute top-0 end-0 m-3 z-3 d-flex align-items-center justify-content-center ${
            wishlisted ? "is-active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          disabled={wishlistBusy}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? (
            <FaHeart className="text-danger" size={16} />
          ) : (
            <FaRegHeart className="text-secondary" size={16} />
          )}
        </button>

        {/* Product Image */}
        <div className="sz-bs-card__img-container d-flex align-items-center justify-content-center h-100 w-100">
          <img
            src={imageSrc}
            alt={product.name || "Product"}
            className="sz-bs-card__img img-fluid"
            onError={(e) => {
              e.target.src = "/no-image.png";
            }}
          />
        </div>
      </div>

      {/* CARD BODY */}
      <div className="sz-bs-card__body d-flex flex-column flex-grow-1 p-3">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="sz-bs-card__brand text-uppercase">{displayBrand}</span>
        </div>

        {/* Product Name */}
        <h3 className="sz-bs-card__title mb-2 text-start" title={product.name}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="sz-bs-card__rating d-flex align-items-center gap-2 mb-3 text-start">
          <Rating value={product?.rating ?? 4.7} size={13} showValue={true} />
          <span className="text-muted small">({product?.reviews_count ?? 12})</span>
        </div>

        {/* Price Row */}
        <div className="sz-bs-card__price-row d-flex align-items-baseline gap-2 mb-4 mt-auto text-start">
          <span className="sz-bs-card__price">
            ₹{price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          {discount > 0 && (
            <span className="sz-bs-card__mrp text-muted text-decoration-line-through">
              ₹{mrp.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sz-bs-card__actions d-flex flex-column gap-2 mt-auto">
          {/* Add to Cart */}
          <button
            type="button"
            className="btn sz-bs-card__btn-cart d-flex align-items-center justify-content-center gap-2"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!inStock) return;
              try {
                setLoading(true);
                await addToCart({ product_id: product.id, size: "N/A", quantity: 1 });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !inStock}
          >
            <FaShoppingCart size={14} />
            {loading ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BestSellerCard;
