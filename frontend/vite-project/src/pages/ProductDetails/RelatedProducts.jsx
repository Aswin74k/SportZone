import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import ProductCard from "../../components/ProductCard";

export default function RelatedProducts({ relatedProducts, category }) {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  const shopCategoryUrl = category
    ? `/shop?category=${encodeURIComponent(String(category).toLowerCase())}`
    : "/shop";

  return (
    <div className="row mt-5 pt-4 border-top">
      <div className="col-12">
        <div className="sz-pd-related-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h3 className="h5 fw-bold mb-0 sz-pd-related-title">Related Gear Collections</h3>
          <Link to={shopCategoryUrl} className="sz-pd-related-view-all">
            <span>View All</span>
            <FaChevronRight className="sz-view-all-chevron" size={11} />
          </Link>
        </div>
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4 sz-pd-related-grid">
          {relatedProducts.map((p, idx) => (
            <div className="col sz-pd-related-card-col" key={p.id}>
              <ProductCard product={p} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
