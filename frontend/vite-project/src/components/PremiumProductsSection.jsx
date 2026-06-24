import React, { useEffect, useState } from "react";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import "./PremiumProductsSection.css";

export default function PremiumProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPremiumProducts = async () => {
      try {
        setLoading(true);
        // Query products sorted by price descending for premium tier
        const res = await API.get("products/", {
          params: { ordering: "-price" }
        });
        if (!isMounted) return;

        const allProducts = unwrapList(res.data);
        // Take top 4 premium items
        setProducts(allProducts.slice(0, 4));
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

  if (!loading && products.length === 0) {
    return null; // Don't show the section if no products are available
  }

  return (
    <section className="sz-premium-products">
      <div className="container-fluid container-xl">
        {/* PREMIUM SECTION HEADER */}
        <div className="sz-premium-products__header text-center mb-5">
          <span className="sz-premium-products__badge">
            PREMIUM GEAR
          </span>
          <h2 className="sz-premium-products__title">
            The Premium Edit
          </h2>
          <p className="sz-premium-products__subtitle text-muted mx-auto">
            Engineered for elite athletes. Discover state-of-the-art craftsmanship, professional grade materials, and peak sports engineering.
          </p>
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
