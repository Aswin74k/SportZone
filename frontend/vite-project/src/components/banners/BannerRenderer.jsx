import React from "react";
import FullWidthBanner from "./FullWidthBanner";
import DynamicBanner from "./DynamicBanner";
import "./Banners.css";

export default function BannerRenderer({ banner, mediaUrl, handleBannerClick }) {
  if (!banner) return null;

  // If the banner has a title configured in the admin dashboard, render the dynamic premium layout.
  // Otherwise, render the full-width image containment layout.
  if (banner.title && banner.title.trim() !== "") {
    return (
      <DynamicBanner
        banner={banner}
        mediaUrl={mediaUrl}
        handleBannerClick={handleBannerClick}
      />
    );
  }

  return (
    <FullWidthBanner 
      banner={banner} 
      mediaUrl={mediaUrl} 
      handleBannerClick={handleBannerClick} 
    />
  );
}
