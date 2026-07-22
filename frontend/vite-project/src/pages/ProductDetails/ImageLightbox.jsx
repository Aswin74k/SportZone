import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMinus, FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function ImageLightbox({
  showLightbox,
  setShowLightbox,
  lightboxIndex,
  setLightboxIndex,
  lightboxZoom,
  setLightboxZoom,
  gallery,
  product,
  nextLightboxImage,
  prevLightboxImage,
  activeLightboxReviewImage,
  setActiveLightboxReviewImage
}) {
  return (
    <>
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
    </>
  );
}
