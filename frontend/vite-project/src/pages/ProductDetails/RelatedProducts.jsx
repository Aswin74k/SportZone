import React from "react";
import ProductCard from "../../components/ProductCard";

export default function RelatedProducts({ relatedProducts }) {
  if (relatedProducts.length === 0) return null;

  return (
    <div className="row mt-5 pt-4 border-top">
      <div className="col-12">
        <h3 className="h5 fw-bold mb-3">Related Gear Collections</h3>
        <div className="sz-pd-carousel-wrapper">
          <div className="sz-pd-scrolling-cards-row">
            {relatedProducts.map((p, idx) => (
              <div className="sz-pd-card-item-wrap" key={p.id}>
                <ProductCard product={p} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
