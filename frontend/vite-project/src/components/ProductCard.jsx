import React, { useEffect, useState } from "react";
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
  const inStock = Number(product.stock || 0) > 0;

  // Clean neutral extraction of possible brand if API tags brands manually
  const displayBrand = product.brand || product.name.split(" ")[0].toUpperCase();

  return (
    <div
      className="amz-product-card d-flex flex-column bg-white h-100 position-relative rounded-0"
      onClick={() => navigate(`/product/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/product/${product.id}`);
      }}
    >
      <div className="product-image-container position-relative bg-white pt-4 pb-3 px-3 d-flex align-items-center justify-content-center">

        {/* Subtle Wishlist Tag */}
        <button
          type="button"
          className="wishlist-btn position-absolute top-0 end-0 m-2 mt-3 bg-white border rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-all"
          style={{ width: '32px', height: '32px' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishlistBusy}
        >
          {wishlisted ? (
            <FaHeart className="wishlist-icon text-danger" size={16} />
          ) : (
            <FaRegHeart className="wishlist-icon text-muted" size={16} />
          )}
        </button>

        <img
          src={imageSrc}
          alt={product.name || "Product"}
          className="amz-product-image"
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />
      </div>

      <div className="amz-product-details p-3 pt-2 d-flex flex-column flex-grow-1 bg-white border-top">
        <div className="fw-bold text-muted small text-uppercase tracking-wider mb-1">
          {displayBrand}
        </div>

        <h5 className="amz-product-title text-truncate-2 mb-1 text-dark fw-medium lh-sm">
          {product.name}
        </h5>

        <div className="d-flex align-items-center mb-2 gap-1">
          <Rating value={product?.rating ?? 4.8} size={15} showValue={false} />
          <span className="text-primary amz-rating-count ms-1 hover-underline pointer-cursor">(94)</span>
        </div>

        <div className="amz-price-container mt-auto mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-4 fw-bold text-dark lh-1">
              ₹{Number(product?.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
            {inStock && <img src="https://images-eu.ssl-images-amazon.com/images/G/31/marketing/fba/fba-badge_18px-2x._CB485936079_.png" alt="Fulfilled" height="15" className="ms-1" />}
          </div>
          <div className="small mt-1 text-muted">
            M.R.P: <span className="text-decoration-line-through">₹{Number((product?.price || 0) * 1.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span> (33% off)
          </div>
          {inStock ? (
            <div className="text-dark small fw-medium mt-1">Get it by <span className="fw-bold">Tomorrow</span></div>
          ) : (
            <div className="text-danger small mt-1 fw-medium">Currently unavailable.</div>
          )}
        </div>

        <button
          className={`btn w-100 fw-medium amz-add-btn rounded-pill border-0 ${inStock ? 'bg-warning text-dark' : 'bg-secondary text-white disabled'}`}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!inStock) return;
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
          disabled={loading || !inStock}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;