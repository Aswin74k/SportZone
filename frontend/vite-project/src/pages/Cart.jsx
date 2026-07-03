import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaTrashAlt, 
  FaHeart, 
  FaRegHeart, 
  FaLock, 
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
import StoreShell from "../components/StoreShell";
import { toast } from "react-toastify";
import API from "../api";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
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

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingViewed, setLoadingViewed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRecentlyViewed = async () => {
      try {
        const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        if (viewedIds.length === 0) {
          return;
        }
        setLoadingViewed(true);
        const res = await API.get("products/");
        const allProducts = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        
        // Filter and sort according to the order of viewedIds
        const filtered = allProducts.filter(p => viewedIds.includes(p.id));
        const sorted = [...filtered].sort((a, b) => {
          return viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id);
        });

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
    return () => {
      mounted = false;
    };
  }, []);



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

  const grandTotal = cartTotal;
  const netSavings = itemsTotalMRP - grandTotal;

  // RENDER EMPTY STATE (Only if Cart & Saved items are both empty)
  if ((!cartItems || cartItems.length === 0) && savedItems.length === 0) {
    return (
      <StoreShell showFooter={true}>
      <div className="sz-page sz-cart-page-bg">
        <div className="sz-page-inner container-fluid container-xl px-3 px-md-4">
            <motion.div 
              className="sz-cart-empty-container text-center py-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="sz-cart-empty-card">
                <div className="sz-cart-empty-icon-wrap mb-4">
                  <div className="sz-cart-empty-glow" />
                  <div className="sz-cart-empty-circle">
                    <FaShoppingBag className="sz-empty-bag-icon" />
                    <span className="sz-empty-badge">0</span>
                  </div>
                </div>
                
                <span className="sz-cart-empty-kicker mb-2 d-inline-block">Your Cart</span>
                <h1 className="sz-cart-empty-title mb-3">Your Cart is Empty</h1>
                <p className="sz-cart-empty-text mb-4">
                  Looks like you haven't added any products to your cart yet. Explore our premium sports gear built for top-tier performance.
                </p>
                <Link to="/shop" className="sz-empty-cart-shop-btn">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>

            {(loadingViewed || recentlyViewed.length > 0) && (
              <section className="sz-recently-viewed-section mt-5 pt-4 border-top">
                <header className="sz-recently-viewed-header mb-4">
                  <h2 className="sz-recently-viewed-title">Recently Viewed</h2>
                </header>
                <div className="sz-recently-viewed-list">
                  {loadingViewed ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <div className="sz-recently-viewed-item d-flex flex-column" key={`viewed-empty-skeleton-${idx}`}>
                        <div className="flex-grow-1">
                          <ProductCardSkeleton />
                        </div>
                        <div className="sz-skeleton mt-2" style={{ height: "42px", width: "100%", borderRadius: "8px" }} />
                      </div>
                    ))
                  ) : (
                    recentlyViewed.map((product, index) => (
                      <div className="sz-recently-viewed-item d-flex flex-column" key={`viewed-empty-${product.id}`}>
                        <div className="flex-grow-1">
                          <ProductCard product={product} index={index} />
                        </div>
                        <button
                          type="button"
                          className="sz-add-to-cart-btn-recently mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ 
                              product_id: product.id, 
                              size: "M", 
                              quantity: 1 
                            });
                            toast.success(`${product.name} added to cart!`);
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
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
          {/* LEFT COLUMN: CART ITEMS & SAVED ITEMS */}
          <div className="col-lg-8 sz-cart-main-content">
            
            {/* White card container wrapping headers and items */}
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

              {cartItems.length > 0 ? (
                <div className="sz-cart-items-list d-flex flex-column">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item, index) => {
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
                              <span className="sz-cart-card-price fs-4 fw-bold text-dark d-block">
                                ₹{(price * item.quantity).toLocaleString("en-IN")}
                              </span>
                              {discount > 0 && (
                                <div className="d-flex flex-column align-items-end mt-1 gap-1">
                                  <span className="sz-cart-card-mrp text-muted text-decoration-line-through small" style={{ fontSize: "0.85rem" }}>
                                    ₹{(mrp * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                  <span className="sz-cart-discount-savings text-success small fw-bold mt-1 d-block" style={{ fontSize: "0.8rem" }}>
                                    {discount}% OFF Save ₹{(savingsAmount * item.quantity).toLocaleString("en-IN")}
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
              ) : (
                /* If Cart items is empty but we have Saved items, display a nice notification banner */
                <div className="alert alert-info border-0 rounded-3 mb-4 p-3 d-flex align-items-center gap-2.5">
                  <FaInfoCircle size={16} />
                  <span>All active products are saved. Move items from <strong>Saved for Later</strong> below to checkout.</span>
                </div>
              )}
            </div>

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
            ) : (
              <div className="sz-cart-summary-card p-4 text-center">
                <FaShoppingBag className="text-muted mb-3" size={32} />
                <h3 className="h6 fw-bold mb-2">No Active Order</h3>
                <p className="text-muted small mb-0">Active items in your cart will trigger price and shipping calculations.</p>
              </div>
            )}
          </div>
        </div>

        {(loadingViewed || recentlyViewed.length > 0) && (
          <section className="sz-recently-viewed-section mt-5 pt-4 border-top">
            <header className="sz-recently-viewed-header mb-4">
              <h2 className="sz-recently-viewed-title">Recently Viewed</h2>
            </header>
            <div className="sz-recently-viewed-list">
              {loadingViewed ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div className="sz-recently-viewed-item d-flex flex-column" key={`viewed-active-skeleton-${idx}`}>
                    <div className="flex-grow-1">
                      <ProductCardSkeleton />
                    </div>
                    <div className="sz-skeleton mt-2" style={{ height: "42px", width: "100%", borderRadius: "8px" }} />
                  </div>
                ))
              ) : (
                recentlyViewed.map((product, index) => (
                  <div className="sz-recently-viewed-item d-flex flex-column" key={`viewed-active-${product.id}`}>
                    <div className="flex-grow-1">
                      <ProductCard product={product} index={index} />
                    </div>
                    <button
                      type="button"
                      className="sz-add-to-cart-btn-recently mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({ 
                          product_id: product.id, 
                          size: "M", 
                          quantity: 1 
                        });
                        toast.success(`${product.name} added to cart!`);
                      }}
                    >
                      Add to cart
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  </StoreShell>
  );
}

export default Cart;
