import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import API from "../api";
import Rating from "../components/Rating";
import { FaTruck, FaUndo, FaTag, FaShoppingCart, FaBolt } from "react-icons/fa";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`products/${id}/`);
        if (!mounted) return;

        const data = res.data;
        setProduct(data);
        const first = data?.images?.[0]?.image || data?.image || "/no-image.png";
        setSelectedImage(first);
        setSelectedSize(null);

        if (data?.category) {
          const relatedRes = await API.get(
            `products/?category=${encodeURIComponent(data.category)}`
          );
          const related = (Array.isArray(relatedRes.data) ? relatedRes.data : [])
            .filter((p) => p.id !== data.id)
            .slice(0, 4);
          if (mounted) setRelatedProducts(related);
        }
      } catch {
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

  const gallery = useMemo(() => {
    if (!product) return [];
    const fromGallery = (product.images || [])
      .map((img) => img.image)
      .filter(Boolean);
    const primary = product.image ? [product.image] : [];
    return [...new Set([...primary, ...fromGallery])];
  }, [product]);

  const addToCartNow = async () => {
    if (!product?.id) return;

    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !selectedSize) {
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

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="container py-5 text-center fw-bold fs-4">Product not found.</div>;
  }

  const inStock = Number(product.stock || 0) > 0;
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const anySizeInStock = sizes.some((s) => Number(s?.stock || 0) > 0);
  const showSizes = sizes.length > 0;

  return (
    <div className="fk-pd-container bg-white w-100 min-vh-100">
      <div className="container-fluid container-xl py-3 py-lg-4">

        {/* Breadcrumb Area */}
        <div className="text-muted small mb-3">
          Home &gt; {product.category} &gt; <span className="text-dark fw-medium">{product.name}</span>
        </div>

        <div className="row g-0 g-lg-4">

          {/* LEFT: Images & Quick Actions */}
          <div className="col-lg-5">
            <div className="fk-pd-gallery-section position-sticky top-0 pt-lg-2">

              <div className="d-flex flex-column-reverse flex-md-row gap-3 h-100">

                {/* Thumbnails (Vertical on desktop) */}
                {gallery.length > 1 && (
                  <div className="fk-pd-thumbs-container d-flex flex-md-column gap-2 overflow-auto custom-scrollbar">
                    {gallery.map((img) => (
                      <button
                        key={img}
                        className={`fk-pd-thumb border ${selectedImage === img ? 'border-primary border-2 shadow-sm' : ''} bg-white`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt="thumb" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="fk-pd-main-img-wrap flex-grow-1 border rounded bg-white d-flex align-items-center justify-content-center overflow-hidden position-relative">
                  <img
                    src={selectedImage || "/no-image.png"}
                    alt={product.name}
                    className="fk-pd-main-image img-fluid object-fit-contain"
                  />
                </div>
              </div>

              {/* Action Buttons (Desktop view below image) */}
              <div className="row g-2 mt-3 d-none d-lg-flex">
                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-lg w-100 fk-btn-cart d-flex justify-content-center align-items-center gap-2"
                    onClick={addToCartNow}
                    disabled={!inStock || cartLoading}
                  >
                    <FaShoppingCart /> {cartLoading ? "ADDING..." : "ADD TO CART"}
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button
                    className="btn btn-lg w-100 fk-btn-buy d-flex justify-content-center align-items-center gap-2"
                    onClick={() => {
                      if (showSizes && !selectedSize) {
                        toast.error("Please select a size first.");
                        return;
                      }
                      navigate("/checkout");
                    }}
                    disabled={!inStock}
                  >
                    <FaBolt /> BUY NOW
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="col-lg-7 ps-lg-4 mt-4 mt-lg-0">
            <div className="fk-pd-info-section">

              <p className="text-muted fk-pd-brand mb-1 fw-medium text-uppercase">{product.category}</p>
              <h1 className="fk-pd-title text-dark fw-normal mb-3">{product.name}</h1>

              {/* Ratings */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-success text-white px-2 rounded-1 fw-bold fs-6 d-flex align-items-center gap-1">
                  <span>{product?.rating ?? 4.8}</span>
                  <span style={{ fontSize: '0.8rem' }}>★</span>
                </div>
                <span className="text-muted fw-medium small">120 Ratings & 14 Reviews</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" height="20" className="ms-3" />
              </div>

              {/* Price Area */}
              <div className="d-flex align-items-end mb-1 mt-4">
                <h2 className="fw-bold m-0 fs-1 text-dark">
                  ₹{Number(product?.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </h2>
                <span className="text-muted text-decoration-line-through ms-3 fs-5 mb-1">
                  ₹{Number((product?.price || 0) * 1.4).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-success fw-bold ms-3 fs-5 mb-1">28% off</span>
              </div>
              <div className="small fw-medium mb-4" style={{ color: '#878787' }}>Inclusive of all taxes</div>

              {/* Offers */}
              <div className="fk-offers mb-4">
                <h6 className="fw-bold fs-6 mb-3 text-dark">Available offers</h6>
                <div className="d-flex align-items-start gap-2 mb-2 pb-1">
                  <FaTag className="text-success mt-1 flex-shrink-0" />
                  <span className="fw-medium text-dark flex-grow-1" style={{ fontSize: '0.9rem' }}>
                    <span className="fw-bold">Bank Offer</span> 10% off on HDFC Bank Credit Card EMI Transactions, up to ₹1,500 on orders of ₹7,500 and above
                  </span>
                </div>
                <div className="d-flex align-items-start gap-2 mb-2 pb-1">
                  <FaTag className="text-success mt-1 flex-shrink-0" />
                  <span className="fw-medium text-dark flex-grow-1" style={{ fontSize: '0.9rem' }}>
                    <span className="fw-bold">Special Price</span> Get extra 5% off (price inclusive of cashback/coupon)
                  </span>
                </div>
              </div>

              {/* Size Selection */}
              {showSizes && (
                <div className="fk-sizes-wrap border-top pt-4 mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="fs-6 fw-bold text-dark me-3" style={{ width: '60px' }}>Size</span>
                    {!anySizeInStock && <span className="text-danger fw-bold small">Out of stock completely</span>}
                  </div>
                  <div className="d-flex flex-wrap gap-2 pe-md-5 ps-md-2" style={{ marginLeft: '60px', marginTop: '-15px' }}>
                    {sizes.map((s) => {
                      const sizeLabel = String(s?.size ?? "");
                      const sizeStock = Number(s?.stock || 0);
                      const disabled = sizeStock <= 0;
                      const active = selectedSize === sizeLabel;

                      return (
                        <div key={sizeLabel} className="position-relative">
                          <button
                            type="button"
                            className={`fk-size-box fw-bold ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                            onClick={() => !disabled && setSelectedSize(sizeLabel)}
                            disabled={disabled}
                          >
                            {sizeLabel}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Stock Feedback */}
                  {selectedSize && (
                    <div className="small fw-bold mt-2 ps-md-2" style={{ marginLeft: '60px' }}>
                      {(() => {
                        const sizeObj = sizes.find((s) => String(s?.size ?? "") === selectedSize);
                        const stockVal = sizeObj ? Number(sizeObj?.stock || 0) : 0;
                        if (stockVal === 0) return <span className="text-danger">Out of Stock</span>;
                        if (stockVal <= 5) return <span className="text-danger">Hurry, only {stockVal} left!</span>;
                        return <span className="text-success">In Stock</span>;
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* General Stock (If no sizes) */}
              {!showSizes && (
                <div className="mb-4">
                  <h5 className={`fw-bold ${inStock ? 'text-success' : 'text-danger'}`}>
                    {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </h5>
                </div>
              )}

              {/* General Highlights / Description */}
              <div className="fk-highlights border-top pt-4 mb-4">
                <div className="d-flex align-items-start mb-3">
                  <span className="fs-6 text-muted fw-bold me-3" style={{ width: '90px' }}>Description</span>
                  <div className="flex-grow-1 pt-1 pb-3">
                    <p className="text-dark m-0 lh-lg" style={{ fontSize: '0.95rem' }}>
                      {product.description || "Premium quality sports gear designed for maximum performance and durability. Tested under extreme conditions to ensure reliability."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="fk-highlights border-top border-bottom py-4 mb-4">
                <div className="row">
                  <div className="col-12 col-md-6 d-flex gap-3 mb-3 mb-md-0 align-items-center">
                    <FaTruck size={28} className="text-muted" />
                    <div>
                      <div className="fw-bold">Free Delivery</div>
                      <div className="text-muted small">Delivery by Tomorrow</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 d-flex gap-3 align-items-center border-md-start ps-md-4">
                    <FaUndo size={28} className="text-muted" />
                    <div>
                      <div className="fw-bold">10 Days Return</div>
                      <div className="text-muted small">No questions asked</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Footer */}
      <div className="fk-sticky-mobile-footer d-lg-none position-fixed bottom-0 start-0 w-100 bg-white row g-0 border-top shadow-lg" style={{ zIndex: 1030 }}>
        <div className="col-6">
          <button
            className="btn w-100 h-100 fw-bold bg-white text-dark rounded-0 border-0 py-3 d-flex align-items-center justify-content-center"
            onClick={addToCartNow}
            disabled={!inStock || cartLoading}
          >
            ADD TO CART
          </button>
        </div>
        <div className="col-6">
          <button
            className="btn w-100 h-100 fw-bold text-white rounded-0 border-0 py-3 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#fb641b' }}
            onClick={() => {
              if (showSizes && !selectedSize) {
                toast.error("Please select a size first.");
                return;
              }
              navigate("/checkout");
            }}
            disabled={!inStock}
          >
            BUY NOW
          </button>
        </div>
      </div>

    </div>
  );
}

export default ProductDetail;
