import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaRegHeart, FaHeart, FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import Rating from "../components/Rating";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import StoreShell from "../components/StoreShell";
import API from "../api";
import { mediaUrl } from "../utils/mediaUrl";
import "./Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const { wishlistProducts, wishlistLoading, toggleWishlist, wishlistBusy } = useWishlist();
  const { addToCart, cartLoading } = useCart();

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);

  const countText = wishlistProducts.length === 1 ? "1 item" : `${wishlistProducts.length} items`;

  // Load "You May Also Like" recommendations
  useEffect(() => {
    let mounted = true;
    const fetchRecommendations = async () => {
      try {
        setRecsLoading(true);
        // Get recently viewed IDs
        const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        // Get all products
        const res = await API.get("products/");
        const allProducts = Array.isArray(res.data) ? res.data : res.data?.results ?? [];

        // Exclude products that are currently in the wishlist
        const wishlistIds = wishlistProducts.map(p => p.id);
        const filtered = allProducts.filter(p => !wishlistIds.includes(p.id));

        // Sort: recently viewed products first, then others
        const sorted = [...filtered].sort((a, b) => {
          const aIndex = viewedIds.indexOf(a.id);
          const bIndex = viewedIds.indexOf(b.id);
          
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });

        if (mounted) {
          setRecommendedProducts(sorted.slice(0, 4));
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
  }, [wishlistProducts]);

  const handleBuyNow = (product) => {
    navigate("/checkout", { state: { product, size: "N/A", quantity: 1 } });
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
              {!wishlistLoading && wishlistProducts.length > 0 && (
                <div className="sz-wishlist-count-badge">
                  {countText}
                </div>
              )}
            </div>

            {/* Wishlist List Stack */}
            {wishlistLoading ? (
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
                <button 
                  type="button" 
                  className="btn sz-btn-sport px-4" 
                  onClick={() => navigate("/shop")}
                >
                  Explore Shop
                </button>
              </motion.div>
            ) : (
              <div className="sz-wishlist-list-wrap">
                {wishlistProducts.map((product) => {
                  const imageSrc = mediaUrl(product.image) || "/no-image.png";
                  const displayBrand = product.brand?.name || 
                    (typeof product.brand === "string" ? product.brand : "") || 
                    product.name?.split(" ")[0]?.toUpperCase() || 
                    "SPORTZONE";

                  const price = Number(product?.price || 0);
                  const mrp = product?.original_price ? Number(product.original_price) : Math.round(price * 1.2);
                  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                  const inStock = Number(product.stock || 0) > 0;

                  return (
                    <div className="sz-wishlist-row" key={product.id}>
                      {/* Left Column: Image wrapper */}
                      <div 
                        className="sz-wishlist-row__img-wrap"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <div className="sz-wishlist-row__discount-badge position-absolute top-0 start-0 m-2 z-3">
                            {discount}% OFF
                          </div>
                        )}

                        {/* Image Container */}
                        <div className="sz-wishlist-row__img-container">
                          <img 
                            src={imageSrc} 
                            alt={product.name} 
                            className="sz-wishlist-row__img"
                          />
                        </div>
                      </div>

                      {/* Middle Column: Details */}
                      <div className="sz-wishlist-row__details">
                        <span className="sz-wishlist-row__brand">{displayBrand}</span>
                        <h2 
                          className="sz-wishlist-row__title"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </h2>

                        {/* Rating row */}
                        {product?.reviews_count > 0 && (
                          <div className="sz-wishlist-row__rating">
                            <Rating value={product.rating} size={11} showValue={true} />
                            <span className="text-muted small ms-2">({product.reviews_count} {product.reviews_count === 1 ? "review" : "reviews"})</span>
                          </div>
                        )}

                        {/* Description */}
                        <p className="sz-wishlist-row__desc">
                          {product.description || "Premium athletic gear built for ultimate performance and comfort."}
                        </p>

                        {/* Price and Stock row */}
                        <div className="sz-wishlist-row__price-stock">
                          <div className="sz-wishlist-row__price-row">
                            <span className="sz-wishlist-row__price">₹{price.toLocaleString()}</span>
                            {discount > 0 && (
                              <span className="sz-wishlist-row__mrp">₹{mrp.toLocaleString()}</span>
                            )}
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
                          onClick={() => addToCart({ product_id: product.id, size: "N/A", quantity: 1 })}
                          disabled={!inStock || cartLoading}
                        >
                          <FaShoppingCart size={13} />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          className="sz-wishlist-btn-buy"
                          onClick={() => handleBuyNow(product)}
                          disabled={!inStock || cartLoading}
                        >
                          <span>Buy Now</span>
                        </button>
                        <button
                          type="button"
                          className="sz-wishlist-btn-remove"
                          onClick={() => toggleWishlist(product.id)}
                          disabled={wishlistBusy}
                        >
                          <FaTrashAlt size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
              ) : recommendedProducts.length > 0 ? (
                <div className="row g-4">
                  {recommendedProducts.map((product, index) => (
                    <div className="col-xl-3 col-lg-4 col-md-6 d-flex" key={product.id}>
                      <div className="w-100">
                        <ProductCard product={product} index={index} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  No recommendations available at this time.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default Wishlist;
