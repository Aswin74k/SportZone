import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FaRegHeart, FaShoppingCart, FaTrashAlt, FaChevronRight } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import Rating from "../components/Rating";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import StoreShell from "../components/StoreShell";
import API from "../api";
import { mediaUrl } from "../utils/mediaUrl";
import "./Wishlist.css";

function isPlaceholderProduct(product) {
  if (!product) return true;
  if (product.isLoading || product.pending || product.optimistic || product.loading) return true;
  if (typeof product.name === "string" && product.name.trim().toLowerCase() === "loading...") return true;
  // A real product always has a price; a bare optimistic stub typically won't.
  if (product.price === undefined || product.price === null) return true;
  return false;
}

function truncateDescription(text, maxLength = 50) {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return truncated.substring(0, lastSpace) + "...";
}

const WishlistRow = React.memo(function WishlistRow({
  product,
  onNavigate,
  onAddToCart,
  onBuyNow,
  onRemove,
  cartLoading,
  wishlistBusy,
}) {
  const imageSrc = mediaUrl(product.image) || "/no-image.png";
  const [imgLoaded, setImgLoaded] = useState(false);

  if (isPlaceholderProduct(product)) {
    return (
      <motion.div
        className="sz-wishlist-row align-items-center sz-wishlist-row--placeholder"
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="sz-wishlist-skel-img sz-wishlist-skel-img--shrink" />
        <div className="flex-grow-1">
          <div className="sz-wishlist-skel-line" />
          <div className="sz-wishlist-skel-line sz-wishlist-skel-line--title" />
          <div className="sz-wishlist-skel-line sz-wishlist-skel-line--desc" />
        </div>
      </motion.div>
    );
  }

  const displayBrand =
    product.brand?.name ||
    (typeof product.brand === "string" ? product.brand : "") ||
    product.name?.split(" ")[0]?.toUpperCase() ||
    "SPORTZONE";

  const price = Number(product?.price || 0);
  const mrp = product?.original_price ? Number(product.original_price) : Math.round(price * 1.2);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = Number(product.stock || 0) > 0;

  return (
    <motion.div
      className="sz-wishlist-row"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Left Column: Image wrapper */}
      <div className="sz-wishlist-row__img-wrap" onClick={() => onNavigate(product.id)}>
        {discount > 0 && (
          <div className="sz-wishlist-row__discount-badge position-absolute top-0 start-0 m-2 z-3">
            {discount}% OFF
          </div>
        )}
        <div className="sz-wishlist-row__img-container">
          {!imgLoaded && <div className="sz-wishlist-row__img-placeholder" />}
          <img
            src={imageSrc}
            alt={product.name}
            className={`sz-wishlist-row__img${imgLoaded ? " sz-wishlist-row__img--loaded" : ""}`}
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/no-image.png";
              setImgLoaded(true);
            }}
          />
        </div>
      </div>

      {/* Middle Column: Details */}
      <div className="sz-wishlist-row__details">
        <span className="sz-wishlist-row__brand">{displayBrand}</span>
        <h2 className="sz-wishlist-row__title" onClick={() => onNavigate(product.id)}>
          {product.name}
        </h2>

        {product?.reviews_count > 0 && (
          <div className="sz-wishlist-row__rating">
            <Rating value={product.rating} size={11} showValue={true} />
            <span className="text-muted small ms-2">
              ({product.reviews_count} {product.reviews_count === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        <p className="sz-wishlist-row__desc">
          {product.description
            ? (product.description.length > 70 ? product.description.slice(0, 70).trim() + "..." : product.description)
            : "Premium athletic gear built for ultimate performance and comfort."}
        </p>

        <div className="sz-wishlist-row__price-stock">
          <div className="sz-wishlist-row__price-row">
            <span className="sz-wishlist-row__price">₹{price.toLocaleString()}</span>
            {discount > 0 && <span className="sz-wishlist-row__mrp">₹{mrp.toLocaleString()}</span>}
          </div>

          <span className={`sz-wishlist-stock ${inStock ? "in-stock" : "out-stock"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Right Column: Actions block */}
      <div className="sz-wishlist-row__actions">
        <button
          type="button"
          className="sz-wishlist-btn-cart"
          onClick={() => onAddToCart(product.id)}
          disabled={!inStock || cartLoading}
        >
          <FaShoppingCart size={13} />
          <span>Add to Cart</span>
        </button>
        <button
          type="button"
          className="sz-wishlist-btn-buy"
          onClick={() => onBuyNow(product)}
          disabled={!inStock || cartLoading}
        >
          <span>Buy Now</span>
        </button>
        <button
          type="button"
          className="sz-wishlist-btn-remove"
          onClick={() => onRemove(product.id)}
          disabled={wishlistBusy}
        >
          <FaTrashAlt size={12} />
          <span>Remove</span>
        </button>
      </div>
    </motion.div>
  );
});

function Wishlist() {
  const navigate = useNavigate();
  const { wishlistProducts, wishlistLoading, toggleWishlist, wishlistBusy } = useWishlist();
  const { addToCart, cartLoading } = useCart();

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);


  const hasLoadedOnceRef = useRef(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!wishlistLoading) {
      hasLoadedOnceRef.current = true;
      setShowSkeleton(false);
    } else if (!hasLoadedOnceRef.current) {
      setShowSkeleton(true);
    }
  }, [wishlistLoading]);

  const countText = wishlistProducts.length === 1 ? "1 item" : `${wishlistProducts.length} items`;

  useEffect(() => {
    let mounted = true;
    const fetchRecommendations = async () => {
      try {
        setRecsLoading(true);
        const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const res = await API.get("products/");
        const allProducts = Array.isArray(res.data) ? res.data : res.data?.results ?? [];

        const sorted = [...allProducts].sort((a, b) => {
          const aIndex = viewedIds.indexOf(a.id);
          const bIndex = viewedIds.indexOf(b.id);

          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });

        if (mounted) {
          setRecommendedProducts(sorted);
          setRecsLoading(false);
        }
      } catch (e) {
        console.error("Error loading recommendations", e);
        if (mounted) setRecsLoading(false);
      }
    };

    fetchRecommendations();
    return () => {
      mounted = false;
    };
  }, []);

  const wishlistIds = new Set(wishlistProducts.map((p) => p.id));
  const visibleRecommendations = recommendedProducts.filter((p) => !wishlistIds.has(p.id)).slice(0, 6);

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product, size: "N/A", quantity: 1 } });
  };

  const handleAddToCart = (productId) => {
    addToCart({ product_id: productId, size: "N/A", quantity: 1 });
  };

  const handleRemove = (productId) => {
    toggleWishlist(productId);
  };

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <StoreShell>
      <div className="sz-page">
        <div className="sz-page-inner sz-wishlist-page-inner container-fluid container-xl px-3 px-md-4">
          <div className="sz-wishlist-wrapper">

            {/* Header Section */}
            <div className="sz-wishlist-header">
              <div>
                <span className="sz-kicker mb-1">My Collection</span>
                <h1 className="display-6 fw-extrabold mb-0 sz-wishlist-title">
                  Saved Wishlist
                </h1>
              </div>
              {!showSkeleton && wishlistProducts.length > 0 && (
                <div className="sz-wishlist-count-badge">{countText}</div>
              )}
            </div>

            {/* Wishlist List Stack */}
            {showSkeleton ? (
              <div className="sz-wishlist-list-wrap">
                {[1, 2, 3].map((i) => (
                  <div className="sz-wishlist-row align-items-center sz-wishlist-row--placeholder" key={i}>
                    <div className="sz-wishlist-skel-img" />
                    <div className="flex-grow-1">
                      <div className="sz-wishlist-skel-line" />
                      <div className="sz-wishlist-skel-line sz-wishlist-skel-line--title" />
                      <div className="sz-wishlist-skel-line sz-wishlist-skel-line--desc" />
                    </div>
                  </div>
                ))}
              </div>
            ) : wishlistProducts.length === 0 ? (
              <motion.div
                className="sz-wishlist-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="sz-wishlist-empty-icon-box">
                  <FaRegHeart size={32} />
                </div>
                <h2 className="sz-wishlist-empty-title">Your wishlist is empty</h2>
                <p className="sz-wishlist-empty-desc">
                  Explore our latest premium sports gear and tap the heart icon to save your favorite items here.
                </p>
                <button type="button" className="btn sz-btn-sport px-4" onClick={() => navigate("/shop")}>
                  Explore Shop
                </button>
              </motion.div>
            ) : (
              <div className="sz-wishlist-list-wrap">
                {wishlistProducts.map((product) => (
                  <WishlistRow
                    key={product.id}
                    product={product}
                    onNavigate={handleNavigateToProduct}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onRemove={handleRemove}
                    cartLoading={cartLoading}
                    wishlistBusy={wishlistBusy}
                  />
                ))}
              </div>
            )}

            {/* "You May Also Like" Recommendation Section */}
            <div className="sz-wishlist-recs-section">
              <div className="sz-wishlist-recs-header">
                <h2 className="sz-wishlist-recs-title mb-0">You May Also Like</h2>
                <Link to="/shop" className="sz-wishlist-recs-view-all">
                  <span>View All</span>
                  <FaChevronRight className="sz-view-all-chevron" size={11} />
                </Link>
              </div>

              {recsLoading ? (
                <div className="sz-wishlist-recs-grid">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : visibleRecommendations.length > 0 ? (
                <div className="sz-wishlist-recs-grid">
                  {visibleRecommendations.map((product, index) => (
                    <ProductCard product={product} index={index} key={product.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">No recommendations available at this time.</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default Wishlist;