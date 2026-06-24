import React, { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
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

  // Recommendations products list
  const [allProducts, setAllProducts] = useState([]);

  // Promo Code Coupons
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch all products for recommendations
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await API.get("products/");
        setAllProducts(unwrapList(res.data));
      } catch (err) {
        console.error("Error fetching recommended products:", err);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter recommendations (exclude items already in cart or saved)
  const filteredRecommendations = useMemo(() => {
    const cartProductIds = new Set(cartItems.map(item => item.product?.id));
    const savedProductIds = new Set(savedItems.map(item => item.product?.id));
    return allProducts.filter(p => !cartProductIds.has(p.id) && !savedProductIds.has(p.id));
  }, [allProducts, cartItems, savedItems]);

  // Split recommendations into "Frequently Bought Together" (first 4 items) and "You May Also Like" (next 8 items)
  const frequentlyBoughtTogether = useMemo(() => {
    return filteredRecommendations.slice(0, 4);
  }, [filteredRecommendations]);

  const youMayAlsoLike = useMemo(() => {
    return filteredRecommendations.slice(4, 12);
  }, [filteredRecommendations]);

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

  const platformFee = cartItems.length > 0 ? 29 : 0;
  const grandTotal = Math.max(0, cartTotal - couponDiscount + platformFee);
  const totalSavings = productDiscount + couponDiscount;

  // Delivery Estimate Date String Helper (3 days from today)
  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Recommendation Quick Add to Cart
  const handleAddRecToCart = async (product) => {
    const size = product.sizes?.[0]?.size || "M";
    await addToCart({ product_id: product.id, size, quantity: 1 });
  };

  const deliveryDay = getDeliveryEstimate();

  // RENDER EMPTY STATE (Only if Cart & Saved items are both empty)
  if ((!cartItems || cartItems.length === 0) && savedItems.length === 0) {
    return (
      <StoreShell showFooter={false}>
        <div className="sz-page">
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

            {/* RECOMMENDATIONS IN EMPTY STATE */}
            {allProducts.length > 0 && (
              <div className="sz-cart-recommendations-section mt-5 pt-4 border-top">
                <h2 className="sz-section-title mb-4">You May Also Like</h2>
                <div className="sz-recs-scroll-row">
                  {allProducts.slice(0, 8).map((product, idx) => (
                    <div key={product.id} className="sz-recs-scroll-col">
                      <ProductCard product={product} index={idx} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell showFooter={false}>
      <div className="sz-page">
        <div className="sz-page-inner container-fluid container-xl px-3 px-md-4">
          {/* Header Section */}
          <div className="sz-wishlist-header mb-4">
            <div>
              <span className="sz-kicker mb-1">YOUR SHOPPING BAG</span>
              <h1 className="display-6 fw-extrabold mb-0" style={{ color: "var(--sz-navy)", lineHeight: 1.1 }}>
                Shopping Cart
              </h1>
            </div>
            {cartItems.length > 0 && (
              <div className="sz-wishlist-count-badge">
                {cartItems.length === 1 ? "1 item" : `${cartItems.length} items`}
              </div>
            )}
          </div>

        <div className="row g-4 sz-cart-layout">
          {/* LEFT COLUMN: CART ITEMS & SAVED ITEMS */}
          <div className="col-lg-8 sz-cart-main-content">
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
                          <div className="row g-3 g-md-4">
                            {/* Product Image */}
                            <div className="col-4 col-sm-3 col-md-3 d-flex align-items-start justify-content-center">
                              <Link to={`/product/${item.product?.id}`} className="sz-cart-card-img-link w-100">
                                <img
                                  src={mediaUrl(item.product?.image) || "/no-image.png"}
                                  alt={item.product?.name}
                                  className="img-fluid rounded-3 bg-light p-2 sz-cart-card-img"
                                  onError={(e) => {
                                    e.target.src = "/no-image.png";
                                  }}
                                />
                              </Link>
                            </div>

                            {/* Details Column */}
                            <div className="col-8 col-sm-9 col-md-6">
                              <div className="d-flex flex-column h-100">
                                {/* Brand and Category */}
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span className="sz-cart-item-brand text-uppercase">{brandName}</span>
                                  <span className="brand-dot">·</span>
                                  <span className="sz-cart-item-category text-muted small">{item.product?.category}</span>
                                </div>

                                {/* Title */}
                                <Link to={`/product/${item.product?.id}`} className="sz-cart-item-title-link">
                                  <h2 className="sz-cart-item-title mb-2 text-truncate" title={item.product?.name}>
                                    {item.product?.name}
                                  </h2>
                                </Link>

                                {/* Product Description */}
                                {item.product?.description && (
                                  <p className="sz-cart-item-desc text-muted small mb-2 text-truncate-2-lines" title={item.product.description}>
                                    {item.product.description}
                                  </p>
                                )}

                                {/* Size & Stock Status */}
                                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                                  {(item.size || item.product?.size) && (
                                    <span className="sz-cart-meta-badge">
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

                                {/* Delivery Estimate */}
                                <div className="sz-delivery-estimate d-flex align-items-center gap-2 mb-3">
                                  <FaTruck className="text-muted" size={12} />
                                  <span className="text-muted small">
                                    Delivery by <strong className="text-dark">{deliveryDay}</strong>
                                  </span>
                                </div>

                                {/* Quantity Control & Action Buttons (Desktop View inline) */}
                                <div className="mt-auto d-none d-md-flex align-items-center gap-4">
                                  {/* Qty Control */}
                                  <div className="sz-qty-control-premium">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                                        else removeFromCart(item.id);
                                      }}
                                      aria-label="Decrease quantity"
                                    >
                                      <FaMinus size={10} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      aria-label="Increase quantity"
                                    >
                                      <FaPlus size={10} />
                                    </button>
                                  </div>

                                  {/* Actions divider */}
                                  <span className="action-divider">|</span>

                                  {/* Actions */}
                                  <div className="d-flex align-items-center gap-3">
                                    <button 
                                      type="button" 
                                      className="sz-item-action-btn delete-btn d-flex align-items-center gap-1.5" 
                                      onClick={() => removeFromCart(item.id)}
                                    >
                                      <FaTrashAlt size={12} /> Remove
                                    </button>
                                    <button 
                                      type="button" 
                                      className="sz-item-action-btn wishlist-btn d-flex align-items-center gap-1.5"
                                      onClick={() => handleMoveToWishlist(item)}
                                    >
                                      {isWishlisted(item.product?.id) ? <FaHeart className="text-danger" size={12} /> : <FaRegHeart size={12} />} 
                                      {isWishlisted(item.product?.id) ? "Wishlisted" : "Wishlist"}
                                    </button>
                                    <button 
                                      type="button" 
                                      className="sz-item-action-btn save-btn d-flex align-items-center gap-1.5"
                                      onClick={() => handleSaveForLater(item)}
                                    >
                                      <FaRegBookmark size={12} /> Save for later
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>

                            {/* Pricing Column */}
                            <div className="col-12 col-md-3 text-start text-md-end d-flex flex-column justify-content-between">
                              <div className="sz-cart-card-price-info">
                                <div className="d-flex align-items-baseline justify-content-start justify-content-md-end gap-2 mb-1">
                                  <span className="sz-cart-card-price fs-4 fw-bold text-dark">
                                    ₹{(price * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                  {discount > 0 && (
                                    <span className="sz-cart-card-mrp text-muted text-decoration-line-through small">
                                      ₹{(mrp * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                                {discount > 0 && (
                                  <div className="d-flex flex-wrap align-items-center justify-content-start justify-content-md-end gap-2">
                                    <span className="sz-cart-card-discount-pct text-success small fw-bold">
                                      {discount}% OFF
                                    </span>
                                    <span className="sz-cart-card-savings text-success-emphasis bg-success-subtle rounded px-1.5 py-0.5 small-xs">
                                      Save ₹{(savingsAmount * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Mobile View: Qty Controls and Actions row */}
                              <div className="mt-3 d-flex d-md-none flex-column gap-3 border-top pt-3 w-100">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="sz-qty-control-premium">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                                        else removeFromCart(item.id);
                                      }}
                                    >
                                      <FaMinus size={8} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                      <FaPlus size={8} />
                                    </button>
                                  </div>

                                  <div className="d-flex align-items-center gap-2">
                                    <button 
                                      type="button" 
                                      className="sz-item-action-btn delete-btn p-2" 
                                      onClick={() => removeFromCart(item.id)}
                                      aria-label="Remove"
                                    >
                                      <FaTrashAlt size={14} />
                                    </button>
                                    <button 
                                      type="button" 
                                      className="sz-item-action-btn wishlist-btn p-2"
                                      onClick={() => handleMoveToWishlist(item)}
                                      aria-label="Wishlist"
                                    >
                                      {isWishlisted(item.product?.id) ? <FaHeart className="text-danger" size={14} /> : <FaRegHeart size={14} />}
                                    </button>
                                    <button 
                                      type="button" 
                                      className="sz-item-action-btn save-btn p-2"
                                      onClick={() => handleSaveForLater(item)}
                                      aria-label="Save for later"
                                    >
                                      <FaRegBookmark size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
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
                                className="btn btn-outline-primary btn-sm rounded-pill flex-grow-1 py-1.5 px-3 fs-7 fw-bold"
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

            {/* RECOMMENDATIONS: FREQUENTLY BOUGHT TOGETHER */}
            {frequentlyBoughtTogether.length > 0 && (
              <div className="sz-frequently-bought-together mt-5">
                <h2 className="sz-section-title mb-3">Frequently Bought Together</h2>
                <div className="row g-3">
                  {frequentlyBoughtTogether.map((product) => {
                    const price = Number(product.price || 0);
                    const mrp = product.original_price ? Number(product.original_price) : Math.round(price * 1.2);
                    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                    const brandName = product.brand?.name || product.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE";

                    return (
                      <div key={product.id} className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-3">
                        <div className="sz-compact-rec-card d-flex flex-column h-100">
                          <Link to={`/product/${product.id}`} className="p-3 text-center bg-light rec-card-img-wrap">
                            <img
                              src={mediaUrl(product.image) || "/no-image.png"}
                              alt={product.name}
                              className="img-fluid"
                              style={{ height: "120px", objectFit: "contain" }}
                              onError={(e) => {
                                e.target.src = "/no-image.png";
                              }}
                            />
                          </Link>
                          <div className="p-3 d-flex flex-column flex-grow-1">
                            <span className="text-uppercase small-xs fw-bold text-muted mb-0.5">{brandName}</span>
                            <h3 className="compact-rec-title text-truncate mb-2" title={product.name}>
                              <Link to={`/product/${product.id}`}>{product.name}</Link>
                            </h3>
                            <div className="d-flex align-items-baseline gap-1.5 mt-auto mb-3">
                              <span className="fw-bold text-dark small">₹{price.toLocaleString("en-IN")}</span>
                              {discount > 0 && (
                                <span className="text-decoration-line-through text-muted small-xs">₹{mrp.toLocaleString("en-IN")}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-dark btn-sm rounded-pill w-100 py-1.5 fw-bold mt-auto"
                              onClick={() => handleAddRecToCart(product)}
                            >
                              Add to Bag
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS: YOU MAY ALSO LIKE */}
            {youMayAlsoLike.length > 0 && (
              <div className="sz-cart-recommendations-section mt-5">
                <h2 className="sz-section-title mb-3">You May Also Like</h2>
                <div className="sz-recs-scroll-row">
                  {youMayAlsoLike.map((product, idx) => (
                    <div key={product.id} className="sz-recs-scroll-col">
                      <ProductCard product={product} index={idx} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY (Only displays if Cart has items) */}
          <div className="col-lg-4 sz-cart-sidebar">
            {cartItems.length > 0 ? (
              <div className="sz-cart-summary-wrapper">
                
                {/* Coupon Code Section */}
                <div className="sz-coupon-summary-card mb-3 p-4">
                  <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                    <FaTag className="text-primary" /> Apply Promo Code
                  </h3>
                  {appliedCoupon ? (
                    <div className="applied-coupon-box p-3 rounded-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5">
                        <FaCheckCircle className="text-success" size={16} />
                        <div>
                          <strong className="text-dark d-block text-xs">{appliedCoupon.code}</strong>
                          <span className="text-success small-xs d-block">{appliedCoupon.description}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-link text-danger text-decoration-none fw-bold p-0"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control coupon-input rounded-pill px-3 flex-grow-1"
                        placeholder="SPORT10 or SZWELCOME"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-dark apply-coupon-btn rounded-pill px-3.5">
                        Apply
                      </button>
                    </form>
                  )}
                  {!appliedCoupon && (
                    <div className="mt-2.5 text-muted small-xs">
                      ⚡ Use <strong>SPORT10</strong> for 10% off or <strong>SZWELCOME</strong> for flat ₹150 off.
                    </div>
                  )}
                </div>

                {/* Sticky Order Details Card */}
                <div className="sz-cart-summary-card p-4">
                  <h2 className="h6 fw-bold mb-4">Order Summary</h2>
                  
                  <div className="d-flex justify-content-between mb-3.5">
                    <span className="text-muted">Items Total (MRP)</span>
                    <span className="text-dark fw-semibold">₹{itemsTotalMRP.toLocaleString("en-IN")}</span>
                  </div>

                  {productDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-3.5 text-success">
                      <span>Discount on MRP</span>
                      <span className="fw-bold">-₹{productDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-3.5">
                    <span className="text-muted">Delivery Charges</span>
                    <span className="text-success fw-bold d-flex align-items-center gap-1.5">
                      <span className="text-muted text-decoration-line-through fw-normal small-xs">₹99</span> FREE
                    </span>
                  </div>

                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-3.5 text-success">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span className="fw-bold">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-3.5">
                    <span className="text-muted d-flex align-items-center gap-1">
                      Platform Fee <FaInfoCircle size={10} title="Small handling fee to support peak operations" />
                    </span>
                    <span className="text-dark fw-semibold">₹{platformFee.toLocaleString("en-IN")}</span>
                  </div>

                  <hr className="my-3.5" />

                  <div className="d-flex justify-content-between fs-5 fw-bold mb-4 align-items-baseline">
                    <span className="text-dark">Grand Total</span>
                    <span className="fs-4 text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="sz-savings-alert mb-4 p-3 rounded-3 text-center">
                      <FaTag className="me-2" /> You saved <strong>₹{totalSavings.toLocaleString("en-IN")}</strong> on this order!
                    </div>
                  )}

                  {/* Checkout CTA */}
                  <button 
                    type="button" 
                    className="btn sz-premium-checkout-btn w-100 py-3.5 mb-4 d-flex align-items-center justify-content-center gap-2 fw-bold"
                    onClick={() => navigate("/checkout")}
                  >
                    <FaLock size={13} /> Proceed Securely
                  </button>

                  {/* Trust Highlights */}
                  <div className="sz-trust-indicators pt-3 border-top">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="d-flex align-items-center gap-2 text-muted small-xs">
                          <FaShieldAlt className="text-primary flex-shrink-0" size={13} />
                          <span>Secure Payments</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center gap-2 text-muted small-xs">
                          <FaTruck className="text-primary flex-shrink-0" size={13} />
                          <span>Free Delivery</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center gap-2 text-muted small-xs">
                          <FaUndo className="text-primary flex-shrink-0" size={13} />
                          <span>Easy Returns</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center gap-2 text-muted small-xs">
                          <FaCheckCircle className="text-primary flex-shrink-0" size={13} />
                          <span>Genuine Products</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* If Cart is empty but we have saved items, we don't display order summary. Instead, show quick shop stats */
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
