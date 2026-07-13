import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import LimitedOfferBanner from "./LimitedOfferBanner";
import "./Banners.css";

export default function ProductOfferBanners({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  // Filter active banners of type "limited_offer"
  const activeBanners = banners
    .filter(b => b.is_active && (b.banner_type === "limited_offer" || b.type === "limited_offer" || b.type === "limited"))
    .map(b => {
      let button_link = b.button_link || "/shop";
      if (b.product_id || b.product) {
        const prodId = b.product_id || (b.product?.id || b.product);
        button_link = `/product/${prodId}`;
      } else if (b.category_id || b.category) {
        const catSlug = b.category?.slug || b.category;
        if (catSlug) {
          button_link = `/shop?category=${catSlug}`;
        }
      }

      return {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        offer_text: b.offer_text || "10% Instant Discount on credit cards",
        banner_type: "limited_offer",
        background_color: b.background_color || "#0f172a",
        theme: b.background_color ? "custom" : "dark-neon",
        button_text: b.button_text || "Shop Now",
        button_link,
        badge_text: "GOAT SALE",
        product_image: b.product_image ? b.product_image : null,
        background_image: b.background_image ? b.background_image : null,
        is_active: true
      };
    });

  // Track screensize to determine visible cards in track (with peeking margins)
  useEffect(() => {
    const handleResize = () => {
      let base = 2.5;
      if (window.innerWidth < 576) {
        base = 1.15; // Shows 1 full card + 15% peek on mobile
      } else if (window.innerWidth < 992) {
        base = 1.8;  // Shows 1 full card + 80% peek on tablet
      } else {
        base = 2.5;  // Shows 2 full cards + 50% peek on desktop (Flipkart style)
      }

      // If we have more banners than the integer floor capacity, show a peeking card
      if (activeBanners.length > Math.floor(base)) {
        setVisibleCards(base);
      } else {
        setVisibleCards(activeBanners.length || 1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const maxScroll = Math.max(0, activeBanners.length - visibleCards);
  const maxIndex = Math.ceil(maxScroll);
  const safeIndex = Math.min(currentIndex, maxIndex);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Dots represent scroll pages
  const totalDots = maxIndex + 1;
  const translatePercent = Math.min(safeIndex, maxScroll) * (100 / visibleCards);

  return (
    <div className="sz-offer-banners-section py-4">
      <div className="container-fluid container-xl">
        <div className="d-flex align-items-center justify-content-between mb-3 px-1">
          <div>
            <h2 className="sz-section-title text-start mb-1">
              Exclusive Offers <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "#64748b", textTransform: "none", marginLeft: "0.5rem" }}>| Bank & Brand Deals</span>
            </h2>
            <p className="text-muted text-start mb-0" style={{ fontSize: "0.82rem", fontWeight: "500", marginTop: "2px" }}>
              Unlock instant discounts and rewards with our payment partners
            </p>
          </div>
          {maxIndex > 0 && (
            <div className="d-flex gap-2">
              <button
                onClick={handlePrev}
                disabled={safeIndex === 0}
                className="sz-offer-nav-btn"
                style={{ opacity: safeIndex === 0 ? 0.35 : 1, cursor: safeIndex === 0 ? "default" : "pointer" }}
                aria-label="Previous Offer"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                disabled={safeIndex === maxIndex}
                className="sz-offer-nav-btn"
                style={{ opacity: safeIndex === maxIndex ? 0.35 : 1, cursor: safeIndex === maxIndex ? "default" : "pointer" }}
                aria-label="Next Offer"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Window */}
        <div className="sz-offer-banners-window position-relative">
          <div 
            className={`sz-offer-banners-track d-flex ${
              activeBanners.length === 1 
                ? "count-1" 
                : activeBanners.length === 2 
                ? "count-2" 
                : "count-multi"
            }`}
            style={{ 
              transform: `translateX(-${translatePercent}%)`,
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {activeBanners.map((banner, index) => (
              <div 
                key={banner.id || index}
                className="sz-offer-banner-slide flex-shrink-0"
                style={{ width: `${100 / visibleCards}%` }}
              >
                <LimitedOfferBanner banner={banner} />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Dots */}
        {totalDots > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-3 pt-1">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                className={`sz-offer-dot ${idx === safeIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
