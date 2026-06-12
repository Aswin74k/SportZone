export default function ProductCardSkeleton() {
  return (
    <div className="sz-product-card h-100 d-flex flex-column">
      <div className="sz-skeleton w-100" style={{ height: 220 }} />
      <div className="p-3 flex-grow-1 d-flex flex-column gap-2">
        <div className="sz-skeleton" style={{ height: 12, width: "40%" }} />
        <div className="sz-skeleton" style={{ height: 16, width: "90%" }} />
        <div className="sz-skeleton" style={{ height: 14, width: "50%" }} />
        <div className="sz-skeleton mt-auto" style={{ height: 28, width: "70%" }} />
        <div className="sz-skeleton rounded-pill" style={{ height: 40 }} />
      </div>
    </div>
  );
}
