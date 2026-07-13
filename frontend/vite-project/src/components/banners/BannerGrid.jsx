import React from "react";
import CollectionBanner from "./CollectionBanner";
import LimitedOfferBanner from "./LimitedOfferBanner";
import "./Banners.css";

export default function BannerGrid({ banners = [] }) {
  // Filter active banners by types
  const collectionBanners = banners.filter(
    (b) => (b.banner_type === "collection" || b.type === "collection") && b.is_active
  );

  // Gather active items dynamically to eliminate placeholders
  const activeItems = [];
  
  if (collectionBanners[0]) {
    activeItems.push({ type: "collection", banner: collectionBanners[0] });
  }
  if (collectionBanners[1]) {
    activeItems.push({ type: "collection", banner: collectionBanners[1] });
  }
  if (collectionBanners[2]) {
    activeItems.push({ type: "collection", banner: collectionBanners[2] });
  }

  // If no banners exist at all, return null
  if (activeItems.length === 0) return null;

  return (
    <div className="sz-store-banner-section py-4">
      <div className="container-fluid container-xl">
        <div className={`sz-banners-grid-row sz-grid-cols-${activeItems.length}`}>
          {activeItems.map((item, index) => (
            <div className="sz-grid-item" key={item.banner.id || index}>
              <CollectionBanner banner={item.banner} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
