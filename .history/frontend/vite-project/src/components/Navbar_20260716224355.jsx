import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import { mediaUrl } from "../utils/mediaUrl";
import { 
  FaSearch, 
  FaShoppingCart, 
  FaUser, 
  FaBars, 
  FaTimes, 
  FaFutbol, 
  FaBicycle, 
  FaRunning, 
  FaBasketballBall,
  FaVolleyballBall,
  FaUserCircle,
  FaBoxOpen,
  FaRegHeart,
  FaGift,
  FaHeadset,
  FaSignOutAlt,
  FaRegUserCircle,
  FaStar,
  FaUserShield,
  FaChevronDown,
  FaWallet,
  FaEnvelope,
  FaAward,
} from "react-icons/fa";
import { 
  MdOutlineStarBorder,
  MdOutlineSportsCricket,
  MdOutlineSportsSoccer,
  MdOutlineDirectionsRun,
  MdOutlineDirectionsBike,
  MdOutlineSportsBasketball,
  MdOutlineSportsTennis,
  MdOutlineSportsVolleyball
} from "react-icons/md";
import Logo from "./Logo";
import "./Navbar.css";

const MOCK_CATEGORIES = [
  { name: "For You", icon: <MdOutlineStarBorder size={20} />, path: "/" },
  { name: "Cricket", icon: <MdOutlineSportsCricket size={20} />, path: "/shop?category=cricket" },
  { name: "Football", icon: <MdOutlineSportsSoccer size={20} />, path: "/shop?category=football" },
  { name: "Running", icon: <MdOutlineDirectionsRun size={20} />, path: "/shop?category=running" },
  { name: "Cycling", icon: <MdOutlineDirectionsBike size={20} />, path: "/shop?category=cycling" },
  { name: "Basketball", icon: <MdOutlineSportsBasketball size={20} />, path: "/shop?category=basketball" },
  { name: "Tennis", icon: <MdOutlineSportsTennis size={20} />, path: "/shop?category=tennis" },
  { name: "Volleyball", icon: <MdOutlineSportsVolleyball size={20} />, path: "/shop?category=volleyball" },
];

