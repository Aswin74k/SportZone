import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import { mediaUrl } from "../utils/mediaUrl";
import useResponsiveDisplayCount from "../hooks/useResponsiveDisplayCount";
import { PRODUCT_FILTERS } from "../constants/productFilters";
import getSkeletonItems from "../utils/getSkeletonItems";
import "./TrendingUnderSection.css";

export default function TrendingUnderSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const displayCount = useResponsiveDisplayCount(5, 6);

  useEffect(() => {
    let isMounted = true;
    const fetchBudgetProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get("products/", {
          params: PRODUCT_FILTERS.UNDER_999
        });
        if (!isMounted) return;
        const list = unwrapList(res.data);
        setProducts(list);
      } catch (err) {
        console.error("Error loading budget selections:", err);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBudgetProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  const handleClickSection = () => {
    navigate("/shop?max_price=999");
  };

  if (!loading && visibleProducts.length === 0) return null;

  return (
    <div className="sz-trending-under py-4">
      <div className="container-fluid container-xl">
        <div 
          className="sz-trending-under__wrapper"
          onClick={handleClickSection}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleClickSection()}
        >
          {/* Header Row */}
          <div className="sz-trending-under__header-row">
            <div className="sz-trending-under__title-group">
              <h2 className="sz-trending-under__title">Trending Under ₹999</h2>
              <p className="sz-trending-under__subtitle">High quality sports gear at athlete-friendly prices</p>
            </div>
            <button 
              className="sz-trending-under__arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClickSection();
              }}
              aria-label="View products under 999"
            >
              ➔
            </button>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="sz-trending-under__grid">
              {getSkeletonItems(displayCount).map((idx) => (
                <div className="sz-trending-under__card" key={idx}>
                  <div className="sz-trending-under__img-container sz-skeleton" />
                  <div className="sz-trending-under__meta">
                    <div className="sz-skeleton mb-2" style={{ height: "14px", width: "80%" }} />
                    <div className="sz-skeleton" style={{ height: "14px", width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sz-trending-under__grid">
              {visibleProducts.map((p) => (
                <div 
                  className="sz-trending-under__card" 
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${p.id}`);
                  }}
                >
                  <div className="sz-trending-under__img-container">
                    <img 
                      src={mediaUrl(p.image)} 
                      alt={p.name} 
                      className="sz-trending-under__img"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>
                  <div className="sz-trending-under__meta">
                    <h4 className="sz-trending-under__product-name">{p.name}</h4>
                    <div className="sz-trending-under__label-row">
                      <span className="sz-trending-under__price">₹{Math.round(p.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
