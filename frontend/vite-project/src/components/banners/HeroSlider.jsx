import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { mediaUrl } from "../../utils/mediaUrl";
import "./Banners.css";

const renderPriceText = (priceText) => {
  if (!priceText) return null;
  const match = priceText.match(/^(₹\s*\d+)\s+(onwards)$/i);
  if (match) {
    return (
      <span className="sz-price-wrap">
        <span className="sz-price-amount">{match[1]}</span>
        <span className="sz-price-suffix">{match[2]}</span>
      </span>
    );
  }
  return priceText;
};

// Slide variants for horizontal sliding
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
    },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
    },
  }),
};

export default function HeroSlider({ banners = [] }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const navigate = useNavigate();

  const defaultSlides = [
    {
      title: "The Ultimate Running Shoes",
      subtitle: "Built to outrun the daily grind",
      price_text: "₹1599 onwards",
      button_text: "SHOP NOW",
      button_link: "/shop?category=running",
      image: "https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Monsoon Football Cleats",
      subtitle: "Grip and speed on wet pitches",
      price_text: "₹2499 onwards",
      button_text: "SHOP NOW",
      button_link: "/shop?category=football",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Premium Cricket Bats",
      subtitle: "Power and precision for matches",
      price_text: "₹3999 onwards",
      button_text: "SHOP NOW",
      button_link: "/shop?category=cricket",
      image: "https://images.unsplash.com/photo-1531415080290-bc98545ab2ef?q=80&w=1200&auto=format&fit=crop",
    }
  ];

  // Merge default slides with dynamic banners
  const dynamicSlides = banners
    .filter(b => b.is_active && (b.banner_type === "flash_sale" || b.type === "flash"))
    .map(b => {
      const hasBgImage = b.background_image || b.desktop_image;
      
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
        title: b.title || "SportZone Gear",
        subtitle: b.subtitle || "Performance & Comfort",
        price_text: b.offer_text || (b.discount_percentage ? `Upto ${b.discount_percentage}% OFF` : "Shop Now"),
        button_text: b.button_text || "SHOP NOW",
        button_link,
        image: hasBgImage ? mediaUrl(hasBgImage) : null,
        product_image: b.product_image ? mediaUrl(b.product_image) : null,
        background_color: b.background_color || null,
      };
    });

  const slides = dynamicSlides.length > 0 ? dynamicSlides : defaultSlides;

  // Wrap index to keep it within slides array bounds
  const currentIndex = (page % slides.length + slides.length) % slides.length;

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, page]);

  if (slides.length === 0) return null;

  const handleNext = () => paginate(1);
  const handlePrev = () => paginate(-1);

  const handleDotClick = (idx) => {
    const newDir = idx > currentIndex ? 1 : -1;
    setPage([idx, newDir]);
  };

  const handleBtnClick = (slide) => {
    if (slide.button_link) {
      if (slide.button_link.startsWith("http")) {
        window.open(slide.button_link, "_blank", "noopener,noreferrer");
      } else {
        navigate(slide.button_link);
      }
    } else {
      navigate("/shop");
    }
  };

  return (
    <div className="sz-hero-slider-section py-3">
      <div className="container-fluid container-xl">
        <div className="sz-hero-slider position-relative overflow-hidden">
          
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="sz-hero-slide w-100 h-100 d-flex align-items-center justify-content-between"
              style={
                slides[currentIndex].image
                  ? { backgroundImage: `url(${slides[currentIndex].image})` }
                  : slides[currentIndex].background_color
                  ? { backgroundColor: slides[currentIndex].background_color }
                  : {
                      backgroundColor: "#090d16",
                      backgroundImage: "linear-gradient(135deg, #090d16 0%, #1e293b 100%)",
                    }
              }
            >
              {/* Overlay for legibility */}
              <div className="sz-hero-slide-overlay" />

              {/* Content Panel */}
              <div className="sz-hero-slide-content text-start">
                <motion.h1 
                  className="sz-hero-slide-title"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  {slides[currentIndex].title}
                </motion.h1>

                <motion.p 
                  className="sz-hero-slide-subtitle"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {slides[currentIndex].subtitle}
                </motion.p>

                {slides[currentIndex].price_text && (
                  <motion.div 
                    className="sz-hero-slide-price"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {renderPriceText(slides[currentIndex].price_text)}
                  </motion.div>
                )}

                <motion.button
                  onClick={() => handleBtnClick(slides[currentIndex])}
                  className="sz-hero-slide-btn"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {slides[currentIndex].button_text}
                </motion.button>
              </div>

              {/* Floating Product Image (if uploaded) */}
              {slides[currentIndex].product_image && (
                <div className="sz-hero-slide-product-wrap d-none d-md-flex align-items-center justify-content-center">
                  <motion.img 
                    key={`prod-img-${currentIndex}`}
                    src={slides[currentIndex].product_image} 
                    alt={slides[currentIndex].title} 
                    className="sz-hero-slide-product-img"
                    initial={{ scale: 0.8, opacity: 0, x: 50 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 90 }}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <>
              <button 
                onClick={handlePrev} 
                className="sz-hero-arrow sz-hero-arrow-left" 
                aria-label="Previous slide"
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext} 
                className="sz-hero-arrow sz-hero-arrow-right" 
                aria-label="Next slide"
              >
                <FiChevronRight size={20} />
              </button>

              {/* Dot Indicators */}
              <div className="sz-hero-dots-wrap">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`sz-hero-dot ${idx === currentIndex ? "active" : ""}`}
                    onClick={() => handleDotClick(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
