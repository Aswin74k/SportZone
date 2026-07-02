import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaTruck, 
  FaTrashAlt, 
  FaHeart, 
  FaRegHeart, 
  FaLock, 
  FaCheckCircle, 
  FaUndo, 
  FaBookmark, 
  FaRegBookmark,
  FaTag, 
  FaInfoCircle, 
  FaShoppingBag, 
  FaPlus, 
  FaMinus
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { mediaUrl } from "../utils/mediaUrl";
import { unwrapList } from "../utils/unwrapList";
import API from "../api";
import StoreShell from "../components/StoreShell";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import "./Cart.css";

function Cart() {
  const { cartItems, fetchCart, removeFromCart, updateQuantity, cartTotal, addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  // Local storage based Saved for Later items
  const [savedItems, setSavedItems] = useState(() => {
    const stored = localStorage.getItem("sportzone_saved_for_later");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing saved items from local storage", e);
      }
    }
    return [];
  });

  // Promo Code Coupons
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Save for Later actions
  const handleSaveForLater = (item) => {
    const alreadySaved = savedItems.some(
      saved => saved.product?.id === item.product?.id && saved.size === item.size
    );

    if (!alreadySaved) {
      const updated = [...savedItems, item];
      setSavedItems(updated);
      localStorage.setItem("sportzone_saved_for_later", JSON.stringify(updated));
    }
    removeFromCart(item.id);
    toast.success(`${item.product?.name || "Product"} saved for later!`);
  };

  const handleMoveToCart = async (item) => {
    await addToCart({ 
      product_id: item.product?.id, 
      size: item.size || "M", 
      quantity: item.quantity || 1 
    });
    const updated = savedItems.filter(
      saved => !(saved.product?.id === item.product?.id && saved.size === item.size)
    );
    setSavedItems(updated);
    localStorage.setItem("sportzone_saved_for_later", JSON.stringify(updated));
  };

  const handleRemoveFromSaved = (item) => {
    const updated = savedItems.filter(
      saved => !(saved.product?.id === item.product?.id && saved.size === item.size)
    );
    setSavedItems(updated);
    localStorage.setItem("sportzone_saved_for_later", JSON.stringify(updated));
    toast.info("Removed from saved items");
  };

  const handleMoveToWishlist = async (item) => {
    if (!isWishlisted(item.product?.id)) {
      await toggleWishlist(item.product?.id);
    }
    removeFromCart(item.id);
    toast.success(`Moved ${item.product?.name || "Product"} to Wishlist!`);
  };

  const handleSavedToWishlist = async (item) => {
    if (!isWishlisted(item.product?.id)) {
      await toggleWishlist(item.product?.id);
    }
    const updated = savedItems.filter(
      saved => !(saved.product?.id === item.product?.id && saved.size === item.size)
    );
    setSavedItems(updated);
    localStorage.setItem("sportzone_saved_for_later", JSON.stringify(updated));
    toast.success(`Moved ${item.product?.name || "Product"} to Wishlist!`);
  };

  // Coupons Applying
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === "SPORT10") {
      setAppliedCoupon({
        code: "SPORT10",
        type: "percent",
        value: 10,
        description: "10% OFF Coupon Applied!"
      });
      toast.success("SPORT10 coupon applied successfully!");
      setCouponInput("");
    } else if (code === "SZWELCOME") {
      setAppliedCoupon({
        code: "SZWELCOME",
        type: "flat",
        value: 150,
        description: "Flat ₹150 OFF Welcome Coupon!"
      });
      toast.success("SZWELCOME coupon applied successfully!");
      setCouponInput("");
    } else {
      toast.error("Invalid Coupon Code. Try SPORT10 or SZWELCOME!");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  // Calculations
  const itemsTotalMRP = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.product?.price || 0);
      const mrp = item.product?.original_price ? Number(item.product.original_price) : Math.round(price * 1.2);
      return total + (mrp * item.quantity);
    }, 0);
  }, [cartItems]);

  const productDiscount = useMemo(() => {
    return itemsTotalMRP - cartTotal;
  }, [itemsTotalMRP, cartTotal]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.code === "SPORT10") {
      return Math.round(cartTotal * 0.1);
    }
    if (appliedCoupon.code === "SZWELCOME") {
      return Math.min(cartTotal, 150);
    }
    return 0;
  }, [appliedCoupon, cartTotal]);

  const platformFee = 0;
  const grandTotal = cartTotal;
  const netSavings = itemsTotalMRP - grandTotal;

  // Delivery Estimate Date String Helper (3 days from today)
  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const deliveryDay = getDeliveryEstimate();

  // RENDER EMPTY STATE (Only if Cart & Saved items are both empty)
  if ((!cartItems || cartItems.length === 0) && savedItems.length === 0) {
    return (
      <StoreShell showFooter={true}>
      <div className="sz-page sz-cart-page-bg">
        <div className="sz-page-inner container-fluid container-xl px-3 px-md-4">
            <motion.div 
              className="sz-cart-empty-section text-center py-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="sz-cart-empty-illustration mb-4">
                <div className="illustration-bag-wrap">
                  <FaShoppingBag className="bag-icon" />
                  <div className="empty-badge">0</div>
                </div>
              </div>
              <h1 className="h3 fw-bold mb-2">Your Cart is Empty</h1>
              <p className="text-muted mb-4 max-w-md mx-auto">
                Looks like you haven't added any products to your cart yet. Explore our premium sports gear built for top-tier performance.
              </p>
              <Link to="/shop" className="btn sz-empty-cart-shop-btn px-5 py-3">
                Continue Shopping
              </Link>
            </motion.div>

            {/* Recommendations removed */}
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
          {/* LEFT COLUMN: CART ITEMS & SAVED ITEMS */}
          <div className="col-lg-8 sz-cart-main-content">
            {/* Header Section (Moved inside Left Column) */}
            <div className="sz-wishlist-header mb-4">
              <div>
                <h1 className="display-6 fw-extrabold mb-0 text-uppercase" style={{ color: "var(--sz-navy)", lineHeight: 1.1, fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
                  SHOPPING BAG
                </h1>
              </div>
              {cartItems.length > 0 && (
                <div className="sz-wishlist-count-badge">
                  {cartItems.length === 1 ? "1 item" : `${cartItems.length} items`}
                </div>
              )}
            </div>

            {cartItems.length > 0 ? (
              <div className="d-flex flex-column gap-3 mb-4">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => {
                    const price = Number(item.product?.price || 0);
                    const mrp = item.product?.original_price ? Number(item.product.original_price) : Math.round(price * 1.2);
                    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                    const savingsAmount = mrp - price;
                    const inStock = (item.product?.stock ?? 0) > 0;
                    const lowStock = (item.product?.stock ?? 0) > 0 && (item.product?.stock ?? 0) <= 5;
                    const brandName = item.product?.brand?.name || item.product?.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE";

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="sz-premium-cart-card"
                      >
                        <div className="card-body p-3 p-md-4">
                          <div className="d-flex flex-column flex-md-row gap-4 align-items-start position-relative">
                            
                            {/* Product Image */}
                            <div className="sz-cart-img-box bg-light rounded-3 d-flex align-items-center justify-content-center p-2 flex-shrink-0">
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
                                <span className="sz-cart-item-brand text-uppercase fw-extrabold text-primary" style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                                  {brandName}
                                </span>
                                <span className="text-muted small">·</span>
                                <span className="text-muted small text-lowercase" style={{ fontSize: "0.8rem" }}>
                                  {item.product?.category}
                                </span>
                              </div>

                              <Link to={`/product/${item.product?.id}`} className="text-decoration-none">
                                <h3 className="sz-cart-item-title fw-bold text-dark mb-2 text-truncate-1-line" style={{ fontSize: "1.15rem", letterSpacing: "-0.01em" }}>
                                  {item.product?.name}
                                </h3>
                              </Link>

                              {item.product?.description && (
                                <p className="text-muted small mb-2 text-truncate-2-lines" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                                  {item.product.description}
                                </p>
                              )}

                              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                {(item.size || item.product?.size) && (
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

                              {/* Delivery estimate tag */}
                              <div className="sz-delivery-estimate-pill d-flex align-items-center gap-2 mb-3 px-3 py-1.5 bg-light rounded-pill border" style={{ width: "fit-content" }}>
                                <FaTruck className="text-muted" size={12} />
                                <span className="text-muted small" style={{ fontSize: "0.78rem" }}>
                                  Delivery by <strong className="text-dark">{deliveryDay}</strong>
                                </span>
                              </div>

                              {/* Quantity Selector & Actions row */}
                              <div className="d-flex align-items-center gap-3 flex-wrap mt-3 pt-2 border-top">
                                <div className="sz-qty-control-premium">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                                      else removeFromCart(item.id);
                                    }}
                                    aria-label="Decrease quantity"
                                  >
                                    <FaMinus size={8} />
                                  </button>
                                  <span className="qty-value">{item.quantity}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label="Increase quantity"
                                  >
                                    <FaPlus size={8} />
                                  </button>
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

                                <button 
                                  type="button" 
                                  className="sz-item-action-btn save-btn d-flex align-items-center gap-1.5 border-0 bg-transparent text-muted small hover-bookmark"
                                  onClick={() => handleSaveForLater(item)}
                                >
                                  <FaRegBookmark size={12} /> Save for later
                                </button>
                              </div>
                            </div>

                            {/* Pricing Block (Right Column) */}
                            <div className="text-end d-flex flex-column align-items-end flex-shrink-0" style={{ minWidth: "120px" }}>
                              <span className="sz-cart-card-price fs-4 fw-extrabold text-dark d-block">
                                ₹{(price * item.quantity).toLocaleString("en-IN")}
                              </span>
                              {discount > 0 && (
                                <div className="d-flex flex-column align-items-end mt-1 gap-1">
                                  <span className="sz-cart-card-mrp text-muted text-decoration-line-through small" style={{ fontSize: "0.8rem" }}>
                                    ₹{(mrp * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                  <div className="d-flex align-items-center gap-1 flex-wrap justify-content-end">
                                    <span className="text-success small fw-bold" style={{ fontSize: "0.78rem" }}>
                                      {discount}% OFF
                                    </span>
                                    <span className="text-success-emphasis bg-success-subtle rounded-pill px-2.5 py-0.5" style={{ fontSize: "0.72rem" }}>
                                      Save ₹{(savingsAmount * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* If Cart items is empty but we have Saved items, display a nice notification banner */
              <div className="alert alert-info border-0 rounded-3 mb-4 p-3 d-flex align-items-center gap-2.5">
                <FaInfoCircle size={16} />
                <span>All active products are saved. Move items from <strong>Saved for Later</strong> below to checkout.</span>
              </div>
            )}

            {/* SAVED FOR LATER SECTION */}
            {savedItems.length > 0 && (
              <div className="sz-saved-for-later-section mt-5">
                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <h2 className="sz-section-title h5 mb-0">Saved for Later</h2>
                  <span className="text-muted">({savedItems.length} items)</span>
                </div>
                <div className="row g-3">
                  {savedItems.map((item) => {
                    const price = Number(item.product?.price || 0);
                    const mrp = item.product?.original_price ? Number(item.product.original_price) : Math.round(price * 1.2);
                    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                    const brandName = item.product?.brand?.name || item.product?.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE";

                    return (
                      <div key={`${item.product?.id}-${item.size}`} className="col-12 col-md-6">
                        <div className="sz-saved-item-card">
                          <div className="card-body p-3">
                            <div className="d-flex gap-3">
                              {/* Image */}
                              <div style={{ width: "90px", height: "90px" }} className="flex-shrink-0 bg-light p-1.5 rounded-2 d-flex align-items-center justify-content-center">
                                <img
                                  src={mediaUrl(item.product?.image) || "/no-image.png"}
                                  alt={item.product?.name}
                                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                                  onError={(e) => {
                                    e.target.src = "/no-image.png";
                                  }}
                                />
                              </div>
                              {/* Content details */}
                              <div className="flex-grow-1 min-w-0">
                                <span className="text-uppercase small fw-bold text-muted d-block mb-0.5">{brandName}</span>
                                <h3 className="sz-saved-item-title text-truncate mb-1.5" title={item.product?.name}>
                                  {item.product?.name}
                                </h3>
                                {/* Product Description */}
                                {item.product?.description && (
                                  <p className="sz-saved-item-desc text-muted small-xs mb-1.5 text-truncate-1-line" title={item.product.description}>
                                    {item.product.description}
                                  </p>
                                )}
                                <p className="small text-muted mb-2">Size: <strong>{item.size || "M"}</strong> · Qty: <strong>{item.quantity || 1}</strong></p>
                                
                                <div className="d-flex align-items-baseline gap-2 mb-3">
                                  <span className="fw-bold text-dark">₹{price.toLocaleString("en-IN")}</span>
                                  {discount > 0 && (
                                    <>
                                      <span className="text-decoration-line-through text-muted small-xs">₹{mrp.toLocaleString("en-IN")}</span>
                                      <span className="text-success small-xs fw-bold">{discount}% OFF</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Saved actions */}
                            <div className="d-flex gap-2 pt-2.5 border-top mt-1">
                              <button 
                                type="button" 
                                className="btn btn-outline-dark btn-sm rounded-pill flex-grow-1 py-1.5 px-3 fs-7 fw-bold"
                                onClick={() => handleMoveToCart(item)}
                              >
                                Move to Cart
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-link btn-sm text-danger text-decoration-none fs-7"
                                onClick={() => handleRemoveFromSaved(item)}
                              >
                                Remove
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-link btn-sm text-secondary p-1"
                                onClick={() => handleSavedToWishlist(item)}
                                aria-label="Add to Wishlist"
                              >
                                <FaRegHeart size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations sections removed */}
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY (Only displays if Cart has items) */}
          <div className="col-lg-4 sz-cart-sidebar">
            {cartItems.length > 0 ? (
              <div className="sz-cart-summary-wrapper">
                
                {/* Sticky Order Details Card */}
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

                  {/* Total Amount */}
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

                  {/* Checkout CTA */}
                  <button 
                    type="button" 
                    className="btn sz-premium-checkout-btn w-100 py-3.5 d-flex align-items-center justify-content-center gap-2 fw-bold"
                    onClick={() => navigate("/checkout")}
                  >
                    <FaLock size={12} /> Proceed Securely
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
            ) : (
              <div className="sz-cart-summary-card p-4 text-center">
                <FaShoppingBag className="text-muted mb-3" size={32} />
                <h3 className="h6 fw-bold mb-2">No Active Order</h3>
                <p className="text-muted small mb-0">Active items in your cart will trigger price and shipping calculations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </StoreShell>
  );
}

export default Cart;
