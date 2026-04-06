import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api";
// import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import "./Home.css";

// Loading Skeleton
const SkeletonCard = () => (
  <div className="skeleton-card glass-panel rounded-card p-3 d-flex flex-column h-100">
    <div className="skeleton-img w-100 mb-3 rounded" style={{height: '220px'}}></div>
    <div className="skeleton-text w-50 mb-2 rounded" style={{height: '14px'}}></div>
    <div className="skeleton-text w-100 mb-2 rounded" style={{height: '20px'}}></div>
    <div className="skeleton-text w-75 mt-auto mb-3 rounded" style={{height: '24px'}}></div>
    <div className="skeleton-btn w-100 rounded-pill" style={{height: '36px'}}></div>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    API.get("products/")
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching homepage data:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const { categories, cricketProducts, comboProducts, topBrands } = useMemo(() => {
    if (!products || products.length === 0) {
      return { categories: [], cricketProducts: [], comboProducts: [], topBrands: [] };
    }
    
    const catsMap = new Map();
    const brandsMap = new Map();
    const cricketList = [];
    const comboList = [];

    products.forEach(p => {
      const c = p.category?.trim();
      if (c && !catsMap.has(c.toLowerCase())) {
        catsMap.set(c.toLowerCase(), {
          id: p.id,
          name: c.charAt(0).toUpperCase() + c.slice(1),
          value: c,
          image: p.image
        });
      }

      const brand = p.name.split(' ')[0].toUpperCase();
      if (brand.length > 2 && !brandsMap.has(brand)) {
        brandsMap.set(brand, { name: brand, image: p.image });
      }

      if (c?.toLowerCase() === 'cricket') cricketList.push(p);

      const nameStr = p.name.toLowerCase();
      if (nameStr.includes("combo") || nameStr.includes("set") || nameStr.includes("kit") || nameStr.includes("pack")) {
        comboList.push(p);
      }
    });

    const finalCombos = comboList.length > 3 ? comboList : products.slice(0, 4);

    return {
      categories: Array.from(catsMap.values()),
      cricketProducts: cricketList.slice(0, 4),
      comboProducts: finalCombos.slice(0, 4),
      topBrands: Array.from(brandsMap.values()).slice(0, 6)
    };
  }, [products]);

  if (loading) {
    return (
      <div className="bg-dark min-vh-100">
        <div className="skeleton-header loading-shimmer" style={{height: '380px'}}></div>
        <div className="container-fluid container-xl mt-5">
          <div className="row g-4">
             {[1,2,3,4].map(idx => <div className="col-lg-3 col-md-6" key={idx}><SkeletonCard/></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <h3 className="fw-bold text-primary mb-3 font-heading">Something went wrong.</h3>
        <button className="btn btn-primary px-4 py-2" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="bg-dark min-vh-100 pb-5 overflow-hidden">
      
      {/* 2. Category Strip dynamically rendered */}
      {categories.length > 0 && (
        <div className="container-fluid container-xl mt-4 mb-2">
          <div className="glass-panel rounded-card overflow-auto py-4 custom-scrollbar px-2">
            <div className="d-flex gap-4 gap-md-5 justify-content-lg-center">
               {categories.map((cat) => (
                 <Link to={`/shop?category=${encodeURIComponent(cat.value)}`} className="sz-cat-item text-decoration-none d-flex flex-column align-items-center text-primary hover-pop" key={cat.value}>
                    <div className="sz-cat-img-box rounded-circle d-flex align-items-center justify-content-center p-3 mb-2" style={{width: '80px', height: '80px'}}>
                      <img src={cat.image || "/no-image.png"} className="img-fluid object-fit-contain h-100 w-100" alt={cat.name} onError={(e) => { e.target.src = "/no-image.png"; }}/>
                    </div>
                    <span className="fw-semibold small text-nowrap font-heading tracking-wide">{cat.name}</span>
                 </Link>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. Top Banner Section - Large Promotional */}
      <div className="sz-hero-banner container-fluid container-xl mt-4 px-sm-3 position-relative">
         <div className="glass-panel rounded-card overflow-hidden position-relative" style={{height: '420px', border: '1px solid rgba(14, 165, 233, 0.2)'}}>
            <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop" className="w-100 h-100 object-fit-cover opacity-25 position-absolute top-0 start-0 z-0" alt="Cricket Gear Promo"/>
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient opacity-50 z-0" style={{background: 'linear-gradient(90deg, #0f172a 0%, transparent 100%)'}}></div>
            
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center px-4 px-md-5 z-1">
               <span className="badge bg-gradient-blue text-white fw-bold px-3 py-2 mb-3 fs-6 d-inline-table w-auto font-heading border border-info border-opacity-25 shadow">PREMIUM SPORTING GOODS</span>
               <h1 className="fw-bold display-3 mb-2 text-white text-shadow-sm font-heading" style={{letterSpacing: '1px'}}>THE CRICKET EDIT</h1>
               <p className="fs-5 fw-medium text-secondary mb-4 shadow-sm w-md-50 w-100">Step up to the crease. Up to 50% Off Top-Tier Gear and Essentials.</p>
               <Link to="/shop?category=cricket" className="btn btn-primary fw-bold text-uppercase px-5 py-3 w-auto me-auto hover-scale shadow">Shop The Collection</Link>
            </div>
         </div>
      </div>

      <div className="container-fluid container-xl mt-5">
        
        {/* 3. Cricket Essentials Section */}
        {cricketProducts.length > 0 && (
          <div className="glass-panel rounded-card p-4 mb-5 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <h2 className="fs-3 fw-bold m-0 text-primary font-heading">CRICKET ESSENTIALS TO PROPEL YOUR GAME</h2>
              <Link to="/shop?category=cricket" className="text-accent text-decoration-none fw-semibold d-none d-sm-block hover-underline text-uppercase tracking-wide small">See More</Link>
            </div>
            <div className="row g-4">
              {cricketProducts.map(product => (
                <div className="col-12 col-sm-6 col-lg-3 d-flex" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Top Brands */}
        {topBrands.length > 0 && (
           <div className="glass-panel rounded-card p-4 mb-5">
             <h3 className="fs-4 fw-bold mb-4 text-primary border-bottom border-secondary border-opacity-25 pb-3 font-heading">DEALS ON TOP BRANDS</h3>
             <div className="d-flex flex-wrap gap-4 overflow-auto custom-scrollbar pb-3 justify-content-center">
                {topBrands.map(brand => (
                  <Link to={`/shop?search=${brand.name}`} className="text-decoration-none d-flex flex-column align-items-center hover-pop" style={{minWidth: '140px'}} key={brand.name}>
                     <div className="bg-card border border-secondary border-opacity-25 rounded-circle p-4 flex-center mb-3 shadow-sm" style={{height: '120px', width: '120px', transition: 'all 0.3s'}}>
                        <img src={brand.image || "/no-image.png"} className="img-fluid h-100 object-fit-contain filter-drop-shadow" alt={brand.name} onError={(e) => { e.target.src = "/no-image.png"; }}/>
                     </div>
                     <span className="badge bg-gradient-blue text-white px-2 py-1 fw-bold text-center w-100 mb-2">Up to 40% Off</span>
                     <span className="fw-bold text-primary text-truncate w-100 text-center font-heading tracking-wide">{brand.name}</span>
                  </Link>
                ))}
             </div>
           </div>
        )}

        {/* 4. Best Combos Section */}
        {comboProducts.length > 0 && (
          <div className="glass-panel rounded-card p-4 mb-5">
            <h2 className="fs-3 fw-bold mb-4 text-primary border-bottom border-secondary border-opacity-25 pb-3 font-heading">TOP TRAINING SETS & COMBOS</h2>
            <div className="row g-4">
              {comboProducts.map(product => (
                <div className="col-12 col-sm-6 col-lg-3 d-flex" key={product.id}>
                  {/* <ProductCard product={product} /> */}
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