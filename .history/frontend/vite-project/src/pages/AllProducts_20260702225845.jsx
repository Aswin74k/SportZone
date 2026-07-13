import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFilter, FaTimes, FaSlidersH, FaSyncAlt } from "react-icons/fa";
import { mediaUrl } from "../utils/mediaUrl";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import StoreShell from "../components/StoreShell";
import "./AllProducts.css";

const normalizeCategory = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const v = raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (v === "sports shoes") return "sports shoe";
  if (v === "sports cycles") return "sports cycle";
  return v;
};

function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL search params sync
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const brandId = searchParams.get("brand") || "";
  const minPriceQuery = searchParams.get("min_price") || "";
  const maxPriceQuery = searchParams.get("max_price") || "";
  const sortOption = searchParams.get("ordering") || "";
  const pageQuery = searchParams.get("page") || "1";
  
  const currentPage = Number(pageQuery);
  const normalizedCategory = normalizeCategory(category);

  // 2. Component State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Input states for price inputs in the UI
  const [priceMinInput, setPriceMinInput] = useState(minPriceQuery);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPriceQuery);

  const [lastMinPrice, setLastMinPrice] = useState(minPriceQuery);
  const [lastMaxPrice, setLastMaxPrice] = useState(maxPriceQuery);

  if (minPriceQuery !== lastMinPrice || maxPriceQuery !== lastMaxPrice) {
    setLastMinPrice(minPriceQuery);
    setLastMaxPrice(maxPriceQuery);
    setPriceMinInput(minPriceQuery);
    setPriceMaxInput(maxPriceQuery);
  }

  // Mobile drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const bannerId = searchParams.get("banner");
  const [activeBanner, setActiveBanner] = useState(null);

  // Fetch banner details when bannerId changes
  useEffect(() => {
    if (bannerId) {
      API.get(`banners/${bannerId}/`)
        .then((res) => {
          setActiveBanner(res.data);
        })
        .catch((err) => {
          console.error("Error fetching banner details:", err);
          setActiveBanner(null);
        });
    } else {
      Promise.resolve().then(() => setActiveBanner(null));
    }
  }, [bannerId]);

  // 3. Initial loaders for Categories and Brands lists in the sidebar
  useEffect(() => {
    API.get("categories/")
      .then((res) => setCategories(unwrapList(res.data)))
      .catch((err) => console.error("Error fetching categories:", err));

    API.get("brands/")
      .then((res) => setBrands(unwrapList(res.data)))
      .catch((err) => console.error("Error fetching brands:", err));
  }, []);



  // 4. Products fetching logic triggered whenever searchParams changes
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });
    const apiParams = { page: currentPage };
    if (normalizedCategory) apiParams.category = normalizedCategory;
    if (search) apiParams.search = search;
    if (brandId) apiParams.brand = brandId;
    if (minPriceQuery) apiParams.min_price = minPriceQuery;
    if (maxPriceQuery) apiParams.max_price = maxPriceQuery;
    if (sortOption) apiParams.ordering = sortOption;
    if (bannerId) apiParams.exclude_banner_featured = bannerId;

    API.get("products/", { params: apiParams })
      .then((res) => {
        if (!active) return;
        if (res.data && res.data.results !== undefined) {
          setProducts(res.data.results);
          setTotalCount(res.data.count);
        } else {
          setProducts(unwrapList(res.data));
          setTotalCount(res.data ? res.data.length : 0);
        }
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [normalizedCategory, search, brandId, minPriceQuery, maxPriceQuery, sortOption, currentPage, bannerId]);

  // 5. Update handler helper
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Clear banner selection if category filter changes or is cleared
    if (updates.category !== undefined) {
      newParams.delete("banner");
    }
    newParams.set("page", "1"); // Reset page on filter/sort changes
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(page));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSearchParams(search ? { search } : {}); // Keep search queries, clear filters
    setPriceMinInput("");
    setPriceMaxInput("");
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateParams({
      min_price: priceMinInput,
      max_price: priceMaxInput,
    });
    setMobileFiltersOpen(false);
  };

  const totalPages = Math.ceil(totalCount / 8);

  const activeCategoryName = categories.find((c) => c.slug === category)?.name || category;
  const activeBrandName = brands.find((b) => String(b.id) === String(brandId))?.name || "";

  // Title builder
  const title = search
    ? `Results for “${search}”`
    : activeCategoryName
      ? activeCategoryName
      : activeBrandName
        ? `${activeBrandName} Collection`
        : "All products";

  // Sidebar filter list template
  const renderSidebarContent = () => (
    <>
      {/* Category Section */}
      <div className="sz-filter-section">
        <h4 className="sz-filter-title">Categories</h4>
        <ul className="sz-filter-list">
          <li>
            <button
              onClick={() => updateParams({ category: "" })}
              className={`sz-filter-item-btn ${!category ? "active" : ""}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParams({ category: cat.slug })}
                className={`sz-filter-item-btn ${category === cat.slug ? "active" : ""}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand Section */}
      <div className="sz-filter-section">
        <h4 className="sz-filter-title">Brands</h4>
        <ul className="sz-filter-list">
          <li>
            <button
              onClick={() => updateParams({ brand: "" })}
              className={`sz-filter-item-btn ${!brandId ? "active" : ""}`}
            >
              All Brands
            </button>
          </li>
          {brands.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => updateParams({ brand: b.id })}
                className={`sz-filter-item-btn ${brandId === String(b.id) ? "active" : ""}`}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Section */}
      <div className="sz-filter-section">
        <h4 className="sz-filter-title">Price Range</h4>
        <form onSubmit={handlePriceApply}>
          <div className="sz-price-inputs mb-3">
            <div className="sz-price-input-wrapper">
              <span className="sz-price-currency">₹</span>
              <input
                type="number"
                className="form-control sz-price-field"
                placeholder="Min"
                value={priceMinInput}
                onChange={(e) => setPriceMinInput(e.target.value)}
              />
            </div>
            <span className="text-muted small">to</span>
            <div className="sz-price-input-wrapper">
              <span className="sz-price-currency">₹</span>
              <input
                type="number"
                className="form-control sz-price-field"
                placeholder="Max"
                value={priceMaxInput}
                onChange={(e) => setPriceMaxInput(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="w-100 sz-btn-apply-price">
            Apply
          </button>
        </form>
      </div>

      {/* Reset Filter Button */}
      {(category || brandId || minPriceQuery || maxPriceQuery) && (
        <div className="text-center mt-3">
          <button onClick={clearAllFilters} className="sz-btn-clear-all">
            Clear All Filters
          </button>
        </div>
      )}
    </>
  );

  return (
    <StoreShell>
      <div className="container-fluid container-xl">
        
        {/* COLLECTION HEADER / TOP TITLE HEADER */}
        {activeBanner ? (
          <div 
            className="sz-collection-banner mb-5 p-5 text-white position-relative d-flex align-items-center"
            style={{
              background: activeBanner.background_color || "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            }}
          >
            {/* Ambient light glow inside banner */}
            <div className="sz-banner-glow" />
            
            <div className="row align-items-center g-4 w-100 position-relative z-2">
              {activeBanner.image && (
                <div className="col-md-3 text-center text-md-start">
                  <div className="sz-banner-img-container">
                    <img 
                      src={mediaUrl(activeBanner.image)} 
                      alt={activeBanner.title} 
                      className="img-fluid"
                    />
                  </div>
                </div>
              )}
              <div className="col-md-9 text-center text-md-start">
                <span className="sz-banner-badge mb-3">
                  🏆 Special Collection
                </span>
                <h1 className="display-6 fw-extrabold mb-3 text-white tracking-tight">
                  {activeBanner.title}
                </h1>
                <p className="mb-0 text-white-50 lead fs-6 fw-normal">
                  {activeBanner.description || activeBanner.subtitle || "Official match gear and fan-favorite products."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <header className="sz-listing-header">
            <p className="sz-kicker">Store</p>
            <div className="sz-listing-header-row">
              <h1 className="sz-listing-title">{title}</h1>
              {!loading && <p className="sz-listing-count">{totalCount} items found</p>}
            </div>
          </header>
        )}

        {/* ACTIVE FILTER TAGS DRAWER */}
        {(category || brandId || minPriceQuery || maxPriceQuery || search) && (
          <div className="sz-active-filters-bar">
            <span className="small fw-bold text-secondary">Active filters:</span>
            <div className="sz-active-filters-wrap flex-grow-1">
              {search && (
                <span className="sz-filter-tag">
                  Search: "{search}"
                  <button onClick={() => updateParams({ search: "" })} className="sz-filter-tag-remove" aria-label="Remove search filter">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              {category && (
                <span className="sz-filter-tag">
                  Category: {activeCategoryName}
                  <button onClick={() => updateParams({ category: "" })} className="sz-filter-tag-remove" aria-label="Remove category filter">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              {brandId && (
                <span className="sz-filter-tag">
                  Brand: {activeBrandName}
                  <button onClick={() => updateParams({ brand: "" })} className="sz-filter-tag-remove" aria-label="Remove brand filter">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              {(minPriceQuery || maxPriceQuery) && (
                <span className="sz-filter-tag">
                  Price: ₹{minPriceQuery || 0} - ₹{maxPriceQuery || "Any"}
                  <button onClick={() => updateParams({ min_price: "", max_price: "" })} className="sz-filter-tag-remove" aria-label="Remove price filter">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              <button onClick={clearAllFilters} className="sz-btn-clear-all ms-2">
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* MAIN LISTING WORKSPACE */}
        <div className="sz-listing-layout">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="sz-filter-sidebar d-none d-lg-block">
            {renderSidebarContent()}
          </aside>

          {/* PRODUCTS WRAPPER */}
          <main className="sz-products-content">
            
            {/* FEATURED PRODUCTS SECTION */}
            {activeBanner && activeBanner.featured_products && activeBanner.featured_products.length > 0 && (
              <div className="sz-featured-products-section mb-5 p-4 rounded-4 shadow-sm border" style={{ background: "#f8fafc" }}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span style={{ fontSize: "1.2rem" }}>⭐️</span>
                  <h3 className="h5 fw-bold mb-0 text-dark">Featured Products</h3>
                </div>
                <div className="row g-4">
                  {activeBanner.featured_products.map((product, index) => (
                    <div className="col-6 col-md-4 d-flex" key={`featured-${product.id}`}>
                      <ProductCard product={product} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION HEADING FOR REMAINING PRODUCTS */}
            {activeBanner && activeBanner.featured_products && activeBanner.featured_products.length > 0 && (
              <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-2">
                <span style={{ fontSize: "1.1rem" }}>👟</span>
                <h4 className="h6 fw-bold mb-0 text-secondary text-uppercase" style={{ letterSpacing: "0.05em" }}>
                  Other {activeCategoryName || "Category"} Products
                </h4>
              </div>
            )}
            
            {/* GRID CONTROLS TOPBAR */}
            <div className="sz-listing-topbar d-flex justify-content-between align-items-center mb-4">
              {/* Left: Mobile Filters button */}
              <div className="d-lg-none">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="sz-btn-mobile-filter"
                >
                  <FaSlidersH size={14} />
                  Filters
                </button>
              </div>

              <div className="d-none d-lg-block">
                <span className="text-secondary small fw-semibold">
                  {activeBanner && activeBanner.featured_products && activeBanner.featured_products.length > 0
                    ? `Other products: ${totalCount} items`
                    : `Showing ${products.length} of ${totalCount} items`
                  }
                </span>
              </div>

              {/* Right: Sort options */}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-secondary fw-semibold d-none d-sm-block">Sort by:</span>
                <select
                  className="sz-sort-select"
                  value={sortOption}
                  onChange={(e) => updateParams({ ordering: e.target.value })}
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
              <div className="row g-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div className="col-6 col-md-4" key={i}>
                    <ProductCardSkeleton />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="sz-empty-state">
                <div className="sz-empty-icon">🔍</div>
                <h3 className="fw-bold text-dark mb-2">No Products Found</h3>
                <p className="text-secondary mb-4">We couldn't find any products matching your active criteria. Try adjusting your filters.</p>
                <button onClick={clearAllFilters} className="sz-btn-apply-price px-4 py-2 rounded-pill w-auto">
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {products.map((product, index) => (
                    <div className="col-6 col-md-4 d-flex" key={product.id}>
                      <ProductCard product={product} index={index} />
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <nav aria-label="Product pagination" className="d-flex justify-content-center mt-5">
                    <ul className="pagination shadow-sm">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link shadow-none border-0 text-dark"
                          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                          style={{ background: "#f8fafc" }}
                        >
                          &laquo; Prev
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <li key={pageNum} className={`page-item ${isActive ? "active" : ""}`}>
                            <button
                              className={`page-link border-0 ${isActive ? "bg-primary text-white fw-bold" : "text-dark"}`}
                              onClick={() => handlePageChange(pageNum)}
                              style={!isActive ? { background: "#f8fafc" } : {}}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link shadow-none border-0 text-dark"
                          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                          style={{ background: "#f8fafc" }}
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

        {/* MOBILE FILTERS MODAL SIDE DRAWER */}
        <div
          className={`sz-mobile-filter-modal ${mobileFiltersOpen ? "is-open" : ""}`}
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="sz-mobile-filter-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
              <h3 className="h5 fw-bold mb-0">Filters</h3>
              <button
                className="sz-close-btn"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="sz-mobile-filter-body">
              {renderSidebarContent()}
            </div>
          </div>
        </div>

      </div>
    </StoreShell>
  );
}

export default AllProducts;
