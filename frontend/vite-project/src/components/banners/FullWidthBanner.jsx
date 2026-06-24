import React from "react";

export default function FullWidthBanner({ banner, mediaUrl, handleBannerClick }) {
  const bannerImage = mediaUrl(banner.image) || banner.image;
  
  // Use admin-defined background color if specified in the backend database
  const customBgStyle = banner.background_color 
    ? { backgroundColor: banner.background_color } 
    : {};

  return (
    <div
      className="hero-slide"
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
      <img
        src={bannerImage}
        alt={banner.title || "Promotional Banner"}
        className="hero-slide-img"
      />
    </div>
  );
}
