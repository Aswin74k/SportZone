import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaTrashAlt, 
  FaHeart, 
  FaRegHeart, 
  FaTag, 
  FaShoppingBag, 
  FaFire,
  FaChevronRight
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { mediaUrl } from "../utils/mediaUrl";
import StoreShell from "../components/StoreShell";
import { toast } from "react-toastify";
import API from "../api";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import "./Cart.css";

const getItemPricing = (product) => {
  const price = Number(product?.price || 0);
  const mrp = product?.original_price ? Number(product.original_price) : Math.round(price * 1.2);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp - price;
  const brandName = product?.brand?.name || product?.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE";
  return { price, mrp, discount, savings, brandName };
};

function Cart() {
  const { cartItems, fetchCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingViewed, setLoadingViewed] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRecentlyViewed = async () => {
      try {
        const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        if (viewedIds.length === 0) return;
        setLoadingViewed(true);
        const res = await API.get("products/");
        const allProducts = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        
        // Filter and sort according to the order of viewedIds
        const filtered = allProducts.filter(p => viewedIds.includes(p.id));
        const sorted = [...filtered].sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id));

        if (mounted) {
          setRecentlyViewed(sorted.slice(0, 8));
          setLoadingViewed(false);
        }
      } catch (e) {
        console.error("Error fetching recently viewed products:", e);
        if (mounted) setLoadingViewed(false);
      }
    };

    fetchRecentlyViewed();
    return () => { mounted = false; };
  }, []);

  // Fetch recommended products (best sellers or standard products as fallback)
  useEffect(() => {
    let mounted = true;
    const fetchRecommended = async () => {
      try {
        setLoadingRecommended(true);
        const res = await API.get("products/", { params: { is_best_seller: "true" } });
        const items = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        if (mounted) {
          if (items.length > 0) {
            setRecommendedProducts(items.slice(0, 8));
          } else {
            const fallbackRes = await API.get("products/");
            const fallbackItems = Array.isArray(fallbackRes.data) ? fallbackRes.data : fallbackRes.data?.results ?? [];
            setRecommendedProducts(fallbackItems.slice(0, 8));
          }
          setLoadingRecommended(false);
        }
      } catch (e) {
        console.error("Error fetching recommended products:", e);
        if (mounted) setLoadingRecommended(false);
      }
    };

    fetchRecommended();
    return () => { mounted = false; };
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

const handleMoveToWishlist = async (item) => {
  const productId = item.product?.id;

  if (!productId) return;

  if (isWishlisted(productId)) {
    // Already in wishlist → remove only from wishlist
    await toggleWishlist(productId);
    toast.success(`${item.product?.name || "Product"} removed from Wishlist!`);
  } else {
    // Not in wishlist → add to wishlist and remove from cart
    await toggleWishlist(productId);
    await removeFromCart(item.id);
    toast.success(`Moved ${item.product?.name || "Product"} to Wishlist!`);
  }
};

  // Calculations
  const itemsTotalMRP = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const { mrp } = getItemPricing(item.product);
      return total + (mrp * item.quantity);
    }, 0);
  }, [cartItems]);

  const productDiscount = useMemo(() => {
    return itemsTotalMRP - cartTotal;
  }, [itemsTotalMRP, cartTotal]);

  const grandTotal = cartTotal;
  const netSavings = itemsTotalMRP - grandTotal;

  // Reusable Carousel Render Helper
  const renderProductSection = (title, viewAllText, products, loading, keyPrefix, extraClasses = "mt-4") => {
    return (
      <section className={`sz-recently-viewed-section ${extraClasses}`}>
        <header className="sz-recently-viewed-header mb-4 d-flex justify-content-between align-items-center flex-row">
          <h2 className="sz-recently-viewed-title">{title}</h2>
          <Link to="/shop" className="sz-recently-viewed-view-all">
            {viewAllText} <span className="chevron">&gt;</span>
          </Link>
        </header>
        
        <div className="sz-recently-viewed-carousel-wrapper position-relative">
          <div className="sz-recently-viewed-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div className="sz-recently-viewed-item d-flex flex-column" key={`${keyPrefix}-skeleton-${idx}`}>
                  <div className="flex-grow-1">
                    <ProductCardSkeleton />
                  </div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <div className="sz-recently-viewed-item d-flex flex-column" key={`${keyPrefix}-${product.id}`}>
                  <div className="flex-grow-1">
                    <ProductCard product={product} index={index} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  };

  // RENDER EMPTY STATE (Only if Cart is empty)
  if (!cartItems || cartItems.length === 0) {
    return (
      <StoreShell showFooter={true}>
        <div className="sz-page sz-cart-page-bg">
          <div className="sz-page-inner container-fluid container-xl px-3 px-md-4 py-5">
            
            {/* Centered Layout for Empty State */}
            <div className="row g-4 justify-content-center mb-5">
              <div className="col-12 col-md-8 col-lg-6 d-flex">
                <motion.div 
                  className="sz-cart-empty-card w-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="sz-cart-empty-icon-wrap">
                    <div className="sz-cart-empty-glow" />
                    <div className="sz-cart-empty-circle-premium">
                      <svg className="sz-empty-bag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <span className="sz-cart-empty-kicker">YOUR SHOPPING BAG</span>
                  <h1 className="sz-cart-empty-title">Your Cart is Empty</h1>
                  <p className="sz-cart-empty-text-premium">
                    It looks like you haven't added anything yet. Discover our premium gear and elevate your performance today.
                  </p>
                  
                  <div className="d-flex flex-column flex-sm-row gap-3 w-100 justify-content-center mt-2">
                    <Link to="/shop" className="sz-empty-cart-shop-btn">
                      Explore Catalog <FaChevronRight size={12} className="arrow-icon" />
                    </Link>
                    <Link to="/wishlist" className="sz-empty-cart-wishlist-btn">
                      <FaHeart className="wishlist-icon me-2" /> View Wishlist
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="py-2" />
            {recentlyViewed.length > 0 ? (
              renderProductSection(
                <><FaFire className="text-danger me-2" /> Recently Viewed</>,
                "View all",
                recentlyViewed,
                loadingViewed,
                "viewed-empty"
              )
            ) : (
              renderProductSection(
                <><FaFire className="text-warning me-2 animate-pulse" /> Trending Products</>,
                "Explore all",
                recommendedProducts,
                loadingRecommended,
                "rec-empty"
              )
            )}

          </div>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell showFooter={true}>
      <div className="sz-page sz-cart-page-bg">
        <div className="sz-page-inner container-fluid container-xl px-3 px-md-4">
          <div className="row g-4 sz-cart-layout">
          {/* LEFT COLUMN: CART ITEMS */}
          <div className="col-lg-8 sz-cart-main-content">
            
            <div className="sz-cart-items-container-card mb-4">
              <div className="sz-cart-items-card-header d-flex justify-content-between align-items-center mb-3">
                <h1 className="sz-cart-card-title mb-0">
                  Shopping Cart
                </h1>
                {cartItems.length > 0 && (
                  <div className="sz-wishlist-count-badge">
                    {cartItems.length === 1 ? "1 item" : `${cartItems.length} items`}
                  </div>
                )}
              </div>
              
              <hr className="sz-cart-items-header-divider" />

              <div className="sz-cart-items-list d-flex flex-column">
                <AnimatePresence initial={false}>
                  {cartItems.map((item, index) => {
                    const { price, mrp, discount, savings, brandName } = getItemPricing(item.product);
                    const inStock = (item.product?.stock ?? 0) > 0;
                    const lowStock = (item.product?.stock ?? 0) > 0 && (item.product?.stock ?? 0) <= 5;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="sz-cart-item-row"
                      >
                        {index > 0 && <hr className="sz-cart-item-divider" />}
                        
                        <div className="sz-cart-item-row-content d-flex flex-column flex-md-row gap-4 align-items-start position-relative py-3">
                          
                          {/* Product Image */}
                          <div className="sz-cart-img-box d-flex align-items-center justify-content-center flex-shrink-0">
                            <Link to={`/product/${item.product?.id}`} className="w-100 h-100 d-flex align-items-center justify-content-center">
                              <img
                                src={mediaUrl(item.product?.image) || "/no-image.png"}
                                alt={item.product?.name}
                                className="sz-cart-img-content img-fluid"
                                onError={(e) => {
                                  e.target.src = "/no-image.png";
                                }}
                              />
                            </Link>
                          </div>

                          {/* Details & Actions (Center-Left Column) */}
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className="sz-cart-item-brand text-uppercase fw-bold text-primary" style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                                {brandName}
                              </span>
                              <span className="text-muted small">·</span>
                              <span className="text-muted small text-lowercase" style={{ fontSize: "0.85rem" }}>
                                {item.product?.category}
                              </span>
                            </div>

                            <Link to={`/product/${item.product?.id}`} className="text-decoration-none">
                              <h3 className="sz-cart-item-title fw-bold text-dark mb-1 text-truncate-1-line" style={{ fontSize: "1.15rem", letterSpacing: "-0.01em" }}>
                                {item.product?.name}
                              </h3>
                            </Link>

                            {item.product?.description && (
                              <p className="text-muted small mb-2 text-truncate-2-lines" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                                {item.product.description}
                              </p>
                            )}

                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                              {((item.size && item.size !== "N/A" && item.size !== "n/a") || (item.product?.size && item.product.size !== "N/A" && item.product.size !== "n/a")) && (
                                  <span className="sz-cart-meta-badge px-2.5 py-1" style={{ fontSize: "0.78rem" }}>
                                    Size: <strong>{item.size || item.product.size}</strong>
                                  </span>
                                )}
                              {lowStock ? (
                                <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2.5 py-1">
                                  Only {item.product.stock} left!
                                </span>
                              ) : inStock ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                                  In Stock
                                </span>
                              ) : (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1">
                                  Out of Stock
                                </span>
                              )}
                            </div>

                            {/* Quantity Selector & Actions row */}
                            <div className="d-flex align-items-center gap-3 flex-wrap mt-3 pt-2">
                              <div className="d-flex align-items-center gap-2">
                                <span className="sz-qty-label">Quantity:</span>
                                <div className="sz-qty-control-premium">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                                      else removeFromCart(item.id);
                                    }}
                                    aria-label="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="qty-value">{item.quantity}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                              <span className="text-muted">|</span>

                              <button 
                                type="button" 
                                className="sz-item-action-btn delete-btn d-flex align-items-center gap-1.5 border-0 bg-transparent text-muted small hover-danger"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <FaTrashAlt size={12} /> Remove
                              </button>

                              <button 
                                type="button" 
                                className="sz-item-action-btn wishlist-btn d-flex align-items-center gap-1.5 border-0 bg-transparent text-muted small hover-heart"
                                onClick={() => handleMoveToWishlist(item)}
                              >
                                {isWishlisted(item.product?.id) ? <FaHeart className="text-danger" size={12} /> : <FaRegHeart size={12} />} 
                                Wishlist
                              </button>
                            </div>

                          </div>

                          {/* Pricing Block (Right Column) */}
                          <div className="text-end d-flex flex-column align-items-end flex-shrink-0" style={{ minWidth: "120px" }}>
                            <span className="sz-cart-card-price fs-4 fw-bold text-dark d-block">
                              ₹{(price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            {discount > 0 && (
                              <div className="d-flex flex-column align-items-end mt-1 gap-1">
                                <span className="sz-cart-card-mrp text-muted text-decoration-line-through small" style={{ fontSize: "0.85rem" }}>
                                  ₹{(mrp * item.quantity).toLocaleString("en-IN")}
                                </span>
                                <span className="sz-cart-discount-savings text-success small fw-bold mt-1 d-block" style={{ fontSize: "0.8rem" }}>
                                  {discount}% OFF Save ₹{(savings * item.quantity).toLocaleString("en-IN")}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
          <div className="col-lg-4 sz-cart-sidebar">
            <div className="sz-cart-summary-wrapper">
              
              <div className="sz-cart-summary-card p-4">
                <h2 className="h6 fw-bold mb-4 uppercase tracking-wider text-dark" style={{ letterSpacing: "0.05em" }}>Order Summary</h2>
                
                {/* MRP (incl. of all taxes) */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">MRP (incl. of all taxes)</span>
                  <span className="text-dark fw-semibold">₹{itemsTotalMRP.toLocaleString("en-IN")}</span>
                </div>

                {/* Discounts */}
                {productDiscount > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-3 text-success">
                    <span className="text-muted small text-success">Discounts</span>
                    <span className="fw-bold">-₹{productDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <hr className="my-3" style={{ borderColor: "#e2e8f0" }} />
                <div className="d-flex justify-content-between align-items-center mb-3.5 pt-1">
                  <span className="text-dark fw-bold" style={{ fontSize: "0.95rem" }}>Total Amount</span>
                  <span className="fs-3 fw-extrabold text-dark">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Savings Alert Pill */}
                {netSavings > 0 && (
                  <div className="sz-savings-alert mb-4 p-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 text-success" style={{ background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.15)", fontSize: "0.82rem", fontWeight: "600" }}>
                    <FaTag size={12} />
                    <span>You'll save ₹{netSavings.toLocaleString("en-IN")} on this order!</span>
                  </div>
                )}

                <button 
                  type="button" 
                  className="sz-premium-checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>

              {/* Trust Strip */}
              <div className="sz-trust-strip p-3 bg-light rounded-3 border d-flex align-items-start gap-2.5">
                <FaShieldAlt className="text-success mt-0.5 flex-shrink-0" size={16} />
                <div className="small text-muted" style={{ fontSize: "0.76rem", lineHeight: "1.4" }}>
                  Safe and secure payments via <strong>Razorpay</strong>. Easy returns. 100% Authentic products.
                </div>
              </div>

            </div>
          </div>
        </div>

        {(loadingViewed || recentlyViewed.length > 0) && (
          renderProductSection(
            "Recently Viewed",
            "View all",
            recentlyViewed,
            loadingViewed,
            "viewed-active",
            "mt-5 pt-4 border-top"
          )
        )}

      </div>
    </div>
  </StoreShell>
  );
}

export default Cart;