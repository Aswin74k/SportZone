import React from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import { mediaUrl } from "../utils/mediaUrl";
import "./ProductCard.css";

const ProductCard = ({ product, index = 0 }) => {
  const { isWishlisted, toggleWishlist, wishlistBusy } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const imageSrc = mediaUrl(product.image) || "/no-image.png";
  const wishlisted = isWishlisted(product.id);
  
  // Brand name resolution
  const displayBrand = product.brand?.name || 
    (typeof product.brand === "string" ? product.brand : "") || 
    product.name?.split(" ")[0]?.toUpperCase() || 
    "SPORTZONE";

  const price = Number(product?.price || 0);
  const mrp = product?.original_price ? Number(product.original_price) : Math.round(price * 1.2);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      className="sz-product-card d-flex flex-column h-100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      {/* CARD IMAGE WRAPPER */}
      <div className="sz-product-card__img-wrap position-relative overflow-hidden">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="sz-product-card__discount-badge position-absolute top-0 start-0 m-3 z-3">
            {discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`sz-product-card__wishlist position-absolute top-0 end-0 m-3 z-3 d-flex align-items-center justify-content-center ${
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
            <FaHeart className="text-danger" size={15} />
          ) : (
            <FaRegHeart className="text-secondary" size={15} />
          )}
        </button>

        {/* Product Image */}
        <div className="sz-product-card__img-container d-flex align-items-center justify-content-center h-100 w-100">
          <img
            src={imageSrc}
            alt={product.name || "Product"}
            className="sz-product-card__img img-fluid"
            onError={(e) => {
              e.target.src = "/no-image.png";
            }}
          />
        </div>
      </div>

      {/* CARD BODY */}
      <div className="sz-product-card__body d-flex flex-column flex-grow-1 p-3 text-start">
        {/* Brand Row */}
        <div className="mb-1">
          <span className="sz-product-card__brand text-uppercase">{displayBrand}</span>
        </div>

        {/* Product Name */}
        <h3 className="sz-product-card__title mb-2" title={product.name}>
          {product.name}
        </h3>

        {/* Price Row & Rating */}
        <div className="sz-product-card__price-row d-flex align-items-center justify-content-between mt-auto">
          <div className="d-flex align-items-baseline gap-2">
            <span className="sz-product-card__price">
              ₹{price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
            {discount > 0 && (
              <span className="sz-product-card__mrp text-muted text-decoration-line-through">
                ₹{mrp.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="sz-product-card__rating-badge d-flex align-items-center gap-1">
              <span className="sz-rating-star">★</span>
              <span className="sz-rating-val">{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
