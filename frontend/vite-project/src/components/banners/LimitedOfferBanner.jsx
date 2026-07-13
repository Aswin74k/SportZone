import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../../utils/mediaUrl";
import "./Banners.css";

export default function LimitedOfferBanner({ banner }) {
  const navigate = useNavigate();

  if (!banner) return null;

  const handleClick = () => {
    if (banner.product || banner.product_id) {
      const prodId = banner.product?.id || banner.product_id;
      navigate(`/product/${prodId}`);
    } else if (banner.button_link) {
      if (banner.button_link.startsWith("http")) {
        window.open(banner.button_link, "_blank", "noopener,noreferrer");
      } else {
        navigate(banner.button_link);
      }
    } else {
      const slug = banner.category?.slug || banner.category_id || "";
      if (slug) {
        navigate(`/shop?category=${slug}`);
      } else {
        navigate("/shop");
      }
    }
  };

  const bgImg = banner.background_image || banner.desktop_image;
  const productImg = banner.product_image;
  
  const getBannerBgStyle = () => {
    if (bgImg) {
      return {
        backgroundImage: `url(${mediaUrl(bgImg)})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    return {
      backgroundColor: banner.background_color || "#090d16"
    };
  };

  // Helper to determine if a background color is dark or light
  const checkIsDark = (colorStr) => {
    if (!colorStr) return true; // Default to dark (white text)
    
    // Check if it is one of the light preset values or names
    if (
      colorStr === "#f3f4f6" || 
      colorStr === "#faf9f6" || 
      colorStr === "#f5f5f4" || 
      colorStr === "#f5f5f0" ||
      colorStr.toLowerCase() === "white" ||
      colorStr.toLowerCase() === "lightgrey" ||
      colorStr.toLowerCase() === "lightgray"
    ) {
      return false;
    }
    
    // Otherwise, we can compute luminance if it is a hex value
    if (colorStr.startsWith("#") && colorStr.length === 7) {
      const r = parseInt(colorStr.substring(1, 3), 16);
      const g = parseInt(colorStr.substring(3, 5), 16);
      const b = parseInt(colorStr.substring(5, 7), 16);
      // Perceived luminance formula (HSP)
      const luminance = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
      return luminance < 165; // Returns true for dark colors, false for light colors
    }
    
    return true; // Default to dark (white text) for gradients, custom dark hues, etc.
  };

  const isDark = checkIsDark(banner.background_color);

  return (
    <div 
      className={`sz-offer-banner-card position-relative h-100 ${isDark ? "theme-dark" : "theme-light"}`}
      style={getBannerBgStyle()}
      onClick={handleClick}
    >


      {/* Left: Content Block */}
      <div className="sz-offer-banner-left d-flex flex-column justify-content-between text-start">
        <div>


          {/* Title & Subtitle */}
          <h3 className="sz-offer-banner-title mb-1">
            {banner.title}
          </h3>
          <p className="sz-offer-banner-subtitle mb-2">
            {banner.subtitle}
          </p>

          {/* Shop Now CTA Button */}
          <div className="sz-offer-cta-wrap mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="sz-offer-action-btn"
            >
              <span>{banner.button_text || "Shop Now"}</span>
              <span className="sz-offer-btn-arrow">➔</span>
            </button>
          </div>
        </div>

        {/* Bank partner promo strip */}
        {banner.offer_text && (
          <div className="sz-offer-bank-strip d-flex align-items-center gap-2 flex-wrap mt-2">
            <span className="sz-bank-promo-text">
              {banner.offer_text}
            </span>
          </div>
        )}
      </div>

      {/* Right: Product Image with pop-out styling */}
      {productImg && (
        <div className="sz-offer-banner-right position-relative">
          {/* 3D glowing background circle behind product image */}
          <div className="sz-offer-product-circle-bg"></div>

          <div 
            className="sz-offer-product-img-frame"
            style={!isDark ? { backgroundColor: banner.background_color } : {}}
          >
            <img 
              src={mediaUrl(productImg)} 
              alt={banner.title} 
              className="sz-offer-product-pop-img"
              loading="lazy"
            />
          </div>
          <div className="sz-offer-product-shadow"></div>
        </div>
      )}
    </div>
  );
}
