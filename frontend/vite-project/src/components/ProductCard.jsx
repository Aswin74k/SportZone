import { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import Rating from "./Rating";
import { mediaUrl } from "../utils/mediaUrl";
import "./ProductCard.css";

const ProductCard = ({ product, index = 0 }) => {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlistBusy } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const imageSrc = mediaUrl(product.image) || "/no-image.png";
  const wishlisted = isWishlisted(product.id);
  const inStock = Number(product.stock || 0) > 0;
  const displayBrand = product.brand?.name || (typeof product.brand === "string" ? product.brand : "") || product.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE";
  const price = Number(product?.price || 0);
  const mrp = product?.original_price ? Number(product.original_price) : Math.round(price * 1.2);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <motion.article
      className="sz-product-card h-100 d-flex flex-column"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => navigate(`/product/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.id}`)}
    >
      <div className="sz-product-card__img-wrap">
        {discount > 0 && <span className="sz-badge-deal position-absolute top-0 start-0 m-2">{discount}% OFF</span>}

        <motion.button
          type="button"
          className={`sz-product-card__wishlist ${wishlisted ? "is-active" : ""}`}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishlistBusy}
        >
          {wishlisted ? <FaHeart className="text-danger" size={16} /> : <FaRegHeart className="text-secondary" size={16} />}
        </motion.button>

        <img
          src={imageSrc}
          alt={product.name || "Product"}
          className="sz-product-card__img"
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />
      </div>

      <div className="sz-product-card__body">
        <span className="sz-product-card__brand">{displayBrand}</span>
        <h3 className="sz-product-card__title">{product.name}</h3>

        <div className="sz-product-card__rating d-flex align-items-center gap-1">
          <Rating value={product?.rating ?? 4.5} size={14} showValue={false} />
          <span className="text-muted">· SportZone pick</span>
        </div>

        <div className="sz-product-card__price-row">
          <div className="d-flex align-items-baseline gap-2 flex-wrap">
            <span className="sz-product-card__price">₹{price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            {discount > 0 && <span className="sz-product-card__mrp">₹{mrp.toLocaleString("en-IN")}</span>}
          </div>
          <div className="mt-1">
            {!inStock && (
              <span className="sz-badge-stock sz-badge-stock--out">Out of stock</span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="sz-product-card__add"
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
          {loading ? "Adding…" : inStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </motion.article>
  );
};

export default ProductCard;