const CategoryStrip = React.memo(({ pathname, search, isScrolled }) => {
  return (
    <div className={`sz-category-strip d-none d-md-block ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid container-xl h-100">
        <div className="sz-cat-container">
          {categories.map((cat) => {
            const isActive = (pathname === '/' && cat.path === '/') || 
                             (pathname === '/shop' && search.includes(encodeURIComponent(cat.name.toLowerCase())));
            return (
              <Link 
                key={cat.name} 
                tto={cat.slug ? `/shop?category=${cat.slug}` : "/"}
                className={`sz-cat-item ${isActive ? 'active' : ''}`}
              >
                <span className="sz-cat-icon">{cat.icon}</span>
                <span className="sz-cat-name">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const MobileCategoryList = React.memo(({ pathname, search, setIsMenuOpen }) => {
  return (
    <div className="d-flex flex-column gap-2 px-1">
      <div className="small text-muted uppercase fw-bold mb-1 px-2" style={{ letterSpacing: '0.05em' }}>Categories</div>
      <NavLink 
        to="/shop" 
        className="sz-dropdown-item rounded" 
        onClick={() => setIsMenuOpen(false)}
      >
        All Products
      </NavLink>
      <hr className="my-1 border-light" />
      
      {MOCK_CATEGORIES.map((cat) => (
        <Link 
          key={cat.name} 
          to={cat.path} 
          className={`sz-dropdown-item rounded d-flex align-items-center gap-2 ${
            (pathname === '/' && cat.path === '/') || 
            (pathname === '/shop' && search.includes()
              ? 'text-primary fw-bold bg-light' 
              : 'text-secondary'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="text-primary">{cat.icon}</span>
          {cat.name}
        </Link>
      ))}
    </div>
  );
});

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems, fetchCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  // Search Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [animateCart, setAnimateCart] = useState(false);

  const searchWrapperRef = useRef(null);
  const mobileSearchWrapperRef = useRef(null);

  const cartItemCount = cartItems.length;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled((prevScrolled) => {
        if (prevScrolled) {
          return currentScrollY > 20;
        } else {
          return currentScrollY > 100;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Cart Badge pop animation trigger on change
  useEffect(() => {
    if (cartItemCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await API.get("categories/");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCategories();
}, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideDesktop = searchWrapperRef.current && !searchWrapperRef.current.contains(e.target);
      const isOutsideMobile = mobileSearchWrapperRef.current && !mobileSearchWrapperRef.current.contains(e.target);
      if (isOutsideDesktop && isOutsideMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Search for Suggestions
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await API.get(`products/?search=${encodeURIComponent(trimmed)}`);
        const data = Array.isArray(res.data) ? res.data.slice(0, 5) : [];
        setSuggestions(data);
        setShowSuggestions(true);
        setActiveSuggestionIndex(-1);
      } catch (err) {
        console.error("Suggestions API fetch failed", err);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeSuggestionIndex];
        navigate(`/product/${selected.id}`);
        setShowSuggestions(false);
        setSearchQuery("");
        setIsMenuOpen(false);
      } else {
        handleSearchSubmit(e);
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setShowSuggestions(false);
    setIsMenuOpen(false);
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <>
      <header className="sz-header-wrapper sticky-top">
        {/* Main Navbar */}
        <nav className="sz-navbar container-fluid container-xl d-flex align-items-center justify-content-between px-3 px-md-4">
          
          {/* Left: Brand & Mobile Toggle & Search Bar */}
          <div className="d-flex align-items-center gap-3 gap-lg-4 flex-grow-1" style={{ maxWidth: "800px" }}>
            <button
              className="d-lg-none border-0 bg-transparent text-secondary p-0"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Menu"
            >
              <FaBars size={22} />
            </button>
            
            <Link to="/" className="text-decoration-none flex-shrink-0">
              <Logo fontSize="1.6rem" />
            </Link>

            {/* Search Bar (Moved near brand name) */}
            <div className="d-none d-lg-flex position-relative flex-grow-1 ms-2 sz-search-wrapper" ref={searchWrapperRef}>
              <form onSubmit={handleSearchSubmit} className="sz-search-box d-flex align-items-center w-100 ps-2" style={{ overflow: "visible" }}>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none px-3 sz-search-input"
                  placeholder="Search sports gear..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button type="submit" className="border-0 sz-search-btn text-white d-flex align-items-center justify-content-center">
                  <FaSearch size={18} />
                </button>
              </form>

              {/* Suggestion Dropdown */}
              {showSuggestions && searchQuery.trim() && (
                <div className="sz-search-suggestions shadow-sm show">
                  {searchLoading && <div className="sz-suggestion-loading">Searching...</div>}
                  {!searchLoading && suggestions.length === 0 && (
                    <div className="sz-suggestion-no-results">No products found</div>
                  )}
                  {!searchLoading && suggestions.length > 0 && (
                    <div className="sz-suggestion-list">
                      {suggestions.map((item, index) => (
                        <div
                          key={item.id}
                          className={`sz-suggestion-item ${index === activeSuggestionIndex ? "active" : ""}`}
                          onClick={() => {
                            navigate(`/product/${item.id}`);
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                        >
                          <img src={mediaUrl(item.image) || "/no-image.png"} alt={item.name} className="sz-suggestion-img" />
                          <div className="sz-suggestion-details">
                            <span className="sz-suggestion-name text-truncate">{item.name}</span>
                            {item.category && (
                              <span className="sz-suggestion-category-name">
                                in {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Shop, Wishlist, User, Cart */}
          <div className="d-flex align-items-center gap-2 gap-lg-3 flex-shrink-0">
            
            {/* Shop Hover Dropdown Link (Desktop) */}
            <div className="d-none d-lg-block sz-mega-trigger-wrap">
              <span className="sz-mega-trigger-btn d-flex align-items-center gap-1">
                Shop <FaChevronDown className="sz-arrow-down" size={10} />
              </span>
              
              {/* Mega Menu Dropdown */}
              <div className="sz-mega-menu shadow">
                <div className="container-fluid container-xl py-4">
                  <div className="row g-4 text-start">
                    {/* Column 1: Team Sports */}
                    <div className="col-4">
                      <h4 className="sz-mega-title">Team Sports</h4>
                      <ul className="list-unstyled sz-mega-links">
                        <li><Link to="/shop?category=cricket">Cricket Gear</Link></li>
                        <li><Link to="/shop?category=football">Football Cleats & Balls</Link></li>
                        <li><Link to="/shop?category=basketball">Basketballs & Gear</Link></li>
                        <li><Link to="/shop?category=volleyball">Volleyball Gear</Link></li>
                      </ul>
                    </div>
                    {/* Column 2: Racket & Fit */}
                    <div className="col-4">
                      <h4 className="sz-mega-title">Individual Sports</h4>
                      <ul className="list-unstyled sz-mega-links">
                        <li><Link to="/shop?category=running">Running Shoes</Link></li>
                        <li><Link to="/shop?category=cycling">Bicycles & Cycling</Link></li>
                        <li><Link to="/shop?category=tennis">Tennis Rackets & Balls</Link></li>
                        <li><Link to="/shop?category=badminton">Badminton Rackets & Gear</Link></li>
                        <li><Link to="/shop">All Sports Equipment</Link></li>
                      </ul>
                    </div>
                    {/* Column 3: Membership & Deals */}
                    <div className="col-4">
                      <h4 className="sz-mega-title">Deals & Coupons</h4>
                      <ul className="list-unstyled sz-mega-links">
                        <li><Link to="/shop?best_seller=true">Best Seller Gear</Link></li>
                        <li><Link to="/shop">Exclusive Clearance</Link></li>
                        <li><Link to="/cart">Cart Coupon Offers</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="sz-user-wrapper">
                <button type="button" className="sz-action-btn fw-semibold">
                  <FaRegUserCircle size={22} />
                  <span className="d-none d-xl-block">You</span>
                </button>
                
                <div className="sz-user-menu shadow-sm">
                  <div className="sz-dropdown-list">
                    <Link to="/orders" className="sz-dropdown-list-item">
                      <FaShoppingCart className="sz-dropdown-icon" />
                      <span>Orders & Returns</span>
                    </Link>
                    
                    <Link to="/profile" className="sz-dropdown-list-item">
                      <FaEnvelope className="sz-dropdown-icon" />
                      <span>My Addresses</span>
                    </Link>
                    
                    <Link to="/help" className="sz-dropdown-list-item">
                      <FaHeadset className="sz-dropdown-icon" />
                      <span>Support</span>
                    </Link>

                    {user?.is_staff && (
                      <Link to="/admin" className="sz-dropdown-list-item admin">
                        <FaUserShield className="sz-dropdown-icon" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <div className="sz-dropdown-divider"></div>

                    <button onClick={handleLogout} className="sz-dropdown-list-item logout">
                      <FaSignOutAlt className="sz-dropdown-icon logout-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button className="sz-action-btn fw-semibold" onClick={() => navigate("/login")}>
                <FaRegUserCircle size={22} />
                <span className="d-none d-md-block">Login</span>
              </button>
            )}

            {/* Wishlist Link */}
            <Link to="/wishlist" className="sz-action-btn text-decoration-none">
              <FaRegHeart size={22} />
              <span className="d-none d-xl-block">Wishlist</span>
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="sz-action-btn text-decoration-none"
              onClick={handleCartClick}
            >
              <div className="position-relative d-inline-flex align-items-center" style={{ padding: "2px" }}>
                <FaShoppingCart size={22} />
                <span className={`sz-cart-badge shadow-sm ${animateCart ? 'pop' : ''}`}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              </div>
            </Link>

          </div>
        </nav>

        {!["/checkout", "/orders"].includes(location.pathname) && (
          <CategoryStrip 
            pathname={location.pathname} 
            search={location.search} 
            isScrolled={isScrolled} 
          />
        )}
      </header>

      {/* Premium Slide-out Mobile Drawer */}
      <div 
        className={`sz-drawer-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      <div className={`sz-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="sz-drawer-header">
          <Link to="/" className="text-decoration-none" onClick={() => setIsMenuOpen(false)}>
            <Logo fontSize="1.4rem" />
          </Link>
          <button 
            className="sz-drawer-close-btn"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close Menu"
          >
            <FaTimes size={22} />
          </button>
        </div>

        <div className="sz-drawer-body">
          {/* Mobile Search inside Drawer */}
          <div className="sz-drawer-search-wrapper" ref={mobileSearchWrapperRef}>
            <form onSubmit={handleSearchSubmit} className="sz-drawer-search-box d-flex align-items-center w-100 ps-2">
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none px-3 sz-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className="border-0 sz-search-btn text-white d-flex align-items-center justify-content-center">
                <FaSearch size={18} />
              </button>
            </form>

            {/* Mobile Suggestion Dropdown inside Drawer */}
            {showSuggestions && searchQuery.trim() && (
              <div className="sz-drawer-search-suggestions shadow-sm">
                {searchLoading && <div className="sz-suggestion-loading">Searching...</div>}
                {!searchLoading && suggestions.length === 0 && (
                  <div className="sz-suggestion-no-results">No products found</div>
                )}
                {!searchLoading && suggestions.length > 0 && (
                  <div className="sz-suggestion-list">
                    {suggestions.map((item, index) => (
                      <div
                        key={item.id}
                        className={`sz-suggestion-item ${index === activeSuggestionIndex ? "active" : ""}`}
                        onClick={() => {
                          navigate(`/product/${item.id}`);
                          setShowSuggestions(false);
                          setSearchQuery("");
                          setIsMenuOpen(false);
                        }}
                      >
                        <img src={mediaUrl(item.image) || "/no-image.png"} alt={item.name} className="sz-suggestion-img" />
                        <div className="sz-suggestion-details">
                          <span className="sz-suggestion-name text-truncate">{item.name}</span>
                          {item.category && (
                            <span className="sz-suggestion-category-name">
                              in {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <MobileCategoryList 
            pathname={location.pathname} 
            search={location.search} 
            setIsMenuOpen={setIsMenuOpen} 
          />
        </div>
      </div>
    </>
  );
}

export default Navbar;