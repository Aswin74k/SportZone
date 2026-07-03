export default function ProductCardSkeleton() {
  return (
    <div className="sz-product-card h-100 d-flex flex-column">
      {/* CARD IMAGE WRAPPER SKELETON */}
      <div className="sz-product-card__img-wrap position-relative overflow-hidden">
        {/* Wishlist Button Skeleton */}
        <div 
          className="position-absolute top-0 end-0 m-3 z-3 sz-skeleton" 
          style={{ width: "36px", height: "36px", borderRadius: "50%" }} 
        />
        {/* Image Shimmer Placeholder */}
        <div className="sz-skeleton w-100 h-100" style={{ minHeight: "100%" }} />
      </div>

      {/* CARD BODY SKELETON */}
      <div className="sz-product-card__body d-flex flex-column flex-grow-1 p-3 text-start gap-2">
        {/* Brand Row */}
        <div className="sz-skeleton" style={{ height: "12px", width: "35%" }} />

        {/* Product Name (two lines to match clamped title) */}
        <div className="d-flex flex-column gap-1.5 mb-1">
          <div className="sz-skeleton" style={{ height: "14px", width: "90%" }} />
          <div className="sz-skeleton" style={{ height: "14px", width: "60%" }} />
        </div>

        {/* Rating Row (aligning with rating layout) */}
        <div className="sz-skeleton mb-1" style={{ height: "12px", width: "45%" }} />

        {/* Price Row */}
        <div className="d-flex align-items-baseline gap-2 mt-auto">
          <div className="sz-skeleton" style={{ height: "20px", width: "50%" }} />
        </div>
      </div>
    </div>
  );
}

