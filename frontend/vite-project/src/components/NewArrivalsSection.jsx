import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import "./NewArrivalsSection.css";

export default function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        // Fetch products ordered by id descending (latest added products first)
        const res = await API.get("products/", {
          params: { ordering: "-id" }
        });
        
        if (!isMounted) return;
        const latestProducts = unwrapList(res.data);
        setProducts(latestProducts.slice(0, 4));
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

  if (!loading && products.length === 0) {
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
          <Link to="/shop" className="btn btn-outline-primary btn-sm rounded-pill px-4 mt-3 mt-sm-0 sz-new-arrivals__link">
            View All Gear
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((idx) => (
              <div className="col-6 col-lg-3 d-flex" key={idx}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {products.map((product, index) => (
              <div className="col-6 col-lg-3 d-flex" key={product.id}>
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
