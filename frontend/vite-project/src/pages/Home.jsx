import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import API from "../api";
import StoreShell from "../components/StoreShell";
import BannerRenderer from "../components/banners/BannerRenderer";
import { mediaUrl } from "../utils/mediaUrl";
import { unwrapList } from "../utils/unwrapList";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Home.css";

// Skeleton Loader component for loading state
function BannerSkeleton() {
  return (
    <div className="sz-banner-skeleton-wrap mb-4">
      <div className="sz-banner-skeleton"></div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleBannerClick = (banner) => {
    if (banner.id === "default-1") {
      navigate("/shop");
      return;
    }
    const activeProduct = banner.linked_product || banner.product;
    if (activeProduct) {
      navigate(`/product/${activeProduct.id}`);
    } else {
      navigate("/shop");
    }
  };

  return (
    <StoreShell>
      <div className="sz-home">
        {loading ? (
          <BannerSkeleton />
        ) : (
          <div className="sz-home-slider-wrap mb-4">
            <div className="sz-slider">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
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
                pagination={{
                  el: ".swiper-pagination-custom",
                  clickable: true,
                }}
                className="sz-swiper-container"
              >
                {activeBanners.map((banner) => (
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

                  {/* Custom pagination dots */}
                  <div className="swiper-pagination-custom"></div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}