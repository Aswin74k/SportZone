import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaRegHeart, FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import Rating from "../components/Rating";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import StoreShell from "../components/StoreShell";
import API from "../api";
import { mediaUrl } from "../utils/mediaUrl";
import "./Wishlist.css";

/**
 * Single wishlist row, memoized so it only re-renders when its own
 * product data (or busy state) actually changes. This stops the whole
 * list from remounting/flickering whenever a *different* product's
 * wishlist status changes elsewhere on the page (e.g. from a
 * ProductCard in the "You May Also Like" section).
 */
/**
 * Detects a placeholder/optimistic item pushed into the wishlist array
 * before its real product data has come back from the server. Different
 * context implementations signal this differently, so we check the
 * common patterns rather than assuming one specific shape.
 */
function isPlaceholderProduct(product) {
  if (!product) return true;
  if (product.isLoading || product.pending || product.optimistic || product.loading) return true;
  if (typeof product.name === "string" && product.name.trim().toLowerCase() === "loading...") return true;
  // A real product always has a price; a bare optimistic stub typically won't.
  if (product.price === undefined || product.price === null) return true;
  return false;
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
        className="sz-wishlist-row align-items-center"
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{ opacity: 0.6 }}
      >
        <div style={{ width: 140, height: 140, background: "#f1f5f9", borderRadius: 12, flexShrink: 0 }} />
        <div className="flex-grow-1">
          <div style={{ height: 16, width: "30%", background: "#e2e8f0", marginBottom: 12, borderRadius: 4 }} />
          <div style={{ height: 24, width: "60%", background: "#e2e8f0", marginBottom: 12, borderRadius: 4 }} />
          <div style={{ height: 16, width: "80%", background: "#e2e8f0", borderRadius: 4 }} />
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
            className="sz-wishlist-row__img"
            style={{ opacity: imgLoaded ? 1 : 0 }}
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
          {product.description || "Premium athletic gear built for ultimate performance and comfort."}
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

  // Track whether we've completed the FIRST successful wishlist load.
  // Any subsequent background refetch (e.g. triggered by toggling a
  // heart icon anywhere on the page) will also flip `wishlistLoading`
  // to true in the context, but we no longer want that to blow away
  // the already-rendered list and show skeletons again — that's what
  // was causing the "refresh" flicker.
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

  // Load "You May Also Like" recommendations — runs once on mount only.
  // Intentionally NOT re-run when wishlistProducts changes; we filter
  // against the latest wishlist ids at render time instead, so toggling
  // a wishlist item never re-triggers this fetch/section.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wishlistIds = new Set(wishlistProducts.map((p) => p.id));
  const visibleRecommendations = recommendedProducts.filter((p) => !wishlistIds.has(p.id)).slice(0, 4);

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
        <div className="sz-page-inner container-fluid container-xl px-3 px-md-4">
          <div className="sz-wishlist-wrapper">

            {/* Header Section */}
            <div className="sz-wishlist-header">
              <div>
                <span className="sz-kicker mb-1">My Collection</span>
                <h1 className="display-6 fw-extrabold mb-0" style={{ color: "var(--sz-navy)", lineHeight: 1.1 }}>
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
                  <div className="sz-wishlist-row align-items-center" key={i} style={{ opacity: 0.6 }}>
                    <div style={{ width: 140, height: 140, background: "#f1f5f9", borderRadius: 12 }} />
                    <div className="flex-grow-1">
                      <div style={{ height: 16, width: "30%", background: "#e2e8f0", marginBottom: 12, borderRadius: 4 }} />
                      <div style={{ height: 24, width: "60%", background: "#e2e8f0", marginBottom: 12, borderRadius: 4 }} />
                      <div style={{ height: 16, width: "80%", background: "#e2e8f0", borderRadius: 4 }} />
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
              <h2 className="sz-wishlist-recs-title">You May Also Like</h2>

              {recsLoading ? (
                <div className="row g-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : visibleRecommendations.length > 0 ? (
                <div className="row g-4">
                  {visibleRecommendations.map((product, index) => (
                    <div className="col-xl-3 col-lg-4 col-md-6 d-flex" key={product.id}>
                      <div className="w-100">
                        <ProductCard product={product} index={index} />
                      </div>
                    </div>
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