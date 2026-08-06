import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import { mediaUrl } from "../utils/mediaUrl";
import useResponsiveDisplayCount from "../hooks/useResponsiveDisplayCount";
import { PRODUCT_FILTERS } from "../constants/productFilters";
import getSkeletonItems from "../utils/getSkeletonItems";
import "./DemandSection.css";

export default function DemandSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const displayCount = useResponsiveDisplayCount(5, 6);

  useEffect(() => {
    let isMounted = true;

    const fetchDemandProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get("products/", {
          params: PRODUCT_FILTERS.IN_DEMAND
        });
        if (!isMounted) return;

        const list = unwrapList(res.data);
        setProducts(list);
      } catch (err) {
        console.error("Error fetching in-demand products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDemandProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  if (!loading && visibleProducts.length === 0) {
    return null; // Don't render if no items could be fetched
  }

  return (
    <section className="sz-demand-section py-4">
      <div className="container-fluid container-xl">
        <div className="sz-demand-banner shadow-sm">
          {/* Section Title Row */}
          <div className="sz-demand-banner__title-row d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <h2 className="sz-demand-banner__title">In demand</h2>
              <span className="sz-demand-banner__badge">⚡ TRENDING</span>
            </div>
            <Link to="/shop?is_in_demand=true" className="btn btn-outline-primary btn-sm rounded-pill px-3 sz-demand-banner__view-all fw-semibold">
              View All ➔
            </Link>
          </div>

          {/* Cards Glassmorphic Grid */}
          <div className="sz-demand-banner__card-grid">
            {loading ? (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                {getSkeletonItems(displayCount).map((idx) => (
                  <div className="col" key={idx}>
                    <div className="sz-demand-card-skeleton">
                      <div className="sz-skeleton sz-demand-card-skeleton__img" />
                      <div className="sz-skeleton sz-demand-card-skeleton__line1 mt-3" />
                      <div className="sz-skeleton sz-demand-card-skeleton__line2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3 justify-content-center">
                {visibleProducts.map((product) => {
                  const imageSrc = mediaUrl(product.image) || "/no-image.png";
                  const brandName = product.brand?.name || (typeof product.category === 'object' ? product.category?.name : product.category) || "Popular";
                  const priceDisplay = product.price ? `₹${product.price}` : "";
                  return (
                    <div className="col" key={product.id}>
                      <div
                        className="sz-demand-card h-100"
                        onClick={() => navigate(`/product/${product.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.id}`)}
                      >
                        {/* Dark Image Box */}
                        <div className="sz-demand-card__image-box">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="sz-demand-card__img img-fluid"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.src = "/no-image.png";
                            }}
                          />
                        </div>
                        {/* Labels and Offer texts */}
                        <div className="sz-demand-card__content text-start">
                          <div className="sz-demand-card__label">{brandName}</div>
                          <div className="sz-demand-card__offer">{priceDisplay}</div>
                          <div className="sz-demand-card__name" title={product.name}>
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
