import React, { useEffect, useState } from "react";
import StoreShell from "../components/StoreShell";
import BestSellersSection from "../components/BestSellersSection";
import PremiumProductsSection from "../components/PremiumProductsSection";
import DemandSection from "../components/DemandSection";
import NewArrivalsSection from "../components/NewArrivalsSection";
import BannerGrid from "../components/banners/BannerGrid";
import HeroSlider from "../components/banners/HeroSlider";
import ProductOfferBanners from "../components/banners/ProductOfferBanners";
import TrendingUnderSection from "../components/TrendingUnderSection";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";

import "./Home.css";

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch Banners
    API.get("banners/")
      .then((bannersRes) => {
        if (!isMounted) return;
        setBanners(unwrapList(bannersRes.data));
        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error loading homepage resources:", err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StoreShell>
      <div className="sz-home">
        
        {/* 1. HERO WIDESCREEN SLIDER CAROUSEL */}
        {!loading && (
          <HeroSlider banners={banners} />
        )}

        {/* 2. 3-BANNER GRID */}
        {!loading && (
          <BannerGrid banners={banners} />
        )}

        <TrendingUnderSection />

        <BestSellersSection />

        {!loading && (
          <ProductOfferBanners banners={banners} />
        )}

        <NewArrivalsSection />

        <DemandSection />

        {/* 8. CATEGORY PRODUCTS */}
        <PremiumProductsSection />



      </div>
    </StoreShell>
  );
}