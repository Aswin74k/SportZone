import React from "react";

// Helper to determine if a background color is light or dark
function isBgColorLight(color) {
  if (!color) return false;
  const normalized = color.trim().toLowerCase();
  if (normalized.startsWith("#")) {
    const hex = normalized.substring(1);
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180; // Light threshold
  }
  const lightNames = [
    "white", "yellow", "lightgray", "lightblue", "lightcyan", "lightgreen",
    "lightpink", "lightyellow", "lavender", "aliceblue", "ghostwhite",
    "honeydew", "ivory", "azure", "snow", "seashell", "beige", "cornsilk", "cyan"
  ];
  return lightNames.includes(normalized);
}

export default function DynamicBanner({ banner, mediaUrl, handleBannerClick }) {
  const product = banner.linked_product || banner.product;
  const ctaText = banner.button_text || "Shop Now";
  const badgeText = banner.badge_text || (banner.banner_type ? banner.banner_type.replace("_", " ") : "Spotlight");
  
  // Cutout Image: use product image if available, else fallback to banner image itself
  const cutoutImageSrc = product ? (mediaUrl(product.image) || product.image) : (mediaUrl(banner.image) || banner.image);
  
  const hasPrice = product && (product.price !== undefined && product.price !== null);
  const discountPercent = banner.offer_percent;
  const cashbackText = banner.cashback_text;
  
  // Background custom styling
  const customBgStyle = banner.background_color 
    ? { backgroundColor: banner.background_color } 
    : {};

  const isLight = isBgColorLight(banner.background_color);
  const themeClass = isLight ? "sz-theme-light" : "sz-theme-dark";

  const brandLogo = product?.brand?.logo;
  const brandLogoUrl = brandLogo ? mediaUrl(brandLogo) || brandLogo : null;

  return (
    <div
      className={`sz-slide ${themeClass}`}
      style={customBgStyle}
      onClick={() => handleBannerClick(banner)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleBannerClick(banner);
        }
      }}
    >
      {/* Animated Mesh Gradient Circles (Only on dark backgrounds for subtle contrast) */}
      {!isLight && (
        <div className="sz-slider-mesh-glow">
          <div className="sz-mesh-sphere sphere-1"></div>
          <div className="sz-mesh-sphere sphere-2"></div>
          <div className="sz-mesh-sphere sphere-3"></div>
        </div>
      )}

      <div className="container h-100 position-relative z-2">
        <div className="sz-slide-grid">
          {/* Left: Content Panel */}
          <div className="sz-hero-content-panel">
            {/* Logo / Badge */}
            {brandLogoUrl ? (
              <div className="sz-hero-brand-logo-wrap">
                <img
                  src={brandLogoUrl}
                  alt={product?.brand?.name || "Brand Logo"}
                  className="sz-hero-brand-logo"
                />
              </div>
            ) : (
              <span className="sz-hero-category">{badgeText}</span>
            )}
            
            <h2 className="sz-hero-title">{banner.title}</h2>
            
            {/* Price Panel */}
            {hasPrice && (
              <div className="sz-hero-price-panel">
                <span className="sz-hero-price-prefix">From </span>
                <span className="sz-hero-price-current">₹{Math.floor(product.price).toLocaleString('en-IN')}</span>
                {product.original_price && (
                  <span className="sz-hero-price-original">₹{Math.floor(product.original_price).toLocaleString('en-IN')}</span>
                )}
              </div>
            )}
            
            {banner.subtitle && <p className="sz-hero-subtitle">{banner.subtitle}</p>}
            
            {/* Promo Badges */}
            {(discountPercent || cashbackText) && (
              <div className="sz-hero-badge-row">
                {discountPercent && (
                  <span className="sz-hero-badge-discount">{discountPercent}% Off</span>
                )}
                {cashbackText && (
                  <span className="sz-hero-badge-cashback">{cashbackText}</span>
                )}
              </div>
            )}
            
            {/* CTA Button / Link */}
            {ctaText && (
              <div className="sz-hero-cta-wrapper">
                <span className="sz-hero-cta-link">
                  {ctaText}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
              </div>
            )}

            {/* Secondary Text */}
            {banner.secondary_text && (
              <div className="sz-hero-secondary-wrap">
                {banner.secondary_text.includes("|") ? (
                  <div className="sz-hero-secondary-split">
                    {banner.secondary_text.split("|").map((t, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="sz-hero-secondary-divider">|</span>}
                        <span className="sz-hero-secondary-item">{t.trim()}</span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="sz-hero-secondary-badge">
                    {banner.secondary_text}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right: Cutout Image Showcase */}
          <div className="sz-hero-cutout-wrap">
            <div className="sz-hero-cutout-glow"></div>
            {cutoutImageSrc && (
              <img
                src={cutoutImageSrc}
                alt={banner.title || "Featured Product"}
                className="sz-hero-cutout-img"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

