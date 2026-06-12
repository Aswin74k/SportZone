import React from "react";
import FullWidthBanner from "./FullWidthBanner";
import "./Banners.css";

export default function BannerRenderer({ banner, mediaUrl, handleBannerClick }) {
  if (!banner) return null;

  return (
    <FullWidthBanner 
      banner={banner} 
      mediaUrl={mediaUrl} 
      handleBannerClick={handleBannerClick} 
    />
  );
}
