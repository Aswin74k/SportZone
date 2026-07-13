import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../../utils/mediaUrl";
import "./Banners.css";

export default function FlashBanner({ banner }) {
  const navigate = useNavigate();
  const endDate = banner?.end_date;

  // Initialize countdown state safely
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!endDate) return null;
    const difference = +new Date(endDate) - +new Date();
    if (difference <= 0) return null;

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  });

  useEffect(() => {
    if (!endDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();
      if (difference <= 0) return null;

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!banner) return null;

  const handleClick = () => {
    if (banner.button_link) {
      if (banner.button_link.startsWith("http")) {
        window.open(banner.button_link, "_blank", "noopener,noreferrer");
      } else {
        navigate(banner.button_link);
      }
    } else {
      navigate("/shop");
    }
  };

  const customBgStyle = {
    backgroundColor: banner.background_color || "#090d16",
  };

  return (
    <div className="sz-store-banner-section py-4">
      <div className="container-fluid container-xl">
        <div className="sz-flash-hero-container position-relative" style={customBgStyle}>
          
          {/* Background image if configured */}
          {banner.background_image && (
            <div 
              className="sz-flash-hero-backdrop"
              style={{ backgroundImage: `url(${mediaUrl(banner.background_image)})` }}
            />
          )}
          
          <div className="sz-flash-hero-overlay"></div>
          <div className="sz-flash-ambient-glow"></div>
          <div className="sz-flash-ambient-glow-bottom"></div>

          <div className="row align-items-center g-4 p-4 p-lg-5 position-relative z-3 sz-flash-hero-content">
            
            {/* Text & Action Column */}
            <div className="col-md-7 text-start">
              <span className="sz-badge-premium badge-flash mb-3">
                ⚡ FLASH SALE
              </span>
              
              <h1 className="display-4 fw-extrabold text-white mb-2 tracking-tight">
                {banner.title}
              </h1>
              
              {banner.subtitle && (
                <h3 className="h4 text-white-50 mb-3 fw-normal">
                  {banner.subtitle}
                </h3>
              )}

              {/* Discount Percentage Bubble */}
              {banner.discount_percentage && (
                <div className="sz-flash-discount-bubble mb-4">
                  <span className="percentage">{banner.discount_percentage}%</span>
                  <span className="label">
                    OFF<br />NOW
                  </span>
                </div>
              )}

              {/* Countdown Timer Block */}
              {timeLeft ? (
                <div className="sz-flash-countdown mb-4">
                  <div className="countdown-box">
                    <span className="val">{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="lbl">hrs</span>
                  </div>
                  <span className="sep">:</span>
                  <div className="countdown-box">
                    <span className="val">{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="lbl">mins</span>
                  </div>
                  <span className="sep">:</span>
                  <div className="countdown-box">
                    <span className="val">{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className="lbl">secs</span>
                  </div>
                </div>
              ) : (
                banner.end_date && <p className="text-danger fw-bold mb-4">Offer Has Expired</p>
              )}

              <button
                onClick={handleClick}
                className="btn sz-btn-flash px-4 py-2.5 fw-bold text-uppercase"
              >
                {banner.button_text || "Shop Now"}
              </button>
            </div>

            {/* Product Image Column */}
            <div className="col-md-5 sz-flash-img-col">
              <div className="sz-flash-img-wrapper">
                {banner.product_image ? (
                  <img
                    src={mediaUrl(banner.product_image)}
                    alt={banner.title || "Promotion Product"}
                    className="img-fluid sz-flash-product-image"
                    loading="lazy"
                  />
                ) : (
                  banner.desktop_image && (
                    <img
                      src={mediaUrl(banner.desktop_image)}
                      alt={banner.title || "Promotion Fallback"}
                      className="img-fluid sz-flash-product-image"
                      loading="lazy"
                    />
                  )
                )}
                <div className="sz-flash-ring"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
