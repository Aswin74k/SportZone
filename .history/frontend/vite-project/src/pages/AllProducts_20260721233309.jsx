import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTimes, FaSlidersH } from "react-icons/fa";
import { mediaUrl } from "../utils/mediaUrl";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import StoreShell from "../components/StoreShell";
import "./AllProducts.css";

const PAGE_SIZE = 12;
const SKELETON_COUNT = 6;
const PAGINATION_WINDOW = 1; // pages shown on either side of the current page
const SPRING_TRANSITION = { type: "spring", stiffness: 380, damping: 30 };

const normalizeCategory = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const v = raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (v === "sports shoes") return "sports shoe";
  if (v === "sports cycles") return "sports cycle";
  return v;
};


const buildPageWindow = (current, total, spread = PAGINATION_WINDOW) => {
  if (total <= 1) return [];
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= spread; i += 1) {
    if (current - i >= 1) pages.add(current - i);
    if (current + i <= total) pages.add(current + i);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) withGaps.push(`gap-${page}`);
    withGaps.push(page);
  });
  return withGaps;
};

/* Static icons used by the empty/error states (module scope: no props/state needed) */
const ErrorIcon = () => (
  <svg className="sz-empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
  </svg>
);

const SearchIcon = () => (
  <svg className="sz-empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/** Shared empty/error state card (used for both the fetch-error and no-results screens). */
function EmptyState({ icon, title, desc, btnLabel, onBtnClick, role }) {
  return (
    <motion.div
      className="sz-empty-state"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      role={role}
    >
      <div className="sz-empty-icon-wrap">{icon}</div>
      <h3 className="sz-empty-state-title">{title}</h3>
      <p className="sz-empty-state-desc">{desc}</p>
      <button type="button" onClick={onBtnClick} className="sz-empty-state-btn">
        {btnLabel}
      </button>
    </motion.div>
  );
}

function FilterSidebar({
  variant,
  categories,
  brands,
  category,
  brandId,
  priceMinInput,
  priceMaxInput,
  priceError,
  onSelectCategory,
  onSelectBrand,
  onPriceMinChange,
  onPriceMaxChange,
  onApplyPrice,
  onClearAll,
  hasActiveFilters,
}) {
  const categoryLayoutId = `activeCategoryIndicator-${variant}`;
  const brandLayoutId = `activeBrandIndicator-${variant}`;

  const renderOption = (key, label, isActive, onClick, layoutId) => (
    <li key={key}>
      <button
        type="button"
        onClick={onClick}
        className={`sz-filter-item-btn ${isActive ? "active" : ""}`}
        aria-pressed={isActive}
      >
        <span className="sz-filter-item-name">{label}</span>
        {isActive && <motion.span layoutId={layoutId} className="sz-active-indicator" transition={SPRING_TRANSITION} />}
      </button>
    </li>
  );

  return (
    <>
      <div className="sz-filter-section">
        <h4 className="sz-filter-title">Categories</h4>
        <ul className="sz-filter-list">
          {renderOption("all-cat", "All Categories", !category, () => onSelectCategory(""), categoryLayoutId)}
          {categories.map((cat) =>
            renderOption(cat.id, cat.name, category === cat.slug, () => onSelectCategory(cat.slug), categoryLayoutId)
          )}
        </ul>
      </div>

      <div className="sz-filter-section">
        <h4 className="sz-filter-title">Brands</h4>
        <ul className="sz-filter-list">
          {renderOption("all-brand", "All Brands", !brandId, () => onSelectBrand(""), brandLayoutId)}
          {brands.map((b) =>
            renderOption(b.id, b.name, brandId === String(b.id), () => onSelectBrand(b.id), brandLayoutId)
          )}
        </ul>
      </div>

      <div className="sz-filter-section">
        <h4 className="sz-filter-title">Price Range</h4>
        <form onSubmit={onApplyPrice} noValidate>
          <div className="sz-price-inputs mb-2">
            <div className="sz-price-input-wrapper">
              <span className="sz-price-currency">₹</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className="form-control sz-price-field"
                placeholder="Min"
                aria-label="Minimum price"
                value={priceMinInput}
                onChange={onPriceMinChange}
              />
            </div>
            <span className="text-muted small px-1">to</span>
            <div className="sz-price-input-wrapper">
              <span className="sz-price-currency">₹</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className="form-control sz-price-field"
                placeholder="Max"
                aria-label="Maximum price"
                value={priceMaxInput}
                onChange={onPriceMaxChange}
              />
            </div>
          </div>
          {priceError && (
            <p className="sz-price-error" role="alert">
              {priceError}
            </p>
          )}
          <button type="submit" className="w-100 sz-btn-apply-price">
            Apply Price
          </button>
        </form>
      </div>

      {hasActiveFilters && (
        <div className="text-center mt-3">
          <button type="button" onClick={onClearAll} className="sz-btn-clear-all">
            Clear All Filters
          </button>
        </div>
      )}
    </>
  );
}

function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL search params (single source of truth for filters)
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const brandId = searchParams.get("brand") || "";
  const minPriceQuery = searchParams.get("min_price") || "";
  const maxPriceQuery = searchParams.get("max_price") || "";
  const sortOption = searchParams.get("ordering") || "";
  const pageQuery = searchParams.get("page") || "1";
  const bannerId = searchParams.get("banner") || "";

  const currentPage = Math.max(1, Number(pageQuery) || 1);
  const normalizedCategory = normalizeCategory(category);

  // 2. Component state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const [activeBanner, setActiveBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(Boolean(bannerId));

  // Price inputs mirror the URL but are editable before "Apply" is pressed.
  const [priceMinInput, setPriceMinInput] = useState(minPriceQuery);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPriceQuery);
  const [priceError, setPriceError] = useState("");

  // Mobile drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const filterTriggerRef = useRef(null);

  useEffect(() => {
    setPriceMinInput(minPriceQuery);
    setPriceMaxInput(maxPriceQuery);
    setPriceError("");
  }, [minPriceQuery, maxPriceQuery]);

  // 3. Fetch banner details when bannerId changes
  useEffect(() => {
    if (!bannerId) {
      setActiveBanner(null);
      setBannerLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setBannerLoading(true);

    API.get(`banners/${bannerId}/`, { signal: controller.signal })
      .then((res) => setActiveBanner(res.data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching banner details:", err);
        setActiveBanner(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBannerLoading(false);
      });

    return () => controller.abort();
  }, [bannerId]);

  // 4. Initial loaders for the categories and brands sidebar lists
  useEffect(() => {
    const controller = new AbortController();

    API.get("categories/", { signal: controller.signal })
      .then((res) => setCategories(unwrapList(res.data)))
      .catch((err) => {
        if (!controller.signal.aborted) console.error("Error fetching categories:", err);
      });

    API.get("brands/", { signal: controller.signal })
      .then((res) => setBrands(unwrapList(res.data)))
      .catch((err) => {
        if (!controller.signal.aborted) console.error("Error fetching brands:", err);
      });

    return () => controller.abort();
  }, []);

  // 5. Product list fetch, re-run whenever any filter/sort/page changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setProductsError(null);

    const apiParams = { page: currentPage, page_size: PAGE_SIZE };
    if (normalizedCategory) apiParams.category = normalizedCategory;
    if (search) apiParams.search = search;
    if (brandId) apiParams.brand = brandId;
    if (minPriceQuery) apiParams.min_price = minPriceQuery;
    if (maxPriceQuery) apiParams.max_price = maxPriceQuery;
    if (sortOption) apiParams.ordering = sortOption;
    if (bannerId) apiParams.exclude_banner_featured = bannerId;

    API.get("products/", { params: apiParams, signal: controller.signal })
      .then((res) => {
        if (res.data && res.data.results !== undefined) {
          setProducts(res.data.results);
          setTotalCount(res.data.count);
        } else {
          const list = unwrapList(res.data);
          setProducts(list);
          setTotalCount(list.length);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching products:", err);
        setProducts([]);
        setTotalCount(0);
        setProductsError("We couldn't load products right now. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [normalizedCategory, search, brandId, minPriceQuery, maxPriceQuery, sortOption, currentPage, bannerId]);

  // 6. Lock body scroll + support Escape-to-close while the mobile drawer is open
  useEffect(() => {
    if (!mobileFiltersOpen) return undefined;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      filterTriggerRef.current?.focus();
    };
  }, [mobileFiltersOpen]);

  // 7. URL update helpers
  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, val]) => {
          if (val === null || val === undefined || val === "") {
            newParams.delete(key);
          } else {
            newParams.set(key, val);
          }
        });
        // Clear banner selection if the category filter changes
        if (updates.category !== undefined) newParams.delete("banner");
        newParams.set("page", "1");
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (page) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", String(page));
        return newParams;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(search ? { search } : {});
    setPriceError("");
  }, [search, setSearchParams]);

  const handlePriceApply = useCallback(
    (e) => {
      e.preventDefault();
      const min = priceMinInput === "" ? null : Number(priceMinInput);
      const max = priceMaxInput === "" ? null : Number(priceMaxInput);

      if (min !== null && max !== null && min > max) {
        setPriceError("Minimum price can't be higher than maximum price.");
        return;
      }
      setPriceError("");
      updateParams({ min_price: priceMinInput, max_price: priceMaxInput });
      setMobileFiltersOpen(false);
    },
    [priceMinInput, priceMaxInput, updateParams]
  );

  const handlePriceMinChange = useCallback((e) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) setPriceMinInput(val);
  }, []);

  const handlePriceMaxChange = useCallback((e) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) setPriceMaxInput(val);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageWindow = useMemo(() => buildPageWindow(currentPage, totalPages), [currentPage, totalPages]);

  const activeCategoryName = useMemo(
    () => categories.find((c) => c.slug === category)?.name || category,
    [categories, category]
  );
  const activeBrandName = useMemo(
    () => brands.find((b) => String(b.id) === String(brandId))?.name || "",
    [brands, brandId]
  );

  const hasActiveFilters = Boolean(category || brandId || minPriceQuery || maxPriceQuery);

  const title = search
    ? `Results for “${search}”`
    : activeCategoryName || (activeBrandName ? `${activeBrandName} Collection` : "All products");

  const showFeaturedRail =
    Boolean(activeBanner) && Array.isArray(activeBanner?.featured_products) && activeBanner.featured_products.length > 0;

  const sidebarProps = {
    categories,
    brands,
    category,
    brandId,
    priceMinInput,
    priceMaxInput,
    priceError,
    onSelectCategory: (slug) => updateParams({ category: slug }),
    onSelectBrand: (id) => updateParams({ brand: id }),
    onPriceMinChange: handlePriceMinChange,
    onPriceMaxChange: handlePriceMaxChange,
    onApplyPrice: handlePriceApply,
    onClearAll: clearAllFilters,
    hasActiveFilters,
  };

  // Active filter "chips" bar: build a small data list instead of repeating the same JSX 4x.
  const filterTags = [
    search && {
      key: "search",
      label: `Search: “${search}”`,
      onRemove: () => updateParams({ search: "" }),
      aria: "Remove search filter",
    },
    category && {
      key: "category",
      label: `Category: ${activeCategoryName}`,
      onRemove: () => updateParams({ category: "" }),
      aria: "Remove category filter",
    },
    brandId && {
      key: "brand",
      label: `Brand: ${activeBrandName}`,
      onRemove: () => updateParams({ brand: "" }),
      aria: "Remove brand filter",
    },
    (minPriceQuery || maxPriceQuery) && {
      key: "price",
      label: `Price: ₹${minPriceQuery || 0} - ₹${maxPriceQuery || "Any"}`,
      onRemove: () => updateParams({ min_price: "", max_price: "" }),
      aria: "Remove price filter",
    },
  ].filter(Boolean);

  // Product grid cell renderer, shared by the featured rail and the main grid.
  const renderProductCells = (list, keyPrefix = "") =>
    list.map((product, index) => (
      <div className="col-6 col-md-4 d-flex" key={`${keyPrefix}${product.id}`}>
        <ProductCard product={product} index={index} />
      </div>
    ));

  return (
    <StoreShell>
      <div className="container-fluid container-xl px-3 px-md-4 py-4">
        {/* COLLECTION HEADER / TOP TITLE HEADER */}
        {bannerId && bannerLoading ? (
          <div className="sz-collection-banner sz-collection-banner-loading mb-5" aria-hidden="true" />
        ) : activeBanner ? (
          <div
            className="sz-collection-banner mb-5 p-4 p-md-5 text-white position-relative overflow-hidden"
            style={{
              background: activeBanner.background_color || "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            }}
          >
            <div className="sz-banner-glow" />

            <div className="row align-items-center g-4 w-100 position-relative z-2 m-0">
              <div className="col-md-7 p-0 text-center text-md-start">
                <span className="sz-banner-badge mb-3">🏆 Special Collection</span>
                <h1 className="sz-banner-heading mb-3 text-white tracking-tight">{activeBanner.title}</h1>
                <p className="mb-0 text-white-50 lead fs-6 fw-normal max-w-xl">
                  {activeBanner.description || activeBanner.subtitle || "Official match gear and fan-favorite products."}
                </p>
              </div>
              {activeBanner.image && (
                <div className="col-md-5 p-0 d-flex justify-content-center justify-content-md-end">
                  <div className="sz-banner-img-container-wrapper">
                    <div className="sz-banner-img-container">
                      <img src={mediaUrl(activeBanner.image)} alt={activeBanner.title} className="img-fluid" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <header className="sz-listing-header mb-5">
            <p className="sz-kicker">Store</p>
            <div className="sz-listing-header-row">
              <h1 className="sz-listing-title">{title}</h1>
              {!loading && (
                <p className="sz-listing-count" aria-live="polite">
                  {totalCount} {totalCount === 1 ? "item" : "items"} found
                </p>
              )}
            </div>
          </header>
        )}

        {/* ACTIVE FILTER TAGS */}
        {(hasActiveFilters || search) && (
          <div className="sz-active-filters-bar mb-4">
            <span className="sz-active-filters-label">Active filters:</span>
            <div className="sz-active-filters-wrap">
              {filterTags.map((tag) => (
                <span key={tag.key} className="sz-filter-tag">
                  {tag.label}
                  <button type="button" onClick={tag.onRemove} className="sz-filter-tag-remove" aria-label={tag.aria}>
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              <button type="button" onClick={clearAllFilters} className="sz-btn-clear-all">
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* MAIN LISTING WORKSPACE */}
        <div className="sz-listing-layout">
          <aside className="sz-filter-sidebar d-none d-lg-block" aria-label="Product filters">
            <FilterSidebar {...sidebarProps} variant="desktop" />
          </aside>

          <main className="sz-products-content">
            {showFeaturedRail && (
              <div className="sz-featured-products-section mb-5">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span style={{ fontSize: "1.2rem" }} aria-hidden="true">
                    ⭐️
                  </span>
                  <h3 className="h5 fw-bold mb-0 text-dark">Featured Products</h3>
                </div>
                <div className="row g-4">{renderProductCells(activeBanner.featured_products, "featured-")}</div>
              </div>
            )}

            {showFeaturedRail && (
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-2">
                <span style={{ fontSize: "1.1rem" }} aria-hidden="true">
                  👟
                </span>
                <h4 className="h6 fw-bold mb-0 text-secondary text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Other {activeCategoryName || "Category"} Products
                </h4>
              </div>
            )}

            {/* GRID CONTROLS TOPBAR */}
            <div className="sz-listing-topbar d-flex justify-content-between align-items-center mb-4">
              <div className="d-lg-none">
                <button
                  type="button"
                  ref={filterTriggerRef}
                  onClick={() => setMobileFiltersOpen(true)}
                  className="sz-btn-mobile-filter"
                  aria-haspopup="dialog"
                >
                  <FaSlidersH size={14} />
                  Filters
                  {hasActiveFilters && <span className="sz-filter-dot" aria-hidden="true" />}
                </button>
              </div>

              <div className="d-none d-lg-block">
                <span className="sz-listing-stats text-secondary small fw-semibold" aria-live="polite">
                  {showFeaturedRail ? `Other products: ${totalCount} items` : `Showing ${products.length} of ${totalCount} items`}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-secondary fw-semibold d-none d-sm-block">Sort by:</span>
                <select
                  className="sz-sort-select"
                  value={sortOption}
                  onChange={(e) => updateParams({ ordering: e.target.value })}
                  aria-label="Sort products"
                >
                  <option value="">Featured</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* PRODUCTS DISPLAY GRID */}
            {loading ? (
              <motion.div className="row g-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <div className="col-6 col-md-4" key={`skeleton-${i}`}>
                    <ProductCardSkeleton />
                  </div>
                ))}
              </motion.div>
            ) : productsError ? (
              <EmptyState
                role="alert"
                icon={<ErrorIcon />}
                title="Something Went Wrong"
                desc={productsError}
                btnLabel="Try Again"
                onBtnClick={() => setSearchParams(new URLSearchParams(searchParams))}
              />
            ) : products.length === 0 ? (
              <EmptyState
                icon={<SearchIcon />}
                title="No Products Found"
                desc="We couldn't find any products matching your active filters. Try adjusting your selections or clear filters to start fresh."
                btnLabel="Clear All Filters"
                onBtnClick={clearAllFilters}
              />
            ) : (
              <>
                <motion.div
                  className="row g-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {renderProductCells(products)}
                </motion.div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <nav aria-label="Product pagination" className="d-flex justify-content-center mt-5">
                    <ul className="pagination sz-pagination">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          type="button"
                          className="page-link"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                          aria-label="Previous page"
                        >
                          &laquo; Prev
                        </button>
                      </li>
                      {pageWindow.map((entry) =>
                        typeof entry === "number" ? (
                          <li key={entry} className={`page-item ${entry === currentPage ? "active" : ""}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => handlePageChange(entry)}
                              aria-current={entry === currentPage ? "page" : undefined}
                              aria-label={`Page ${entry}`}
                            >
                              {entry}
                            </button>
                          </li>
                        ) : (
                          <li key={entry} className="page-item disabled sz-pagination-ellipsis" aria-hidden="true">
                            <span className="page-link">&hellip;</span>
                          </li>
                        )
                      )}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          type="button"
                          className="page-link"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                          aria-label="Next page"
                        >
                          Next &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>

        {/* MOBILE FILTER DRAWER */}
        <div
          className={`sz-mobile-filter-modal ${mobileFiltersOpen ? "is-open" : ""}`}
          onClick={() => setMobileFiltersOpen(false)}
          aria-hidden={!mobileFiltersOpen}
        >
          <div
            className="sz-mobile-filter-content"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
              <h3 className="h5 fw-bold mb-0">Filters</h3>
              <button
                type="button"
                ref={closeButtonRef}
                className="sz-close-btn"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="sz-mobile-filter-body">
              <FilterSidebar {...sidebarProps} variant="mobile" />
            </div>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default AllProducts;