import React, { useState, useEffect } from "react";
import { FaShareAlt } from "react-icons/fa";
import ProductWishlist from "./ProductWishlist";

export default function ProductGallery({
  gallery,
  selectedImage,
  setSelectedImage,
  wishlisted,
  toggleWishlist,
  shareProduct,
  product,
  openLightboxAtIndex
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [selectedImage]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
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
                aria-label={`Select product thumbnail ${idx + 1}`}
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
          }}
          onClick={() => openLightboxAtIndex(gallery.indexOf(selectedImage))}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightboxAtIndex(gallery.indexOf(selectedImage))}
          aria-label={`View larger image of ${product.name}`}
        >

          {/* Image overlay actions */}
          <div className="sz-pd-img-action-overlay">
            <ProductWishlist wishlisted={wishlisted} toggleWishlist={toggleWishlist} />
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

          {!imageLoaded && (
            <div className="sz-skeleton-loader sz-pd-gallery-skeleton" />
          )}

          <img
            src={selectedImage || "/no-image.png"}
            alt={product.name}
            className={`sz-pd-zoomable-img ${imageLoaded ? "loaded" : "loading"}`}
            onLoad={() => setImageLoaded(true)}
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
  );
}
