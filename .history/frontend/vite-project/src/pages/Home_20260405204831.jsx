import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import "./Home.css";
// Loading Skeleton component embedded for pure API driven UI
const SkeletonCard = () => (
  <div className="skeleton-card bg-white h-100 border p-3 d-flex flex-column">
    <div className="skeleton-img bg-light w-100 mb-3 rounded" style={{ height: '220px' }}></div>
    <div className="skeleton-text bg-light w-50 mb-2 rounded" style={{ height: '14px' }}></div>
    <div className="skeleton-text bg-light w-100 mb-2 rounded" style={{ height: '20px' }}></div>
    <div className="skeleton-text bg-light w-75 mt-auto mb-3 rounded" style={{ height: '24px' }}></div>
    <div className="skeleton-btn bg-light w-100 rounded-pill" style={{ height: '36px' }}></div>
  </div>
);
const CRICKET_EQUIPMENT = [
  { name: "Cricket Bats", image: "/media/bat.png", query: "bat" },
  { name: "Batting Pads", image: "/media/pad.png", query: "pad" },
  { name: "Helmets", image: "/media/helmet.png", query: "helmet" },
  { name: "Batting Gloves", image: "/media/gloves.png", query: "gloves" },
  { name: "Stumps", image: "/media/stumps.png", query: "stump" },
  { name: "Cricket Balls", image: "/media/ball.png", query: "ball" },
  { name: "Kit Bags", image: "/media/kit_bag.png", query: "bag" },
  { name: "Thigh Pads", image: "/media/thigh_pad.png", query: "thigh" },
  { name: "Shoes", image: "/media/cricket_shoes.png", query: "shoes" },
  { name: "Guards", image: "/media/guard.png", query: "guard" },
];
const getImageUrl = (url) => {
  if (!url) return "/no-image.png";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `http://127.0.0.1:8000${url.startsWith('/') ? '' : '/'}${url}`;
};
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);
    
    API.get("products/")
      .then(res => {
        if (isMounted) {
          setProducts(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Error fetching homepage data:", err);
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);
  // Strict Rule calculations derived from actual dynamic API product array
  const { categories, cricketProducts, comboProducts, topBrands, heroProduct } = useMemo(() => {
    if (!products || products.length === 0) {
      return { categories: [], cricketProducts: [], comboProducts: [], topBrands: [], heroProduct: null };
    }
    // 2. Derive distinct categories with first associated image
    const catsMap = new Map();
    // 5. Extract distinct pseudo-brands
    const brandsMap = new Map();
    // 3. Cricket specifically filtered
    const cricketList = [];
    // 4. Combo inference
    const comboList = [];
    products.forEach(p => {
      // Categories Extraction
      const c = p.category ? String(p.category).trim() : "";
      if (c && !catsMap.has(c.toLowerCase())) {
        catsMap.set(c.toLowerCase(), {
          id: p.id,
          name: c.charAt(0).toUpperCase() + c.slice(1),
          value: c,
          image: getImageUrl(p.image)
        });
      }
      // Brand Extraction (first word of name assuming robust title mapping)
      const brand = p.name ? p.name.split(' ')[0].toUpperCase() : "SPORTS";
      if (brand.length > 2 && !brandsMap.has(brand)) {
        brandsMap.set(brand, { name: brand, image: getImageUrl(p.image) });
      }
      // Filter Logic
      if (c.toLowerCase() === 'cricket') cricketList.push(p);
      // Intelligent string matching if no strict tag since API may not enforce "is_combo"
      const nameStr = p.name ? p.name.toLowerCase() : "";
      if (nameStr.includes("combo") || nameStr.includes("set") || nameStr.includes("kit") || nameStr.includes("pack")) {
        comboList.push(p);
      }
    });
    // Fallbacks if data chunks fall short due to sparse test DB
    const finalCombos = comboList.length > 3 ? comboList : products.slice(0, 4);
    // Extract best dynamic Hero Product (Ideally a cricket kit or combo)
    let dynamicHero = products.find(p => p.name && p.name.toLowerCase().includes('kit') && p.category?.toLowerCase() === 'cricket');
    if (!dynamicHero) {
      dynamicHero = comboList.length > 0 ? comboList[0] : (cricketList.length > 0 ? cricketList[0] : products[0]);
    }
    return {
      categories: Array.from(catsMap.values()),
      cricketProducts: cricketList.slice(0, 4),
      comboProducts: finalCombos.slice(0, 4),
      topBrands: Array.from(brandsMap.values()).slice(0, 6),
      heroProduct: dynamicHero
    };
  }, [products]);
  // Loading sequence showing skeleton states precisely tracking expected layout grid
  if (loading) {
    return (
      <div className="amz-home-container bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem', borderWidth: '0.25em' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-4 fw-bold text-secondary text-uppercase" style={{ letterSpacing: '1px' }}>Loading Premium Sports Gear...</h5>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <h3 className="fw-bold text-dark mb-3">Something went wrong.</h3>
        <button className="btn btn-warning fw-bold px-4" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  return (
    <div className="amz-home-container bg-light min-vh-100 pb-5">
      {/* 1. Top Banner Section - Blue Promotional Layout */}
      <div className="sz-hero-banner container-fluid container-xl mt-3 px-sm-3 position-relative">
        <div className="sz-hero-inner rounded overflow-hidden position-relative shadow-sm" style={{ height: '380px', backgroundColor: '#57b8ff' }}>
          {/* Subtle grid background */}
          <div className="sz-hero-bg-grid position-absolute top-0 start-0 w-100 h-100" style={{ opacity: 0.1, backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="row h-100 m-0 position-relative z-1">
            {/* Left Content */}
            <div className="col-12 col-md-6 d-flex flex-column justify-content-center px-4 px-md-5 py-4">
              <h1 className="fw-bold display-4 mb-2 text-dark text-truncate-2" style={{ lineHeight: '1.2' }}>
                {heroProduct?.name && heroProduct.name.toLowerCase().includes('kit') ? (
                  <>Premium<br/>Cricket Kits</>
                ) : (
                  <>{heroProduct?.name || "Cricket Kits & More"}</>
                )}
              </h1>
              <p className="fs-4 fw-bold text-dark mb-4 drop-shadow-sm opacity-75">
                Up to <span className="text-white bg-danger px-2 py-1 rounded ms-1">50% Off</span>
              </p>
              <Link to={heroProduct ? `/product/${heroProduct.id}` : "/shop?category=cricket"} className="btn btn-dark text-white fw-bold rounded shadow-sm py-3 px-5 w-auto me-auto hover-scale text-uppercase tracking-wider">
                Shop Now
              </Link>
            </div>
            
            {/* Right Decorative Shape & Image */}
            <div className="col-12 col-md-6 position-relative d-none d-md-block h-100 d-flex align-items-end justify-content-center">
              <div className="sz-hero-shape bg-white position-absolute bottom-0 end-0" style={{ width: '90%', height: '90%', borderTopLeftRadius: '50%', borderTopRightRadius: '50%', opacity: 0.85 }}></div>
              <img 
                src={heroProduct ? getImageUrl(heroProduct.image) : getImageUrl("/media/cricket_banner.png")} 
                alt={heroProduct?.name || "Cricket Kit"} 
                className="position-relative z-2" 
                style={{ height: '95%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))' }} 
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800"; }} 
              />
            </div>
          </div>
        </div>
      </div>
      {/* 2. Cricket Equipment Strip */}
      <div className="container-fluid container-xl mt-4">
        <div className="sz-equipment-strip d-flex gap-3 overflow-auto custom-scrollbar pb-3">
          {CRICKET_EQUIPMENT.map((item) => (
            <Link
              key={item.name}
              to={`/shop?search=${item.query}`}
              className="sz-equip-card text-decoration-none text-dark d-flex flex-column align-items-center flex-shrink-0"
            >
              <div className="sz-equip-img-box rounded bg-white shadow-sm border position-relative overflow-hidden mb-2 d-flex align-items-center justify-content-center">
                {/* Replicating the distinct blue bottom / white top border style from the screenshot */}
                <div className="position-absolute bottom-0 w-100" style={{ height: '35%', backgroundColor: '#e0f2fe', zIndex: 0 }}></div>
                <img src={getImageUrl(item.image)} alt={item.name} className="img-fluid object-fit-contain position-relative z-1 p-2" style={{ width: '85px', height: '85px' }} onError={(e) => { e.target.src = "/no-image.png"; }} />
              </div>
              <span className="fw-semibold text-center" style={{ fontSize: '0.82rem' }}>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="container-fluid container-xl mt-4">
        {/* 3. Cricket Essentials Section */}
        {cricketProducts.length > 0 && (
          <div className="amz-section-block bg-white border border-light p-3 p-md-4 mb-4 shadow-sm rounded-0 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <h2 className="fs-4 fw-bold m-0 text-dark">Cricket Essentials To Propel Your Game</h2>
              <Link to="/shop?category=cricket" className="text-primary text-decoration-none fw-medium d-none d-sm-block hover-underline">See More</Link>
            </div>
            <div className="row g-3">
              {cricketProducts.map(product => (
                <div className="col-12 col-sm-6 col-lg-3 d-flex" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 5. Top Brands Extracted dynamically based purely on data */}
        {topBrands.length > 0 && (
          <div className="amz-brands-block bg-white p-3 p-md-4 mb-4 shadow-sm">
            <h3 className="fs-5 fw-bold mb-4 text-dark border-bottom pb-2">Deal on Top Brands</h3>
            <div className="d-flex flex-wrap gap-4 overflow-auto custom-scrollbar pb-3">
              {topBrands.map(brand => (
                <Link to={`/shop?search=${brand.name}`} className="text-decoration-none d-flex flex-column align-items-center hover-pop" style={{ minWidth: '130px' }} key={brand.name}>
                  <div className="amz-brand-img bg-light border p-3 flex-center mb-2" style={{ height: '130px', width: '130px' }}>
                    <img src={brand.image || "/no-image.png"} className="img-fluid mix-blend-multiply h-100 object-fit-contain" alt={brand.name} onError={(e) => { e.target.src = "/no-image.png"; }} />
                  </div>
                  <span className="bg-danger text-white px-2 py-1 fw-bold text-center w-100" style={{ fontSize: '0.8rem' }}>Up to 40% Off</span>
                  <span className="fw-bold mt-1 text-dark text-truncate w-100 text-center">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* 4. Best Combos Section */}
        {comboProducts.length > 0 && (
          <div className="amz-section-block bg-white border border-light p-3 p-md-4 mb-4 shadow-sm rounded-0">
            <h2 className="fs-4 fw-bold mb-4 text-dark border-bottom pb-3">Top Training Sets & Combos</h2>
            <div className="row g-3">
              {comboProducts.map(product => (
                <div className="col-12 col-sm-6 col-lg-3 d-flex" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default Home;