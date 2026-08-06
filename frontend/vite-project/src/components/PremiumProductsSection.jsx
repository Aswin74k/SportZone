import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import useResponsiveDisplayCount from "../hooks/useResponsiveDisplayCount";
import { PRODUCT_FILTERS } from "../constants/productFilters";
import getSkeletonItems from "../utils/getSkeletonItems";
import "./PremiumProductsSection.css";

export default function PremiumProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayCount = useResponsiveDisplayCount(5, 6);

  useEffect(() => {
    let isMounted = true;

    const fetchPremiumProducts = async () => {
      try {
        setLoading(true);
        // Query products with is_premium=true
        const res = await API.get("products/", {
          params: PRODUCT_FILTERS.PREMIUM
        });
        if (!isMounted) return;

        const allProducts = unwrapList(res.data);
        setProducts(allProducts);
      } catch (err) {
        console.error("Error fetching premium products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPremiumProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  if (!loading && visibleProducts.length === 0) {
    return null; // Don't show the section if no products are available
  }

  return (
    <section className="sz-premium-products">
      <div className="container-fluid container-xl">
        <div className="sz-premium-products__header d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <span className="sz-premium-products__badge">
              PREMIUM GEAR
            </span>
            <h2 className="sz-premium-products__title mb-0">
              The Premium Edit
            </h2>
          </div>
          <Link to="/shop?is_premium=true" className="btn btn-outline-primary btn-sm rounded-pill px-4 mt-3 mt-sm-0 sz-premium-products__link fw-semibold">
            View All
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
                <div className="sz-premium-products__card-wrapper w-100">
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
