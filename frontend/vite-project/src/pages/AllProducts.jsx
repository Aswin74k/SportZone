import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import StoreShell from "../components/StoreShell";

const normalizeCategory = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const v = raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (v === "sports shoes") return "sports shoe";
  if (v === "sports cycles") return "sports cycle";
  return v;
};

function AllProducts() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const search = params.get("search");
  const brand = params.get("brand");
  const isTrending = params.get("is_trending");
  const isNewArrival = params.get("is_new_arrival");
  const isDeal = params.get("is_deal_of_the_week");
  const normalizedCategory = normalizeCategory(category);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const apiParams = {};
    if (normalizedCategory) apiParams.category = normalizedCategory;
    if (search) apiParams.search = search;
    if (brand) apiParams.brand = brand;
    if (isTrending) apiParams.is_trending = isTrending;
    if (isNewArrival) apiParams.is_new_arrival = isNewArrival;
    if (isDeal) apiParams.is_deal_of_the_week = isDeal;

    API.get("products/", { params: apiParams })
      .then((res) => setProducts(unwrapList(res.data)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [normalizedCategory, search, brand, isTrending, isNewArrival, isDeal]);

  const title = normalizedCategory
    ? normalizedCategory.replace(/\b\w/g, (c) => c.toUpperCase())
    : search
      ? `Results for “${search}”`
      : isTrending
        ? "Trending Gear"
        : isNewArrival
          ? "New Arrivals"
          : isDeal
            ? "Deals of the Week"
            : brand
              ? (products.length > 0 && products[0].brand?.name ? `${products[0].brand.name} Collection` : "Brand Products")
              : "All products";

  return (
    <StoreShell>
      <div className="container-fluid container-xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="sz-kicker mb-1">Shop</p>
          <h1 className="h3 fw-bold">{title}</h1>
          {!loading && <p className="text-muted small mb-0">{products.length} products</p>}
        </motion.div>

        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="sz-section text-center py-5">
            <h3 className="fw-bold">No products found</h3>
            <p className="text-muted mb-0">Try another category or search term.</p>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product, index) => (
              <div className="col-lg-3 col-md-6 d-flex" key={product.id}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}

export default AllProducts;
