import React from "react";

export default function FullWidthBanner({ banner, mediaUrl, handleBannerClick }) {
  const bannerImage = mediaUrl(banner.image) || banner.image;

  return (
    <div
      className="hero-slide"
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
        alt="Promotional Banner"
      />
    </div>
  );
}
