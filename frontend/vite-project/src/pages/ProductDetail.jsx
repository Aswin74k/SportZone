import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import Rating from "../components/Rating";
import StoreShell from "../components/StoreShell";
import ProductCard from "../components/ProductCard";
import { mediaUrl } from "../utils/mediaUrl";
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaCheck,
  FaLock,
  FaTimes,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaBolt,
  FaRegCopy,
  FaInfoCircle,
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";
import { FiThumbsUp } from "react-icons/fi";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Core Product Data states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // Interactive UI states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [copiedOfferIndex, setCopiedOfferIndex] = useState(null);

  // Accordion tabs state
  const [activeTab, setActiveTab] = useState("description");

  // Pincode checker states
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [deliveryText, setDeliveryText] = useState("");

  // FBT bundle state
  const [fbtCheckedItems, setFbtCheckedItems] = useState({ 0: true, 1: true });
  const [bundleLoading, setBundleLoading] = useState(false);

  // Review states
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [onlyWithImagesFilter, setOnlyWithImagesFilter] = useState(false);
  const [votedReviews, setVotedReviews] = useState({});
  const [activeLightboxReviewImage, setActiveLightboxReviewImage] = useState(null);

  // Load product main details
  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`products/${id}/`);
        if (!mounted) return;

        const data = res.data;
        setProduct(data);

        // Save to recently viewed
        try {
          const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const filtered = viewed.filter((idVal) => Number(idVal) !== Number(data.id));
          filtered.unshift(data.id);
          localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 8)));
        } catch (e) {
          console.error("Error saving recently viewed", e);
        }

        const first = mediaUrl(data?.images?.[0]?.image || data?.image) || "/no-image.png";
        setSelectedImage(first);
        setIsZoomed(false);
        setSelectedSize(null);
        setQty(1);

        // Fetch related category products
        if (data?.category) {
          const relatedRes = await API.get(
            `products/?category=${encodeURIComponent(data.category)}`
          );
          const related = (Array.isArray(relatedRes.data) ? relatedRes.data : [])
            .filter((p) => p.id !== data.id)
            .slice(0, 6);
          if (mounted) setRelatedProducts(related);
        }
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Load reviews
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    API.get(`reviews/?product=${id}`)
      .then((res) => {
        if (!mounted) return;
        const d = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setReviews(d);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id]);

  // Load Wishlist state
  useEffect(() => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlisted(wishlist.includes(product.id));
  }, [product]);

  // Load Recently Viewed Products detail info
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        if (viewedIds.length <= 1) return; // Only current product is viewed

        const res = await API.get("products/");
        const all = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        const matched = all
          .filter((p) => viewedIds.includes(p.id) && p.id !== product?.id)
          .sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id))
          .slice(0, 6);

        setRecentlyViewedProducts(matched);
      } catch (e) {
        console.error("Error loading recently viewed", e);
      }
    };

    if (product) {
      fetchRecentlyViewed();
    }
  }, [product]);

  // Image Gallery compute
  const gallery = useMemo(() => {
    if (!product) return [];
    const fromGallery = (product.images || []).map((img) => mediaUrl(img.image)).filter(Boolean);
    const primary = product.image ? [mediaUrl(product.image)] : [];
    return [...new Set([...primary, ...fromGallery])];
  }, [product]);

  // FBT bundle items compute (uses category products as FBT bundle choices)
  const fbtItems = useMemo(() => {
    if (relatedProducts.length >= 2) {
      return relatedProducts.slice(0, 2);
    }
    return [];
  }, [relatedProducts]);

  // FBT pricing calculations
  const fbtPricing = useMemo(() => {
    if (!product) return { current: 0, mrp: 0, discount: 0, savings: 0 };
    let current = Number(product.price);
    let mrp = Math.round(Number(product.price) * 1.25);

    fbtItems.forEach((item, index) => {
      if (fbtCheckedItems[index]) {
        current += Number(item.price);
        mrp += Math.round(Number(item.price) * 1.25);
      }
    });

    return {
      current,
      mrp,
      discount: mrp > current ? Math.round(((mrp - current) / mrp) * 100) : 0,
      savings: mrp - current
    };
  }, [product, fbtItems, fbtCheckedItems]);

  // Toggle FBT items
  const handleFbtToggle = (index) => {
    setFbtCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Add FBT bundle items to cart
  const addBundleToCart = async () => {
    if (showSizes && !selectedSize) {
      toast.error("Please select a size for the main product first.");
      return;
    }

    try {
      setBundleLoading(true);
      // Add main product
      await addToCart({
        product_id: product.id,
        size: selectedSize || "N/A",
        quantity: 1
      });

      // Add checked FBT choices
      for (let i = 0; i < fbtItems.length; i++) {
        if (fbtCheckedItems[i]) {
          await addToCart({
            product_id: fbtItems[i].id,
            size: "N/A",
            quantity: 1
          });
        }
      }
      toast.success("Added bundle to cart successfully! 🛒");
    } catch (err) {
      toast.error("Failed to add bundle to cart");
    } finally {
      setBundleLoading(false);
    }
  };

  // Wishlist toggle handler
  const toggleWishlist = () => {
    if (!product) return;
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (wishlist.includes(product.id)) {
      wishlist = wishlist.filter((idVal) => idVal !== product.id);
      setWishlisted(false);
      toast.success("Removed from wishlist 🤍");
    } else {
      wishlist.push(product.id);
      setWishlisted(true);
      toast.success("Added to wishlist ❤️");
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  };

  // Share functionality
  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || `Check out ${product.name} on SportZone!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! 🔗");
    }
  };

  // Pincode validation
  const checkPincode = (e) => {
    e.preventDefault();
    const cleanPincode = pincode.trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      setPincodeStatus("error");
      setDeliveryText("Please enter a valid 6-digit pincode.");
      return;
    }

    setPincodeStatus("checking");
    setTimeout(() => {
      setPincodeStatus("success");
      const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
      setDeliveryText(`Delivery by ${deliveryDate} | Free shipping & Cash on Delivery available.`);
    }, 600);
  };

  // Add review
  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please log in to write a review.");
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    try {
      setReviewSubmitting(true);
      await API.post("reviews/", {
        product: Number(id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      toast.success("Thanks! Your review will appear after approval.");
      setReviewForm({ rating: 5, comment: "" });
      const r = await API.get(`reviews/?product=${id}`);
      const d = Array.isArray(r.data) ? r.data : r.data?.results ?? [];
      setReviews(d);
    } catch {
      toast.error("Could not submit review. You may have already reviewed this product.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Add to cart main handler
  const addToCartNow = async () => {
    if (!product?.id) return;

    if (showSizes && !selectedSize) {
      toast.error("Please select a size first.");
      return;
    }

    try {
      setCartLoading(true);
      await addToCart({
        product_id: product.id,
        size: selectedSize || "N/A",
        quantity: qty
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Ratings calculation & Filter lists
  const combinedReviews = useMemo(() => {
    const baseReviews = reviews.map((r, index) => ({
      id: r.id || `api-${index}`,
      user_name: r.user_name || "Customer",
      rating: r.rating || 5,
      comment: r.comment || "",
      created_at: r.created_at || new Date().toISOString(),
      helpful: 0,
      images: []
    }));

    // Real-world premium mock reviews to show rich filters, photos, and votes
    const mockReviewsList = [
      {
        id: "mock-1",
        user_name: "Aarav Nair",
        rating: 5,
        comment: "Exceptional build quality! As a professional athlete, I highly appreciate the comfort and shock absorption. Definitely worth every rupee.",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 32,
        images: [
          "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1486282442299-57ef9a44f2b1?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "mock-2",
        user_name: "Kriti Sen",
        rating: 4,
        comment: "Excellent design and very light. Sizing is accurate as per the size chart. Shipping took about 3 days. Giving 4 stars because packaging was slightly crumpled.",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 15,
        images: [
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
        ]
      },
      {
        id: "mock-3",
        user_name: "Rahul Verma",
        rating: 5,
        comment: "Extremely comfortable and provides supreme support. Grip is outstanding on turf and clay surfaces.",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 9,
        images: []
      },
      {
        id: "mock-4",
        user_name: "Amit Patel",
        rating: 3,
        comment: "Decent performance, but the material feels a bit stiff at first. Took about a week to break in.",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 4,
        images: []
      }
    ];

    return [...baseReviews, ...mockReviewsList];
  }, [reviews]);

  // Distribution ratios
  const ratingDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    combinedReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
      }
    });
    return counts;
  }, [combinedReviews]);

  const getStarPercentage = (stars) => {
    if (combinedReviews.length === 0) return 0;
    return Math.round((ratingDistribution[stars - 1] / combinedReviews.length) * 100);
  };

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return combinedReviews.filter((r) => {
      const matchStars = selectedRatingFilter === null ? true : r.rating === selectedRatingFilter;
      const matchImages = !onlyWithImagesFilter ? true : (r.images && r.images.length > 0);
      return matchStars && matchImages;
    });
  }, [combinedReviews, selectedRatingFilter, onlyWithImagesFilter]);

  // Aggregate review images
  const allReviewImages = useMemo(() => {
    const list = [];
    combinedReviews.forEach((r) => {
      if (r.images && r.images.length > 0) {
        r.images.forEach((img) => {
          list.push({ src: img, reviewId: r.id });
        });
      }
    });
    return list;
  }, [combinedReviews]);

  // Increment helpful review vote
  const handleHelpfulVote = (reviewId) => {
    if (votedReviews[reviewId]) return;
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
  };

  // Hover zoom coordinate handlers
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Fullscreen Lightbox handlers
  const openLightboxAtIndex = (index) => {
    setLightboxIndex(index);
    setLightboxZoom(1);
    setShowLightbox(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % gallery.length);
    setLightboxZoom(1);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    setLightboxZoom(1);
  };

  // Copy coupon codes
  const copyOfferCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedOfferIndex(index);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => {
      setCopiedOfferIndex(null);
    }, 2000);
  };

  // Accordion toggle handler
  const toggleTab = (tab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  // Skeleton Loader rendering
  if (loading) {
    return (
      <StoreShell>
        <div className="sz-pd-modern-page">
          <div className="container-fluid sz-pd-container py-4">
            <div className="sz-skeleton-loader mb-4" style={{ height: "20px", width: "280px" }} />
            <div className="row g-4">
              {/* Gallery skeleton */}
              <div className="col-lg-5 col-md-6 col-12">
                <div className="d-flex gap-3">
                  <div className="d-flex flex-column gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="sz-skeleton-loader" style={{ width: "68px", height: "68px", borderRadius: "6px" }} />
                    ))}
                  </div>
                  <div className="sz-skeleton-loader flex-grow-1" style={{ height: "480px", borderRadius: "12px" }} />
                </div>
              </div>
              {/* Info columns skeleton */}
              <div className="col-lg-4 col-md-6 col-12">
                <div className="d-flex flex-column gap-3">
                  <div className="sz-skeleton-loader" style={{ height: "14px", width: "100px" }} />
                  <div className="sz-skeleton-loader" style={{ height: "36px", width: "90%" }} />
                  <div className="sz-skeleton-loader" style={{ height: "20px", width: "200px" }} />
                  <div className="sz-skeleton-loader" style={{ height: "70px", width: "100%", borderRadius: "8px" }} />
                  <div className="sz-skeleton-loader" style={{ height: "48px", width: "100%", borderRadius: "6px" }} />
                  <div className="sz-skeleton-loader" style={{ height: "120px", width: "100%", borderRadius: "8px" }} />
                </div>
              </div>
              {/* Purchase sidebar skeleton */}
              <div className="col-lg-3 d-none d-lg-block">
                <div className="sz-skeleton-loader" style={{ height: "360px", width: "100%", borderRadius: "12px" }} />
              </div>
            </div>
          </div>
        </div>
      </StoreShell>
    );
  }

  // Fallback product not found
  if (!product) {
    return (
      <StoreShell>
        <div className="container py-5 text-center fw-bold fs-4">Product not found.</div>
      </StoreShell>
    );
  }

  const inStock = Number(product.stock || 0) > 0;
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const showSizes = sizes.length > 0;

  const mrp = Math.round(Number(product.price) * 1.25);
  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  const savings = mrp - product.price;
  const emiVal = Math.round(product.price / 12);

  const parsedBrand = product.brand?.name || (typeof product.brand === "string" ? product.brand : "") || product.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE";

  const specificationList = [
    { name: "Brand", value: parsedBrand },
    { name: "Category", value: product.category },
    { name: "Material", value: "Premium Athlete-Grade Composite" },
    { name: "Fit Type", value: "Regular Performance Fit" },
    { name: "Warranty", value: "1 Year Official Manufacturer Warranty" },
    { name: "Availability", value: inStock ? "In Stock" : "Out of Stock" }
  ];

  const mockOffers = [
    { title: "HDFC Card Offer", desc: "Flat 10% Instant Discount on HDFC Credit Cards.", code: "HDFC10" },
    { title: "UPI Cashback", desc: "Get flat ₹250 cashback on payments using UPI.", code: "UPI250" },
    { title: "New User Coupon", desc: "Extra ₹100 off on your first transaction.", code: "SPORT10" }
  ];

  return (
    <StoreShell>
      <div className="sz-pd-modern-page">
        <div className="container-fluid sz-pd-container py-3">
          
          {/* Breadcrumbs */}
          <div className="sz-pd-breadcrumb mb-4 text-muted small">
            <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to={`/shop?category=${product.category}`}>{product.category}</Link> &nbsp;/&nbsp; <span className="text-dark fw-bold">{product.name}</span>
          </div>

          <div className="row g-4">
            
            {/* LEFT COLUMN: Gallery with hover zoom */}
            <div className="col-lg-5 col-md-6 col-12">
              <div className="sz-pd-gallery-sticky-box">
                <div className="sz-pd-gallery-layout">
                  
                  {/* Vertical Thumbs strip */}
                  {gallery.length > 1 && (
                    <div className="sz-pd-thumbs-strip order-2 order-md-1">
                      {gallery.map((img, idx) => (
                        <button
                          key={img}
                          type="button"
                          className={`sz-pd-thumb-btn ${selectedImage === img ? "active" : ""}`}
                          onClick={() => {
                            setSelectedImage(img);
                            setIsZoomed(false);
                          }}
                        >
                          <img src={img} alt={`Product thumbnail ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main Display Box with Hover Zoom */}
                  <div
                    className="sz-pd-main-img-box flex-grow-1 order-1 order-md-2"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => {
                      setIsZoomed(false);
                      setImageZoomed(false);
                    }}
                    onClick={() => openLightboxAtIndex(gallery.indexOf(selectedImage))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openLightboxAtIndex(gallery.indexOf(selectedImage))}
                  >
                    {discount > 0 && (
                      <span className="sz-pd-badge-overlay">{discount}% OFF</span>
                    )}

                    {/* Image overlay actions */}
                    <div className="sz-pd-img-action-overlay">
                      <button
                        type="button"
                        className={`sz-pd-action-icon-btn ${wishlisted ? "wishlisted" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist();
                        }}
                        aria-label="Save to Wishlist"
                      >
                        {wishlisted ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                      </button>
                      <button
                        type="button"
                        className="sz-pd-action-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareProduct();
                        }}
                        aria-label="Share Product"
                      >
                        <FaShareAlt size={16} />
                      </button>
                    </div>

                    <img
                      src={selectedImage || "/no-image.png"}
                      alt={product.name}
                      className="sz-pd-zoomable-img"
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                              transform: "scale(2.2)",
                              cursor: "zoom-in"
                            }
                          : {}
                      }
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* MIDDLE COLUMN: Details */}
            <div className="col-lg-4 col-md-6 col-12 px-md-3">
              <div className="sz-pd-info-col d-flex flex-column gap-3">
                
                {/* Brand & Title */}
                <div>
                  <span className="sz-pd-brand-title">{parsedBrand}</span>
                  <h1 className="sz-pd-title-text mt-1">{product.name}</h1>
                </div>

                {/* Star & Stock Metadata */}
                <div className="sz-pd-meta-row">
                  <span className="sz-pd-rating-badge">
                    <FaStar /> {product?.rating ?? 4.5}
                  </span>
                  <button
                    type="button"
                    className="sz-pd-review-link"
                    onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    {combinedReviews.length} Reviews
                  </button>
                  <span className="text-muted">·</span>
                  {inStock ? (
                    <span className={`sz-stock-tag ${product.stock <= 5 ? "low-stock" : "in-stock"}`}>
                      {product.stock <= 5 ? `Only ${product.stock} Left!` : "In Stock"}
                    </span>
                  ) : (
                    <span className="sz-stock-tag out-stock">Currently Unavailable</span>
                  )}
                </div>

                {/* Price block */}
                <div className="sz-pd-price-card">
                  <div className="sz-pd-price-flex">
                    <span className="sz-pd-current-price">
                      ₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                    {discount > 0 && (
                      <>
                        <span className="sz-pd-strike-price">₹{mrp.toLocaleString("en-IN")}</span>
                        <span className="sz-pd-pct-discount">{discount}% OFF</span>
                      </>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="sz-pd-savings-banner">
                      Instant Savings: ₹{savings.toLocaleString("en-IN")}
                    </div>
                  )}
                  <div className="sz-pd-emi-note">
                    Standard EMI starting from <b>₹{emiVal.toLocaleString("en-IN")}/month</b>. 
                    <br />
                    <span className="text-decoration-underline cursor-pointer text-dark font-semibold">View Plans & Banks</span>
                  </div>
                </div>

                <hr className="my-1 border-slate-200" />

                {/* Size Selector */}
                {showSizes && (
                  <div className="d-flex flex-column gap-2">
                    <div className="sz-pd-size-header">
                      <span className="small fw-bold uppercase tracking-wider text-dark">Select Size</span>
                      <button
                        type="button"
                        className="sz-pd-guide-trigger"
                        onClick={() => setShowSizeGuide(true)}
                      >
                        <FaRegCopy size={12} /> Size Guide
                      </button>
                    </div>

                    <div className="sz-pd-size-grid-box">
                      {sizes.map((s) => {
                        const sizeLabel = String(s?.size ?? "");
                        const sizeStock = Number(s?.stock || 0);
                        const disabled = sizeStock <= 0;
                        const active = selectedSize === sizeLabel;

                        return (
                          <button
                            key={sizeLabel}
                            type="button"
                            className={`sz-pd-size-btn ${active ? "active" : ""}`}
                            onClick={() => !disabled && setSelectedSize(sizeLabel)}
                            disabled={disabled}
                          >
                            <span>{sizeLabel}</span>
                            {sizeStock > 0 && sizeStock <= 5 && (
                              <span className="sz-size-low-indicator">LTD</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSize && (
                      <div className="small font-semibold">
                        {(() => {
                          const matchedSize = sizes.find((s) => String(s?.size ?? "") === selectedSize);
                          const stock = matchedSize ? Number(matchedSize.stock) : 0;
                          if (stock === 0) return <span className="text-danger">Size is Out of Stock</span>;
                          if (stock <= 5) return <span className="text-danger">Hurry! Only {stock} left in selected size.</span>;
                          return <span className="text-success">Size in stock and ready to ship</span>;
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Quantity selector and CTA buttons */}
                <div className="d-lg-none mt-2 d-flex flex-column gap-3">
                  {inStock && (
                    <div className="d-flex align-items-center gap-3">
                      <span className="small fw-bold uppercase tracking-wider text-dark">Quantity:</span>
                      <div className="sz-pd-qty">
                        <button
                          type="button"
                          className="sz-pd-qty-btn"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                        >
                          -
                        </button>
                        <span className="sz-pd-qty-val">{qty}</span>
                        <button
                          type="button"
                          className="sz-pd-qty-btn"
                          onClick={() => setQty((q) => q + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex flex-column gap-2">
                    <button
                      type="button"
                      className="btn sz-purchase-btn buy-now"
                      onClick={() => {
                        if (showSizes && !selectedSize) {
                          toast.error("Please select a size first.");
                          return;
                        }
                        navigate("/checkout", {
                          state: {
                            buyNow: {
                              product_id: product.id,
                              product: product,
                              size: selectedSize || "N/A",
                              quantity: qty
                            }
                          }
                        });
                      }}
                      disabled={!inStock}
                    >
                      <FaBolt /> Buy Now
                    </button>
                    <button
                      type="button"
                      className="btn sz-purchase-btn add-to-cart"
                      onClick={addToCartNow}
                      disabled={!inStock || cartLoading}
                    >
                      <FaShoppingCart /> {cartLoading ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>

                <hr className="my-1 border-slate-200" />

                {/* Bank / Promo coupon cards */}
                <div className="d-flex flex-column gap-2">
                  <span className="small fw-bold uppercase tracking-wider text-dark">Exclusive Offers</span>
                  <div className="sz-pd-offers-carousel">
                    {mockOffers.map((off, index) => (
                      <div className="sz-pd-offer-card" key={off.code}>
                        <div>
                          <div className="fw-bold text-dark small mb-1">{off.title}</div>
                          <div className="text-muted extra-small" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>{off.desc}</div>
                        </div>
                        <button
                          type="button"
                          className="sz-offer-copy-btn"
                          onClick={() => copyOfferCode(off.code, index)}
                        >
                          {copiedOfferIndex === index ? "Copied! ✓" : off.code}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="my-1 border-slate-200" />

                {/* Delivery Pin Checker */}
                <div className="sz-pd-pincode-card">
                  <div className="small fw-bold uppercase tracking-wider text-dark">Delivery & Service Availability</div>
                  <form onSubmit={checkPincode} className="sz-pincode-input-wrapper">
                    <input
                      type="text"
                      className="sz-pincode-field"
                      placeholder="Enter 6-digit Pincode"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    />
                    <button type="submit" className="sz-pincode-btn">Check</button>
                  </form>
                  {pincodeStatus && (
                    <div className={`sz-pincode-response ${pincodeStatus}`}>
                      {pincodeStatus === "checking" ? (
                        <>
                          <span className="spinner-border spinner-border-sm text-dark" role="status" style={{ width: "12px", height: "12px" }} />
                          <span>Checking availability...</span>
                        </>
                      ) : (
                        <>
                          {pincodeStatus === "success" ? <FaCheck /> : <FaInfoCircle />}
                          <span>{deliveryText}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <hr className="my-1 border-slate-200" />

                {/* Product highlights */}
                <div className="d-flex flex-column gap-2">
                  <span className="small fw-bold uppercase tracking-wider text-dark">Product Highlights</span>
                  <ul className="sz-pd-highlights-list">
                    <li className="sz-pd-highlight-item">
                      <span className="sz-pd-highlight-dot">✓</span> High-impact durability
                    </li>
                    <li className="sz-pd-highlight-item">
                      <span className="sz-pd-highlight-dot">✓</span> Ergonomic athlete fit
                    </li>
                    <li className="sz-pd-highlight-item">
                      <span className="sz-pd-highlight-dot">✓</span> Tested in professional conditions
                    </li>
                    <li className="sz-pd-highlight-item">
                      <span className="sz-pd-highlight-dot">✓</span> Breathable sweat-wicking materials
                    </li>
                  </ul>
                </div>

                <hr className="my-1 border-slate-200" />

                {/* Details Accordion Info Tabs */}
                <div className="sz-pd-info-tabs">
                  
                  {/* Description tab */}
                  <button type="button" className="sz-pd-info-tab-header" onClick={() => toggleTab("description")}>
                    <span>Product Description</span>
                    {activeTab === "description" ? <FaPlus style={{ transform: "rotate(45deg)", transition: "transform 0.2s" }} size={12} /> : <FaPlus style={{ transition: "transform 0.2s" }} size={12} />}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: activeTab === "description" ? "auto" : 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="sz-pd-info-tab-content">
                      {product.description || "Designed for top-tier training and matches, this product integrates advanced sports science materials to ensure maximum lifespan, durability, and comfort for athletes at all levels. Developed in conjunction with professional coaches and athletes."}
                    </div>
                  </motion.div>

                  {/* Specs tab */}
                  <button type="button" className="sz-pd-info-tab-header" onClick={() => toggleTab("specs")}>
                    <span>Specifications Details</span>
                    {activeTab === "specs" ? <FaPlus style={{ transform: "rotate(45deg)", transition: "transform 0.2s" }} size={12} /> : <FaPlus style={{ transition: "transform 0.2s" }} size={12} />}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: activeTab === "specs" ? "auto" : 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="sz-pd-info-tab-content">
                      <div className="sz-specs-grid">
                        {specificationList.map((spec) => (
                          <div className="sz-spec-row" key={spec.name}>
                            <div className="sz-spec-label">{spec.name}</div>
                            <div className="sz-spec-value">{spec.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Shipping Tab */}
                  <button type="button" className="sz-pd-info-tab-header" onClick={() => toggleTab("shipping")}>
                    <span>Shipping & Returns</span>
                    {activeTab === "shipping" ? <FaPlus style={{ transform: "rotate(45deg)", transition: "transform 0.2s" }} size={12} /> : <FaPlus style={{ transition: "transform 0.2s" }} size={12} />}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: activeTab === "shipping" ? "auto" : 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="sz-pd-info-tab-content d-flex flex-column gap-2">
                      <div className="d-flex align-items-start gap-2.5">
                        <FaTruck className="text-dark mt-1 flex-shrink-0" size={14} />
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: "0.82rem" }}>Free Delivery nationwide</div>
                          <div className="text-muted" style={{ fontSize: "0.78rem" }}>Orders are dispatched within 24 hours. Transit takes 2-5 business days depending on location.</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-start gap-2.5">
                        <FaUndo className="text-dark mt-1 flex-shrink-0" size={14} />
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: "0.82rem" }}>10-Day Hassle-Free Returns</div>
                          <div className="text-muted" style={{ fontSize: "0.78rem" }}>Keep the product in its original tags and packaging for instant replacement or refund.</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <hr className="my-1 border-slate-200" />

                {/* Trust Badges */}
                <div className="row g-2">
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 p-2 border rounded bg-white">
                      <FaLock className="text-primary flex-shrink-0" size={13} />
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.72rem" }}>Secure Checkout</div>
                        <div className="text-muted" style={{ fontSize: "0.68rem" }}>SSL 256-Bit Encryption</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 p-2 border rounded bg-white">
                      <FaShieldAlt className="text-primary flex-shrink-0" size={13} />
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.72rem" }}>100% Original</div>
                        <div className="text-muted" style={{ fontSize: "0.68rem" }}>Authorized Retailer</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Desktop Sticky Buy Panel */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="sz-pd-desktop-sticky-panel d-flex flex-column gap-3">
                
                {/* Pricing info */}
                <div>
                  <div className="small text-muted font-semibold">Price:</div>
                  <div className="sz-pd-price-flex align-items-baseline">
                    <span className="sz-pd-current-price" style={{ fontSize: "2rem" }}>
                      ₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                    {discount > 0 && (
                      <span className="sz-pd-strike-price" style={{ fontSize: "1.1rem" }}>
                        ₹{mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="text-success small fw-bold mt-1">
                    Free shipping included
                  </div>
                </div>

                <hr className="my-0 border-slate-200" />

                {/* Sizing display */}
                {showSizes && (
                  <div className="small text-muted">
                    Selected Size: <span className="fw-bold text-dark">{selectedSize || "None"}</span>
                  </div>
                )}

                {/* Delivery summary */}
                <div className="small text-muted">
                  Expected Delivery: <span className="fw-bold text-dark">{new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "long" })}</span>
                </div>

                {/* Quantity box */}
                {inStock && (
                  <div className="sz-pd-qty-selector-row">
                    <span className="small text-muted font-semibold">Qty:</span>
                    <select
                      className="sz-pd-qty-dropdown"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Purchase buttons */}
                <div className="sz-pd-purchase-ctas mt-2">
                  <button
                    type="button"
                    className="sz-purchase-btn buy-now"
                    onClick={() => {
                      if (showSizes && !selectedSize) {
                        toast.error("Please select a size first.");
                        return;
                      }
                      navigate("/checkout", {
                        state: {
                          buyNow: {
                            product_id: product.id,
                            product: product,
                            size: selectedSize || "N/A",
                            quantity: qty
                          }
                        }
                      });
                    }}
                    disabled={!inStock}
                  >
                    <FaBolt /> Buy Now
                  </button>
                  <button
                    type="button"
                    className="sz-purchase-btn add-to-cart"
                    onClick={addToCartNow}
                    disabled={!inStock || cartLoading}
                  >
                    <FaShoppingCart /> {cartLoading ? "Adding..." : "Add to Cart"}
                  </button>
                </div>

                <hr className="my-0 border-slate-200" />

                {/* Meta details */}
                <div className="sz-seller-meta-info">
                  <div>Ships from: <span className="fw-bold text-dark">SportZone Warehouse</span></div>
                  <div>Sold by: <span className="fw-bold text-dark">SportZone Retail Ltd</span></div>
                  <div className="mt-2 text-success font-semibold d-flex align-items-center gap-1.5">
                    <FaLock size={10} /> Secure SSL Transaction
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* CONVERSION: Frequently Bought Together Bundle */}
          {fbtItems.length >= 2 && (
            <div className="mt-5">
              <div className="sz-fbt-container">
                <h3 className="sz-fbt-title">Frequently Bought Together</h3>
                
                <div className="sz-fbt-grid">
                  
                  {/* Item 1: Main product */}
                  <div className="sz-fbt-product-image-box">
                    <img src={mediaUrl(product.image) || "/no-image.png"} alt={product.name} />
                  </div>

                  <span className="sz-fbt-plus-sign">+</span>

                  {/* Item 2: Complementary 1 */}
                  <div className="sz-fbt-product-image-box">
                    <img src={mediaUrl(fbtItems[0].image) || "/no-image.png"} alt={fbtItems[0].name} />
                  </div>

                  <span className="sz-fbt-plus-sign">+</span>

                  {/* Item 3: Complementary 2 */}
                  <div className="sz-fbt-product-image-box">
                    <img src={mediaUrl(fbtItems[1].image) || "/no-image.png"} alt={fbtItems[1].name} />
                  </div>

                  {/* Checked lists of FBT */}
                  <div className="sz-fbt-items-list px-lg-3 mt-3 mt-lg-0">
                    <div className="sz-fbt-item-checkbox-row">
                      <input type="checkbox" className="sz-fbt-checkbox" checked={true} disabled />
                      <label className="text-dark font-medium">
                        <b>This Item:</b> {product.name} &nbsp; 
                        <span className="text-primary font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
                      </label>
                    </div>

                    <div className="sz-fbt-item-checkbox-row">
                      <input
                        type="checkbox"
                        className="sz-fbt-checkbox"
                        checked={fbtCheckedItems[0]}
                        onChange={() => handleFbtToggle(0)}
                      />
                      <label className="text-muted cursor-pointer" onClick={() => handleFbtToggle(0)}>
                        <b>Add:</b> {fbtItems[0].name} &nbsp; 
                        <span className="text-dark font-bold">₹{Number(fbtItems[0].price).toLocaleString("en-IN")}</span>
                      </label>
                    </div>

                    <div className="sz-fbt-item-checkbox-row">
                      <input
                        type="checkbox"
                        className="sz-fbt-checkbox"
                        checked={fbtCheckedItems[1]}
                        onChange={() => handleFbtToggle(1)}
                      />
                      <label className="text-muted cursor-pointer" onClick={() => handleFbtToggle(1)}>
                        <b>Add:</b> {fbtItems[1].name} &nbsp; 
                        <span className="text-dark font-bold">₹{Number(fbtItems[1].price).toLocaleString("en-IN")}</span>
                      </label>
                    </div>
                  </div>

                  {/* FBT checkout action */}
                  <div className="sz-fbt-checkout-card mt-3 mt-lg-0">
                    <div className="small text-muted font-semibold">Total Price:</div>
                    <div className="sz-fbt-total-price">
                      ₹{fbtPricing.current.toLocaleString("en-IN")}
                    </div>
                    {fbtPricing.discount > 0 && (
                      <div className="sz-fbt-savings">
                        Bundle Discount: {fbtPricing.discount}% Off (Save ₹{fbtPricing.savings.toLocaleString("en-IN")})
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn sz-purchase-btn buy-now mt-3 py-2"
                      onClick={addBundleToCart}
                      disabled={bundleLoading}
                    >
                      {bundleLoading ? "Adding Bundle..." : "Add All 3 Items to Cart"}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER REVIEWS (Amazon-Style Redesign) */}
          <div id="reviews-section" className="row mt-5 pt-4 border-top">
            <div className="col-12">
              <h3 className="h4 fw-bold mb-4">Customer Rating Feedbacks</h3>

              <div className="row g-4 mb-4">
                
                {/* Rating summary left card */}
                <div className="col-lg-4 col-md-5 col-12">
                  <div className="sz-reviews-summary-flex">
                    <div className="sz-reviews-stat-left">
                      <div className="sz-reviews-big-num">{product?.rating ?? 4.5}</div>
                      <div className="text-warning my-1" style={{ fontSize: "1.25rem" }}>
                        {"★".repeat(Math.round(product?.rating ?? 4.5))}
                        {"☆".repeat(5 - Math.round(product?.rating ?? 4.5))}
                      </div>
                      <span className="small text-muted">Out of 5 Stars</span>
                    </div>

                    {/* Progress bars that acts as click-to-filter reviews */}
                    <div className="sz-reviews-total-bar-list">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const pct = getStarPercentage(stars);
                        const isFilterActive = selectedRatingFilter === stars;
                        return (
                          <div
                            key={stars}
                            className={`sz-reviews-bar-row ${isFilterActive ? "active-filter" : ""}`}
                            onClick={() => handleRatingFilter(stars)}
                          >
                            <span className="extra-small text-muted" style={{ minWidth: "40px", fontSize: "0.78rem" }}>{stars} Star</span>
                            <div className="sz-reviews-bar-track">
                              <div className="sz-reviews-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="extra-small text-muted" style={{ minWidth: "30px", fontSize: "0.78rem" }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review Photos Grid (Mock attached user review photos) */}
                <div className="col-lg-8 col-md-7 col-12">
                  <div className="sz-photo-reviews-wrapper">
                    <div className="small fw-bold text-dark uppercase mb-2">Customer Photos ({allReviewImages.length})</div>
                    {allReviewImages.length === 0 ? (
                      <div className="text-muted small py-3">No photos uploaded by customers yet.</div>
                    ) : (
                      <div className="sz-photo-reviews-grid">
                        {allReviewImages.map((img, idx) => (
                          <div
                            className="sz-photo-review-thumbnail"
                            key={idx}
                            onClick={() => setActiveLightboxReviewImage(img.src)}
                          >
                            <img src={img.src} alt="Attached review thumbnail" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Filters review tags */}
              <div className="sz-reviews-filter-bar">
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <button
                    type="button"
                    className={`sz-reviews-filter-pill ${selectedRatingFilter === null ? "active" : ""}`}
                    onClick={() => setSelectedRatingFilter(null)}
                  >
                    All Reviews ({combinedReviews.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = combinedReviews.filter((r) => r.rating === star).length;
                    return (
                      <button
                        key={star}
                        type="button"
                        className={`sz-reviews-filter-pill ${selectedRatingFilter === star ? "active" : ""}`}
                        onClick={() => setSelectedRatingFilter(star)}
                      >
                        {star} Stars ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    id="imageFilterCheck"
                    className="sz-fbt-checkbox"
                    checked={onlyWithImagesFilter}
                    onChange={(e) => setOnlyWithImagesFilter(e.target.checked)}
                  />
                  <label htmlFor="imageFilterCheck" className="small fw-bold text-muted cursor-pointer">
                    Show Reviews with Images Only
                  </label>
                </div>
              </div>

              {/* Review Card List & Submission Form */}
              <div className="row g-4">
                
                {/* Reviews List */}
                <div className="col-lg-7 col-12">
                  {filteredReviews.length === 0 ? (
                    <div className="p-4 border rounded text-center text-muted small bg-light">
                      No customer reviews found matching the filters.
                    </div>
                  ) : (
                    <div className="d-flex flex-column">
                      {filteredReviews.map((r) => {
                        const nameChar = (r.user_name || "Customer").charAt(0).toUpperCase();
                        const colors = ["#2563eb", "#db2777", "#059669", "#7c3aed", "#ea580c"];
                        const charCode = nameChar.charCodeAt(0) || 0;
                        const avatarBg = colors[charCode % colors.length];

                        return (
                          <div key={r.id} className="sz-customer-review-card">
                            
                            {/* Header details */}
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="sz-review-avatar-circle"
                                  style={{ backgroundColor: avatarBg }}
                                >
                                  {nameChar}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                                    {r.user_name || "Customer"}
                                  </div>
                                  <div className="text-warning extra-small" style={{ fontSize: "0.75rem" }}>
                                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-muted small font-medium">
                                {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
                              </span>
                            </div>

                            {/* Comment */}
                            {r.comment && (
                              <p className="text-muted mt-2 mb-2" style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                                {r.comment}
                              </p>
                            )}

                            {/* Attachments */}
                            {r.images && r.images.length > 0 && (
                              <div className="d-flex gap-2 my-2">
                                {r.images.map((imgSrc, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className="sz-review-image-attach"
                                    onClick={() => setActiveLightboxReviewImage(imgSrc)}
                                  >
                                    <img src={imgSrc} alt={`Review attach ${imgIdx}`} />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Helpful vote */}
                            <div className="mt-1">
                              <button
                                type="button"
                                className={`sz-review-vote-btn ${votedReviews[r.id] ? "voted" : ""}`}
                                onClick={() => handleHelpfulVote(r.id)}
                              >
                                <FiThumbsUp /> 
                                <span>
                                  {votedReviews[r.id] ? "Voted Helpful" : "Helpful"} ({r.helpful + (votedReviews[r.id] ? 1 : 0)})
                                </span>
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit Feedback Form */}
                <div className="col-lg-5 col-12">
                  <div className="sz-submit-review-card">
                    <h4 className="h6 fw-bold mb-3 uppercase tracking-wider text-dark">Submit Feedback</h4>
                    <form onSubmit={submitReview} className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label small fw-bold text-dark uppercase tracking-wider">Overall Rating</label>
                        <select
                          className="form-select form-select-sm"
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          style={{ fontWeight: 600 }}
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} Stars {n === 5 ? "(Excellent)" : n === 1 ? "(Poor)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label small fw-bold text-dark uppercase tracking-wider">Review Message</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={4}
                          placeholder="Tell us what you liked or disliked about this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                          style={{ fontSize: "0.85rem", lineHeight: "1.4" }}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="btn sz-purchase-btn buy-now py-2 mt-1"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? "Publishing Review..." : "Publish Review"}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <div className="row mt-5 pt-4 border-top">
              <div className="col-12">
                <h3 className="h5 fw-bold mb-3">Related Gear Collections</h3>
                <div className="sz-pd-carousel-wrapper">
                  <div className="sz-pd-scrolling-cards-row">
                    {relatedProducts.map((p, idx) => (
                      <div className="sz-pd-card-item-wrap" key={p.id}>
                        <ProductCard product={p} index={idx} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECENTLY VIEWED PRODUCTS */}
          {recentlyViewedProducts.length > 0 && (
            <div className="row mt-5 pt-4 border-top">
              <div className="col-12">
                <h3 className="h5 fw-bold mb-3">Recently Viewed Gear</h3>
                <div className="sz-pd-carousel-wrapper">
                  <div className="sz-pd-scrolling-cards-row">
                    {recentlyViewedProducts.map((p, idx) => (
                      <div className="sz-pd-card-item-wrap" key={p.id}>
                        <ProductCard product={p} index={idx} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Sticky CTA Footer (Visible below lg breakpoint) */}
        <div className="sz-pd-mobile-footer-bar d-lg-none">
          <button
            type="button"
            className="sz-mobile-bar-btn cart"
            onClick={addToCartNow}
            disabled={!inStock || cartLoading}
          >
            <FaShoppingCart /> {cartLoading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            type="button"
            className="sz-mobile-bar-btn buy"
            onClick={() => {
              if (showSizes && !selectedSize) {
                toast.error("Please select a size first.");
                return;
              }
              navigate("/checkout", {
                state: {
                  buyNow: {
                    product_id: product.id,
                    product: product,
                    size: selectedSize || "N/A",
                    quantity: qty
                  }
                }
              });
            }}
            disabled={!inStock}
          >
            <FaBolt /> Buy Now
          </button>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PORTAL */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            className="sz-pd-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="sz-pd-lightbox-header">
              <div className="sz-pd-lightbox-title">{product.name} (View {lightboxIndex + 1} of {gallery.length})</div>
              
              <button
                type="button"
                className="sz-pd-lightbox-btn"
                onClick={() => setLightboxZoom((z) => Math.max(1, z - 0.5))}
                disabled={lightboxZoom <= 1}
                title="Zoom Out"
              >
                <FaMinus size={18} />
              </button>
              <span className="text-white extra-small" style={{ fontSize: "0.8rem", userSelect: "none" }}>{Math.round(lightboxZoom * 100)}%</span>
              <button
                type="button"
                className="sz-pd-lightbox-btn"
                onClick={() => setLightboxZoom((z) => Math.min(3, z + 0.5))}
                disabled={lightboxZoom >= 3}
                title="Zoom In"
              >
                <FaPlus size={18} />
              </button>

              <button
                type="button"
                className="sz-pd-lightbox-btn"
                onClick={() => {
                  setLightboxZoom(1);
                  setShowLightbox(false);
                }}
                aria-label="Close Lightbox"
              >
                <FaTimes size={22} />
              </button>
            </div>

            {/* Main zoom screen */}
            <div className="sz-pd-lightbox-main-area">
              <button type="button" className="sz-pd-lightbox-nav-btn" onClick={prevLightboxImage}>
                <FaChevronLeft size={20} />
              </button>

              <div className="sz-pd-lightbox-img-wrapper" onClick={() => setLightboxZoom((z) => (z > 1 ? 1 : 2))}>
                <img
                  src={gallery[lightboxIndex]}
                  alt="Fullscreen view"
                  className="sz-pd-lightbox-img"
                  style={{ transform: `scale(${lightboxZoom})`, cursor: lightboxZoom > 1 ? "zoom-out" : "zoom-in" }}
                />
              </div>

              <button type="button" className="sz-pd-lightbox-nav-btn" onClick={nextLightboxImage}>
                <FaChevronRight size={20} />
              </button>
            </div>

            {/* Lightbox thumbnails */}
            <div className="sz-pd-lightbox-thumbs">
              {gallery.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  className={`sz-pd-lightbox-thumb ${lightboxIndex === idx ? "active" : ""}`}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxZoom(1);
                  }}
                >
                  <img src={img} alt={`Lightbox preview ${idx + 1}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN REVIEW IMAGES LIGHTBOX */}
      <AnimatePresence>
        {activeLightboxReviewImage && (
          <motion.div
            className="sz-modal-overlay-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxReviewImage(null)}
            style={{ zIndex: 2200 }}
          >
            <div className="position-relative" style={{ maxWidth: "85%", maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="position-absolute border-0 bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ top: "-15px", right: "-15px", width: "34px", height: "34px", opacity: 0.8 }}
                onClick={() => setActiveLightboxReviewImage(null)}
              >
                <FaTimes size={16} />
              </button>
              <img
                src={activeLightboxReviewImage}
                alt="Review attached full view"
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px", border: "2px solid #fff" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIZE GUIDE MODAL DIALOG */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            className="sz-modal-overlay-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              className="sz-size-modal-card bg-white"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h3 className="h6 fw-bold m-0 uppercase tracking-wider text-dark d-flex align-items-center gap-2">
                  SportZone Sizing Chart
                </h3>
                <button
                  type="button"
                  className="border-0 bg-transparent text-muted p-0"
                  onClick={() => setShowSizeGuide(false)}
                  aria-label="Close Guide"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="p-3">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover text-center align-middle m-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="table-dark">
                      <tr>
                        <th>UK Size</th>
                        <th>US Size</th>
                        <th>EU Size</th>
                        <th>Foot Length (CM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>6</td><td>7</td><td>40</td><td>25.0 cm</td></tr>
                      <tr><td>7</td><td>8</td><td>41</td><td>26.0 cm</td></tr>
                      <tr><td>8</td><td>9</td><td>42</td><td>27.0 cm</td></tr>
                      <tr><td>9</td><td>10</td><td>43</td><td>28.0 cm</td></tr>
                      <tr><td>10</td><td>11</td><td>44</td><td>29.0 cm</td></tr>
                      <tr><td>11</td><td>12</td><td>45</td><td>30.0 cm</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted small mt-3 mb-0 text-center" style={{ fontSize: "0.78rem" }}>
                  Measure from your heel to your longest toe. If you are between sizes, we recommend taking the larger size.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </StoreShell>
  );
}

export default ProductDetail;
