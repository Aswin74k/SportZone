import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import useResponsiveDisplayCount from "../hooks/useResponsiveDisplayCount";
import { PRODUCT_FILTERS } from "../constants/productFilters";
import getSkeletonItems from "../utils/getSkeletonItems";
import "./NewArrivalsSection.css";

export default function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayCount = useResponsiveDisplayCount(5, 6);

  useEffect(() => {
    let isMounted = true;

    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        // Fetch products ordered by id descending (latest added products first)
        const res = await API.get("products/", {
          params: PRODUCT_FILTERS.NEWEST
        });
        
        if (!isMounted) return;
        const latestProducts = unwrapList(res.data);
        setProducts(latestProducts);
      } catch (err) {
        console.error("Error fetching new arrival products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNewArrivals();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  if (!loading && visibleProducts.length === 0) {
    return null; // Hide section if no products are available
  }

  return (
    <section className="sz-new-arrivals">
      <div className="container-fluid container-xl">
        {/* NEW ARRIVAL HEADER */}
        <div className="sz-new-arrivals__header d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <span className="sz-new-arrivals__badge mb-2 d-inline-block">
              FRESH DROP ⚡
            </span>
            <h2 className="sz-new-arrivals__title">
              New Arrivals
            </h2>
            <p className="sz-new-arrivals__subtitle text-muted mb-0">
              The latest additions to the SportZone catalogue. Upgrade your athletic gear today.
            </p>
          </div>
          <Link to="/shop?sort=newest" className="btn btn-outline-primary btn-sm rounded-pill px-4 mt-3 mt-sm-0 sz-new-arrivals__link">
            View All Gear
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4">
            {getSkeletonItems(displayCount).map((idx) => (
              <div className="col d-flex" key={idx}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4 justify-content-center">
            {visibleProducts.map((product, index) => (
              <div className="col d-flex" key={product.id}>
                <div className="sz-new-arrivals__card-wrapper w-100">
                  <ProductCard product={product} index={index} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
