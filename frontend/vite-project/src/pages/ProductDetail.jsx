import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import API from "../api";
import Rating from "../components/Rating";
import { FaTruck, FaUndo } from "react-icons/fa";
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
      toast.error("Please select a size before adding to cart.");
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
    return <div className="container py-5 text-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="container py-5 text-center">Product not found.</div>;
  }

  const inStock = Number(product.stock || 0) > 0;
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const anySizeInStock = sizes.some((s) => Number(s?.stock || 0) > 0);
  const showSizes = sizes.length > 0;

  return (
    <div className="container py-5">
      <div className="row g-4 product-detail-wrap">
        <div className="col-lg-6">
          <div className="product-detail-media card border-0 shadow-sm rounded-4 p-3">
            <img
              src={selectedImage || "/no-image.png"}
              alt={product.name}
              className="product-detail-main-image"
              onError={(e) => {
                e.target.src = "/no-image.png";
              }}
            />

            {gallery.length > 1 && (
              <div className="product-detail-thumbs mt-3">
                {gallery.map((img) => (
                  <button
                    key={img}
                    type="button"
                    className={`product-thumb-btn ${selectedImage === img ? "active" : ""}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt="thumb" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <p className="text-muted mb-2">{product.category}</p>
            <h2 className="fw-bold mb-2">{product.name}</h2>

            <div className="d-flex align-items-center gap-2 mb-3">
              <Rating value={product?.rating ?? 4.8} size={14} showValue={false} />
              <span className="text-muted small">(120 reviews)</span>
            </div>

            <h3 className="text-primary fw-bold mb-3 display-6">
              ₹{Number(product.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </h3>

            <div className="mb-3">
              <span className={`badge ${inStock ? "bg-success" : "bg-danger"}`}>
                {inStock ? `In Stock (${product.stock})` : "Out of Stock"}
              </span>
            </div>

            <p className="text-muted lh-lg mb-4">
              {product.description || "No description available for this product."}
            </p>

            {showSizes && (
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold">Size</span>
                  {!anySizeInStock && (
                    <span className="text-muted small">Out of stock</span>
                  )}
                </div>
                <div className="d-flex flex-wrap gap-2 product-size-wrap">
                  {sizes.map((s) => {
                    const sizeLabel = String(s?.size ?? "");
                    const sizeStock = Number(s?.stock || 0);
                    const disabled = sizeStock <= 0;
                    const active = selectedSize === sizeLabel;

                    return (
                      <button
                        key={sizeLabel}
                        type="button"
                        className={`product-size-btn ${active ? "active" : ""}`}
                        onClick={() => setSelectedSize(sizeLabel)}
                        disabled={disabled}
                        aria-pressed={active}
                      >
                        {sizeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="fw-semibold">Quantity</span>
              <div className="qty-selector">
                <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>
                  -
                </button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((v) => v + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3">
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={addToCartNow}
                disabled={!inStock || cartLoading}
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </button>
              <button
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={() => {
                  if (Array.isArray(product.sizes) && product.sizes.length > 0 && !selectedSize) {
                    toast.error("Please select a size before proceeding.");
                    return;
                  }
                  navigate("/checkout");
                }}
                disabled={!inStock}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4">Ratings & Reviews</h5>
            <div className="d-flex align-items-center gap-3 mb-4">
              <h1 className="fw-bold mb-0 text-dark">{product?.rating ?? 4.8}</h1>
              <div>
                <Rating value={product?.rating ?? 4.8} size={18} showValue={false} />
                <div className="text-muted small mt-1">Based on 120 reviews</div>
              </div>
            </div>
            
            <div className="border-top pt-4">
              <h6 className="fw-semibold mb-1">Feature coming soon</h6>
              <p className="text-muted small mb-0">
                Detailed customer reviews and photo uploads will be available in the next update.
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 d-flex flex-row align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-primary d-flex align-items-center justify-content-center">
              <FaTruck size={22} />
            </div>
            <div>
              <h6 className="fw-bold mb-1">Delivery Info</h6>
              <p className="text-muted mb-0 small">3-5 days delivery</p>
            </div>
          </div>
          <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-primary d-flex align-items-center justify-content-center">
              <FaUndo size={22} />
            </div>
            <div>
              <h6 className="fw-bold mb-1">Return Policy</h6>
              <p className="text-muted mb-0 small">7 days return available</p>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold mb-3">Related Products</h4>
          <div className="row">
            {relatedProducts.map((item) => (
              <div className="col-lg-3 col-md-6 mb-4" key={item.id}>
                <div
                  className="related-card card border-0 shadow-sm rounded-4 p-3 h-100"
                  role="button"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={item.image || "/no-image.png"}
                    alt={item.name}
                    className="related-image"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                  <h6 className="fw-semibold mt-3 mb-1 text-truncate">{item.name}</h6>
                  <span className="text-primary fw-bold">₹{Number(item.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;

