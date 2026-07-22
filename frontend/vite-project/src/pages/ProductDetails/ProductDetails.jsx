import React, { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import StoreShell from "../../components/StoreShell";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductPrice from "./ProductPrice";
import ProductActions from "./ProductActions";
import ProductQuantity from "./ProductQuantity";
import ProductReviews from "./ProductReviews";
import RelatedProducts from "./RelatedProducts";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import ImageLightbox from "./ImageLightbox";
import StickyPurchaseBar from "./StickyPurchaseBar";

import { useProduct } from "./hooks/useProduct";
import { useReviews } from "./hooks/useReviews";

import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const sizeSectionRef = useRef(null);

  // Hook 1: Product state and operations
  const {
    product,
    loading,
    qty,
    setQty,
    selectedImage,
    setSelectedImage,
    selectedSize,
    setSelectedSize,
    sizeError,
    setSizeError,
    cartLoading,
    relatedProducts,
    wishlisted,
    pincodeStatus,
    deliveryText,
    fbtCheckedItems,
    bundleLoading,
    gallery,
    fbtItems,
    fbtPricing,
    sizes,
    showSizes,
    handleFbtToggle,
    addBundleToCart,
    toggleWishlist,
    shareProduct,
    onCheckPincode,
    onPincodeInvalid,
    addToCartNow
  } = useProduct(id, addToCart, navigate);

  // Hook 2: Reviews state and operations
  const {
    reviewSubmitting,
    showReviewForm,
    setShowReviewForm,
    selectedRatingFilter,
    setSelectedRatingFilter,
    onlyWithImagesFilter,
    setOnlyWithImagesFilter,
    votedReviews,
    activeLightboxReviewImage,
    setActiveLightboxReviewImage,
    combinedReviews,
    ratingDistribution,
    getStarPercentage,
    filteredReviews,
    allReviewImages,
    handleHelpfulVote,
    onReviewSubmit
  } = useReviews(id, isAuthenticated, navigate);

  // Lightbox UI States
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);

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

  const inStock = product ? Number(product.stock || 0) > 0 : false;
  const parsedBrand = product
    ? product.brand?.name || (typeof product.brand === "string" ? product.brand : "") || product.name?.split(" ")[0]?.toUpperCase() || "SPORTZONE"
    : "SPORTZONE";

  return (
    <StoreShell>
      <div className="sz-pd-modern-page">
        <div className="container-fluid sz-pd-container py-3">
          
          {/* Breadcrumbs */}
          <div className="sz-pd-breadcrumb mb-4 text-muted small">
            <Link to={`/shop?category=${product.category}`}>{product.category}</Link> &nbsp;/&nbsp; <span className="text-dark fw-bold">{product.name}</span>
          </div>

          <div className="row g-4">
            
            {/* LEFT COLUMN: Gallery with hover zoom */}
            <div className="col-lg-5 col-md-6 col-12">
              <ProductGallery
                gallery={gallery}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                wishlisted={wishlisted}
                toggleWishlist={toggleWishlist}
                shareProduct={shareProduct}
                product={product}
                openLightboxAtIndex={openLightboxAtIndex}
              />
            </div>

            {/* MIDDLE COLUMN: Details */}
            <div className="col-lg-4 col-md-6 col-12 px-md-3">
              <ProductInfo
                product={product}
                parsedBrand={parsedBrand}
                combinedReviews={combinedReviews}
                inStock={inStock}
                showSizes={showSizes}
                sizes={sizes}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                sizeError={sizeError}
                setSizeError={setSizeError}
                sizeSectionRef={sizeSectionRef}
                pincodeStatus={pincodeStatus}
                deliveryText={deliveryText}
                onCheckPincode={onCheckPincode}
                onPincodeInvalid={onPincodeInvalid}
                qty={qty}
                setQty={setQty}
              />
            </div>

            {/* RIGHT COLUMN: Desktop Sticky Buy Panel */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="sz-pd-desktop-sticky-panel d-flex flex-column gap-3">
                
                {/* Pricing info */}
                <ProductPrice price={product.price} variant="desktop-panel" />

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
                <ProductQuantity qty={qty} setQty={setQty} inStock={inStock} variant="desktop" />

                {/* Purchase buttons */}
                <ProductActions
                  product={product}
                  selectedSize={selectedSize}
                  qty={qty}
                  inStock={inStock}
                  cartLoading={cartLoading}
                  addToCartNow={addToCartNow}
                  navigate={navigate}
                  showSizes={showSizes}
                  setSizeError={setSizeError}
                  sizeSectionRef={sizeSectionRef}
                />

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

          {/* Frequently Bought Together Bundle */}
          <FrequentlyBoughtTogether
            product={product}
            fbtItems={fbtItems}
            fbtCheckedItems={fbtCheckedItems}
            fbtPricing={fbtPricing}
            handleFbtToggle={handleFbtToggle}
            addBundleToCart={addBundleToCart}
            bundleLoading={bundleLoading}
            sizeSectionRef={sizeSectionRef}
          />

          {/* Reviews section */}
          <ProductReviews
            product={product}
            combinedReviews={combinedReviews}
            filteredReviews={filteredReviews}
            ratingDistribution={ratingDistribution}
            getStarPercentage={getStarPercentage}
            allReviewImages={allReviewImages}
            votedReviews={votedReviews}
            handleHelpfulVote={handleHelpfulVote}
            selectedRatingFilter={selectedRatingFilter}
            setSelectedRatingFilter={setSelectedRatingFilter}
            onlyWithImagesFilter={onlyWithImagesFilter}
            setOnlyWithImagesFilter={setOnlyWithImagesFilter}
            showReviewForm={showReviewForm}
            setShowReviewForm={setShowReviewForm}
            reviewSubmitting={reviewSubmitting}
            onReviewSubmit={onReviewSubmit}
            setActiveLightboxReviewImage={setActiveLightboxReviewImage}
          />

          {/* Related products */}
          <RelatedProducts relatedProducts={relatedProducts} />

        </div>

        {/* Mobile Sticky CTA Footer */}
        <StickyPurchaseBar
          inStock={inStock}
          cartLoading={cartLoading}
          addToCartNow={addToCartNow}
          navigate={navigate}
          product={product}
          selectedSize={selectedSize}
          qty={qty}
          showSizes={showSizes}
          setSizeError={setSizeError}
          sizeSectionRef={sizeSectionRef}
        />
      </div>

      {/* Lightbox / review modals */}
      <ImageLightbox
        showLightbox={showLightbox}
        setShowLightbox={setShowLightbox}
        lightboxIndex={lightboxIndex}
        setLightboxIndex={setLightboxIndex}
        lightboxZoom={lightboxZoom}
        setLightboxZoom={setLightboxZoom}
        gallery={gallery}
        product={product}
        nextLightboxImage={nextLightboxImage}
        prevLightboxImage={prevLightboxImage}
        activeLightboxReviewImage={activeLightboxReviewImage}
        setActiveLightboxReviewImage={setActiveLightboxReviewImage}
      />

    </StoreShell>
  );
}

export default ProductDetails;
