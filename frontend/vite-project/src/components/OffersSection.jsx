import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FaCopy, FaCheck, FaClock, FaArrowRight, FaTicketAlt } from "react-icons/fa";
import API from "../api";
import "./OffersSection.css";

// Helper to calculate countdown time remaining
const calculateTimeLeft = (endTime) => {
  if (!endTime) return null;
  const difference = +new Date(endTime) - +new Date();
  
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }
  return { expired: true };
};

// Subcomponent for handling individual card timer state
const OfferTimer = ({ endsAt }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endsAt));

  useEffect(() => {
    if (!endsAt) return;

    // Tick every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(endsAt);
      setTimeLeft(remaining);
      if (remaining && remaining.expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  if (!timeLeft) {
    return (
      <div className="sz-offer-timer">
        <span className="sz-timer-icon"><FaClock /></span>
        <span className="sz-timer-text">Ongoing Promotion</span>
      </div>
    );
  }

  if (timeLeft.expired) {
    return (
      <div className="sz-offer-timer bg-danger-subtle border-danger-subtle text-danger justify-content-center">
        <span className="sz-timer-icon text-danger"><FaClock /></span>
        <span className="sz-timer-text fw-bold">Offer Expired</span>
      </div>
    );
  }

  return (
    <div className="sz-offer-timer">
      <span className="sz-timer-icon"><FaClock /></span>
      <span className="sz-timer-text d-none d-sm-inline">Expires in:</span>
      <div className="sz-timer-values">
        {timeLeft.days > 0 && (
          <>
            <span className="sz-timer-unit">{timeLeft.days}</span>
            <span className="sz-timer-label">d</span>
            <span className="sz-timer-colon">:</span>
          </>
        )}
        <span className="sz-timer-unit">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="sz-timer-label">h</span>
        <span className="sz-timer-colon">:</span>
        <span className="sz-timer-unit">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="sz-timer-label">m</span>
        <span className="sz-timer-colon">:</span>
        <span className="sz-timer-unit">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="sz-timer-label">s</span>
      </div>
    </div>
  );
};

// Subcomponent for individual Offer card to encapsulate animations and copy states
const OfferCard = ({ offer, variants }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e, code) => {
    e.stopPropagation(); // Avoid triggering card navigation
    if (!code) return;

    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        toast.success(`Promo code "${code}" copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
        toast.error("Failed to copy coupon code.");
      });
  };

  const handleShopNow = () => {
    navigate("/shop");
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "Limited Time";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Limited Time";
    }
  };

  // Convert discount decimal string/number to integer if possible
  const discountVal = parseFloat(offer.discount_percent);
  const formattedDiscount = Number.isInteger(discountVal) 
    ? discountVal 
    : discountVal.toFixed(0);

  return (
    <motion.div 
      className="col-12 col-md-6 col-lg-4 d-flex"
      variants={variants}
      whileHover={{ y: -6 }}
    >
      <div className="sz-offer-card w-100">
        {/* Ribbon for limited time offers */}
        {offer.ends_at && <div className="sz-offer-card__ribbon">Limited Time</div>}

        <div className="sz-offer-card__body">
          {/* Discount badge & Active Status row */}
          <div className="sz-offer-card__badge-wrap">
            <span className="sz-offer-card__discount-badge">
              {formattedDiscount}% OFF
            </span>
            
            {offer.is_active && (
              <span className="sz-active-status">
                <span className="sz-active-dot" />
                Active
              </span>
            )}
          </div>

          {/* Title and description */}
          <h3 className="sz-offer-card__title">{offer.title}</h3>
          <p className="sz-offer-card__description">{offer.description}</p>

          {/* Dash-bordered Promo Code Box */}
          {offer.promo_code && (
            <div className="sz-coupon-box">
              <div>
                <div className="sz-coupon-code-label">Promo Code</div>
                <div className="sz-coupon-code">{offer.promo_code}</div>
              </div>
              <motion.button
                type="button"
                className={`sz-coupon-btn ${copied ? "copied" : ""}`}
                onClick={(e) => handleCopy(e, offer.promo_code)}
                whileTap={{ scale: 0.9 }}
                aria-label="Copy coupon code"
              >
                {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
              </motion.button>
            </div>
          )}

          {/* Timer Countdown Component */}
          {offer.ends_at && <OfferTimer endsAt={offer.ends_at} />}

          {/* Footer Card Section */}
          <div className="sz-offer-footer">
            <div>
              <div className="sz-offer-expiry-label">Valid Until</div>
              <div className="sz-offer-expiry-date">{formatExpiryDate(offer.ends_at)}</div>
            </div>
            <button
              type="button"
              className="sz-shop-now-btn"
              onClick={handleShopNow}
            >
              Shop Now <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Placeholder Cards
const OffersSkeleton = () => (
  <div className="row g-4">
    {[1, 2, 3].map((i) => (
      <div className="col-12 col-md-6 col-lg-4" key={i}>
        <div className="sz-offer-skeleton-card">
          <div className="d-flex justify-content-between align-items-center">
            <div className="sz-skeleton" style={{ width: "35%", height: "28px", borderRadius: "999px" }} />
            <div className="sz-skeleton" style={{ width: "25%", height: "20px", borderRadius: "999px" }} />
          </div>
          <div className="sz-skeleton" style={{ width: "75%", height: "26px", marginTop: "1rem" }} />
          <div className="sz-skeleton" style={{ width: "100%", height: "50px", marginTop: "0.75rem" }} />
          <div className="sz-skeleton" style={{ width: "100%", height: "55px", marginTop: "1.25rem", borderRadius: "12px" }} />
          <div className="sz-skeleton" style={{ width: "100%", height: "45px", marginTop: "1.25rem", borderRadius: "10px" }} />
          <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
            <div className="sz-skeleton" style={{ width: "35%", height: "18px" }} />
            <div className="sz-skeleton" style={{ width: "30%", height: "35px", borderRadius: "999px" }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Main Component
export default function OffersSection() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    API.get("offers/")
      .then((res) => {
        if (!isMounted) return;
        // Filter out expired offers to keep section clean and conversion-focused
        const activeAndValid = (res.data || []).filter((o) => {
          if (!o.is_active) return false;
          if (o.ends_at) {
            const isExpired = +new Date(o.ends_at) - +new Date() <= 0;
            return !isExpired;
          }
          return true;
        });
        setOffers(activeAndValid);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching special offers:", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Framer Motion Stagger Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="sz-offers-section container-fluid px-4 px-md-5">
      <div className="container container-xl">
        {/* Section Header */}
        <motion.div 
          className="sz-offers-header text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <span className="sz-kicker">Exclusive Savings</span>
          <h2 className="sz-section-title fs-1 fw-bold text-navy mb-3">
            Special Offers & Promo Codes
          </h2>
          <p className="sz-offers-subtitle">
            Score championship-level savings on your favorite sports apparel, footwear, and equipment. Copy your favorite code below and elevate your game today!
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <OffersSkeleton />
        ) : (
          <AnimatePresence>
            {offers.length === 0 ? (
              // Empty State
              <motion.div 
                className="sz-offers-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="sz-offers-empty-icon">
                  <FaTicketAlt />
                </div>
                <h3 className="sz-offers-empty-title">No Active Offers Right Now</h3>
                <p className="sz-offers-empty-text">
                  We are currently preparing our next round of champion-grade deals. Sign up for our newsletter or check back soon to grab exclusive coupons!
                </p>
              </motion.div>
            ) : (
              // Active Offers Grid
              <motion.div 
                className="row g-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} variants={itemVariants} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
