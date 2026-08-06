import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import { mediaUrl } from "../utils/mediaUrl";
import useResponsiveDisplayCount from "../hooks/useResponsiveDisplayCount";
import { PRODUCT_FILTERS } from "../constants/productFilters";
import getSkeletonItems from "../utils/getSkeletonItems";
import "./BestSellersSection.css";

export default function BestSellersSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const displayCount = useResponsiveDisplayCount(5, 6);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch only best sellers
        const bestSellerRes = await API.get("products/", {
          params: PRODUCT_FILTERS.BEST_SELLER
        });
        
        if (!isMounted) return;
        
        const bestSellers = unwrapList(bestSellerRes.data);
        setProducts(bestSellers);
      } catch (err) {
        console.error("Error fetching best sellers:", err);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  if (!loading && visibleProducts.length === 0) {
    return null; // Hide the section completely if there are no best seller products
  }

  return (
    <section className="sz-best-sellers">
      <div className="sz-best-sellers__container">
        
        {/* HEADER ROW */}
        <div className="sz-best-sellers__header-row">
          <h2 className="sz-best-sellers__title">
            Best Sellers <span className="sz-best-sellers__subtitle">| Most Loved By Athletes</span>
          </h2>
          <Link to="/shop?is_best_seller=true" className="sz-best-sellers__view-all">
            See more
          </Link>
        </div>

        {/* CAROUSEL SLIDER CONTAINER */}
        {loading ? (
          <div className="sz-best-sellers__grid">
            {getSkeletonItems(displayCount).map((idx) => (
              <div className="sz-best-sellers__item" key={idx}>
                <div className="sz-skeleton" style={{ width: "100%", aspectRatio: "1/1" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="sz-best-sellers__grid">
            {visibleProducts.map((product) => {
              const imageSrc = mediaUrl(product.image) || "/no-image.png";
              const price = Number(product.price || 0);
              const mrp = product.original_price ? Number(product.original_price) : Math.round(price * 1.2);
              const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <div 
                  className="sz-best-sellers__item" 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.id}`)}
                >
                  <div className="sz-flat-card">
                    {discount > 0 && (
                      <div className="sz-flat-card__discount-badge">
                        {discount}% OFF
                      </div>
                    )}
                    <img 
                      src={imageSrc} 
                      alt={product.name || "Product"} 
                      className="sz-flat-card__img"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
