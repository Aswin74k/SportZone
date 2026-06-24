import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import API from "../api";
import StoreShell from "../components/StoreShell";
import BannerRenderer from "../components/banners/BannerRenderer";
import { mediaUrl } from "../utils/mediaUrl";
import { unwrapList } from "../utils/unwrapList";
import BestSellersSection from "../components/BestSellersSection";
import PremiumProductsSection from "../components/PremiumProductsSection";
import DemandSection from "../components/DemandSection";
import NewArrivalsSection from "../components/NewArrivalsSection";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Home.css";

// Skeleton Loader component for loading state
function BannerSkeleton() {
  return (
    <div className="sz-hero-carousel-container">
      <div className="sz-banner-skeleton-wrap">
        <div className="sz-banner-skeleton"></div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [realActiveIndex, setRealActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    API.get("banners/")
      .then((res) => {
        if (!isMounted) return;
        const fetchedBanners = unwrapList(res.data);
        const activeBanners = fetchedBanners
          .filter((b) => b.is_active)
          .sort((a, b) => a.sort_order - b.sort_order);
        setBanners(activeBanners);
        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error loading home page banners:", err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeBanners = useMemo(() => {
    if (banners.length > 0) return banners;
    return [
      {
        id: "default-1",
        image: "/banner_apex_pro.png",
        is_active: true,
        sort_order: 1,
      }
    ];
  }, [banners]);

  // Swiper loop mode requires at least 4 slides for decimal slidesPerView to behave correctly.
  // We duplicate slides if count is 2 or 3 to prevent the alignment from shifting to the right.
  const sliderSlides = useMemo(() => {
    if (activeBanners.length === 0) return [];
    if (activeBanners.length > 1 && activeBanners.length < 4) {
      let list = [...activeBanners];
      while (list.length < 4) {
        list = [
          ...list,
          ...activeBanners.map((b, idx) => ({
            ...b,
            id: b.id ? `${b.id}-dup-${list.length}-${idx}` : `dup-${list.length}-${idx}`
          }))
        ];
      }
      return list;
    }
    return activeBanners;
  }, [activeBanners]);

  const handleBannerClick = (banner) => {
    if (banner.id === "default-1" || String(banner.id).includes("default-1")) {
      navigate("/shop");
      return;
    }
    
    // 1. Custom URL
    if (banner.link_url) {
      if (banner.link_url.startsWith("http://") || banner.link_url.startsWith("https://")) {
        window.open(banner.link_url, "_blank", "noopener,noreferrer");
      } else {
        navigate(banner.link_url);
      }
      return;
    }
    
    // 2. Linked Category + Featured Products
    if (banner.linked_category) {
      const slug = banner.linked_category.slug;
      navigate(`/shop?category=${slug}&banner=${banner.id}`);
      return;
    }
    
    // 3. Linked Product
    const activeProduct = banner.linked_product || banner.product;
    if (activeProduct) {
      navigate(`/product/${activeProduct.id}`);
      return;
    }
    
    // 4. Shop Page
    navigate("/shop");
  };

  return (
    <StoreShell>
      <div className="sz-home">
        {loading ? (
          <BannerSkeleton />
        ) : (
          <div className="sz-hero-carousel-container">
            <div className="sz-home-slider-wrap">
              <div className="sz-slider">
                <Swiper
                  modules={[Autoplay, Navigation, Pagination]}
                  spaceBetween={12}
                  slidesPerView={1.15}
                  loop={activeBanners.length > 1}
                  autoplay={
                    activeBanners.length > 1
                      ? {
                          delay: 5000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }
                      : false
                  }
                  navigation={{
                    nextEl: ".swiper-button-next-custom",
                    prevEl: ".swiper-button-prev-custom",
                  }}
                  onSwiper={setSwiperInstance}
                  onSlideChange={(swiper) => setRealActiveIndex(swiper.realIndex)}
                  breakpoints={{
                    768: {
                      slidesPerView: 1.2,
                      spaceBetween: 16,
                    },
                    1024: {
                      slidesPerView: 1.25,
                      spaceBetween: 20,
                    },
                  }}
                  className="sz-swiper-container"
                >
                  {sliderSlides.map((banner) => (
                    <SwiperSlide key={banner.id || banner.sort_order}>
                      <BannerRenderer
                        banner={banner}
                        mediaUrl={mediaUrl}
                        handleBannerClick={handleBannerClick}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {activeBanners.length > 1 && (
                  <>
                    {/* Custom navigation arrows */}
                    <button className="swiper-button-prev-custom" aria-label="Previous slide">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button className="swiper-button-next-custom" aria-label="Next slide">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {activeBanners.length > 1 && (
                <div className="swiper-pagination-custom">
                  {activeBanners.map((_, idx) => (
                    <span
                      key={idx}
                      className={`swiper-pagination-bullet ${
                        idx === (realActiveIndex % activeBanners.length)
                          ? "swiper-pagination-bullet-active"
                          : ""
                      }`}
                      onClick={() => {
                        if (swiperInstance) {
                          swiperInstance.slideToLoop(idx);
                        }
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔥 NEW ARRIVALS SECTION */}
        <NewArrivalsSection />

        {/* 🔥 IN DEMAND SECTION */}
        <DemandSection />

        {/* 🔥 PREMIUM BEST SELLERS SECTION */}
        <BestSellersSection />

        {/* 🔥 PREMIUM PRODUCTS SECTION */}
        <PremiumProductsSection />
      </div>
    </StoreShell>
  );
}