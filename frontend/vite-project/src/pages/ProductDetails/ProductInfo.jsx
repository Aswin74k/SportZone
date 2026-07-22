import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FaStar,
  FaExclamationCircle,
  FaCheck,
  FaInfoCircle,
  FaPlus,
  FaTruck,
  FaUndo,
  FaLock,
  FaShieldAlt
} from "react-icons/fa";
import ProductPrice from "./ProductPrice";
import ProductQuantity from "./ProductQuantity";

export default function ProductInfo({
  product,
  parsedBrand,
  combinedReviews,
  inStock,
  showSizes,
  sizes,
  selectedSize,
  setSelectedSize,
  sizeError,
  setSizeError,
  sizeSectionRef,
  pincodeStatus,
  deliveryText,
  onCheckPincode,
  onPincodeInvalid,
  qty,
  setQty
}) {
  const [activeTab, setActiveTab] = useState("description");

  const toggleTab = (tab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const {
    register: registerPincode,
    handleSubmit: handlePincodeSubmit,
  } = useForm({
    defaultValues: { pincode: "" }
  });

  return (
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
      <ProductPrice price={product.price} />

      <hr className="my-1 border-slate-200" />

      {/* Size Selector */}
      {showSizes && (
        <div ref={sizeSectionRef} className="d-flex flex-column gap-2">
          <div className="sz-pd-size-header d-flex align-items-center flex-wrap">
            <span className="small fw-bold uppercase tracking-wider text-dark">Select Size</span>
            {sizeError && (
              <span className="sz-pd-size-error text-danger fw-bold ms-3 small d-flex align-items-center gap-1 animate-pulse" style={{ fontSize: "0.8rem" }}>
                <FaExclamationCircle /> Please select a size
              </span>
            )}
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
                  onClick={() => {
                    if (!disabled) {
                      setSelectedSize(sizeLabel);
                      setSizeError(false);
                    }
                  }}
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

      {/* Mobile Quantity selector */}
      <div className="d-lg-none mt-2 d-flex flex-column gap-3">
        <ProductQuantity qty={qty} setQty={setQty} inStock={inStock} variant="mobile" />
      </div>

      <hr className="my-1 border-slate-200" />

      {/* Delivery Pin Checker */}
      <div className="sz-pd-pincode-card">
        <div className="small fw-bold uppercase tracking-wider text-dark">Delivery & Service Availability</div>
        <form onSubmit={handlePincodeSubmit(onCheckPincode, onPincodeInvalid)} className="sz-pincode-input-wrapper">
          <input
            type="text"
            className="sz-pincode-field"
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            {...registerPincode("pincode", {
              required: "Pincode is required.",
              pattern: {
                value: /^\d{6}$/,
                message: "Please enter a valid 6-digit pincode."
              }
            })}
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
  );
}
