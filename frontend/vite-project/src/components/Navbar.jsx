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
  FaDumbbell, 
  FaBicycle, 
  FaRunning, 
  FaBasketballBall,
  FaUserCircle,
  FaBoxOpen,
  FaHeart,
  FaGift,
  FaHeadset,
  FaSignOutAlt,
  FaRegUserCircle,
  FaStar,
  FaUserShield,
} from "react-icons/fa";
import { MdSportsCricket, MdSportsTennis } from "react-icons/md";
import Logo from "./Logo";
import "./Navbar.css";

const MOCK_CATEGORIES = [
  { name: "For You", icon: <FaStar size={18} />, path: "/" },
  { name: "Cricket", icon: <MdSportsCricket size={18} />, path: "/shop?category=cricket" },
  { name: "Football", icon: <FaFutbol size={16} />, path: "/shop?category=football" },
  { name: "Gym & Training", icon: <FaDumbbell size={18} />, path: "/shop?category=gym%20%26%20training" },
  { name: "Running", icon: <FaRunning size={18} />, path: "/shop?category=running" },
  { name: "Cycling", icon: <FaBicycle size={18} />, path: "/shop?category=cycling" },
  { name: "Basketball", icon: <FaBasketballBall size={18} />, path: "/shop?category=basketball" },
  { name: "Tennis", icon: <MdSportsTennis size={18} />, path: "/shop?category=tennis" },
];

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems, fetchCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchWrapperRef = useRef(null);
  const mobileSearchWrapperRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
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

  const cartItemCount = cartItems.length;

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
    <header className="sz-header-wrapper sticky-top">
      {/* Main Navbar */}
      <nav className="sz-navbar container-fluid container-xl d-flex align-items-center justify-content-between px-3 px-md-4">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="d-lg-none border-0 bg-transparent text-secondary p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          
          <Link to="/" className="text-decoration-none">
            <Logo fontSize="1.8rem" />
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4 position-relative" ref={searchWrapperRef} style={{ maxWidth: "600px" }}>
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
            <div className="sz-search-suggestions shadow-sm">
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

        {/* Right: Actions */}
        <div className="d-flex align-items-center gap-1 gap-md-4">

          {isAuthenticated ? (
            <div className="sz-user-wrapper">
              <button type="button" className="sz-action-btn fw-semibold">
                <FaRegUserCircle size={22} />
                <span className="d-none d-xl-block">You</span>
              </button>
              
              <div className="sz-user-menu p-2 shadow-sm">
                <div className="px-2 py-2 mb-2 border-bottom">
                  <div className="small text-muted">Hello,</div>
                  <div className="fw-bold text-truncate">{user?.email || user?.username || "Athlete"}</div>
                </div>
                <div className="grid-cols-2 mb-2">
                  <Link to="/orders" className="sz-grid-item text-decoration-none d-flex flex-column align-items-center justify-content-center p-3 border rounded text-dark">
                    <FaBoxOpen size={20} className="text-primary mb-2" />
                    <span className="small fw-semibold">Orders</span>
                  </Link>
                  <Link to="/wishlist" className="sz-grid-item text-decoration-none d-flex flex-column align-items-center justify-content-center p-3 border rounded text-dark">
                    <FaHeart size={20} className="text-primary mb-2" />
                    <span className="small fw-semibold">Wishlist</span>
                  </Link>
                  <Link to="#" className="sz-grid-item text-decoration-none d-flex flex-column align-items-center justify-content-center p-3 border rounded text-dark">
                    <FaGift size={20} className="text-primary mb-2" />
                    <span className="small fw-semibold">Coupons</span>
                  </Link>
                  <Link to="/help" className="sz-grid-item text-decoration-none d-flex flex-column align-items-center justify-content-center p-3 border rounded text-dark">
                    <FaHeadset size={20} className="text-primary mb-2" />
                    <span className="small fw-semibold">Help Center</span>
                  </Link>
                </div>
                
                <div className="dropdown-divider my-2 border-light"></div>
                
                <Link to="/profile" className="sz-dropdown-item rounded mb-1">
                  <FaUserCircle size={16} className="text-primary" />
                  My Profile
                </Link>
                {user?.is_staff && (
                  <Link to="/admin" className="sz-dropdown-item rounded mb-1">
                    <FaUserShield size={16} className="text-danger" />
                    Admin panel
                  </Link>
                )}
                <button onClick={handleLogout} className="sz-dropdown-item rounded text-danger">
                  <FaSignOutAlt size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button className="sz-action-btn fw-semibold" onClick={() => navigate("/login")}>
              <FaRegUserCircle size={22} />
              <span className="d-none d-md-block">Login</span>
            </button>
          )}

          <Link
            to="/cart"
            className="sz-action-btn text-decoration-none"
            onClick={handleCartClick}
          >
            <div className="position-relative d-inline-flex align-items-center">
              <FaShoppingCart size={24} color="#0f172a" />
              <span className="sz-cart-badge shadow-sm">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            </div>
          </Link>

        </div>
      </nav>

      {/* Mobile Search Input Dropdown */}
      {isMenuOpen && (
        <div className="sz-mobile-search d-lg-none bg-white p-3 shadow-sm position-absolute w-100" ref={mobileSearchWrapperRef}>
          <form onSubmit={handleSearchSubmit} className="sz-search-box d-flex align-items-center w-100 mb-3 mx-auto" style={{ overflow: "visible" }}>
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

          {/* Mobile Suggestion Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className="sz-search-suggestions shadow-sm mb-3">
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
          
          <div className="d-flex flex-column gap-2 px-2 pb-2">
            <NavLink to="/shop" className="sz-dropdown-item rounded" onClick={() => setIsMenuOpen(false)}>All Products</NavLink>
            <hr className="my-1 border-light" />
            
            {MOCK_CATEGORIES.map((cat) => (
              <Link 
                key={cat.name} 
                to={cat.path} 
                className={`sz-dropdown-item rounded d-flex align-items-center gap-2 ${
                  (location.pathname === '/' && cat.path === '/') || 
                  (location.pathname === '/shop' && location.search.includes(encodeURIComponent(cat.name.toLowerCase())))
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
        </div>
      )}

      <div className={`sz-category-strip d-none d-md-block ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container-fluid container-xl">
          <div className="sz-cat-container d-flex align-items-center justify-content-center gap-4 gap-xl-5">
            {MOCK_CATEGORIES.map((cat) => {
              const isActive = (location.pathname === '/' && cat.path === '/') || 
                               (location.pathname === '/shop' && location.search.includes(encodeURIComponent(cat.name.toLowerCase())));
              return (
                <Link 
                  key={cat.name} 
                  to={cat.path}
                  className={`sz-cat-item ${isActive ? 'active' : ''}`}
                >
                  <div className="sz-cat-icon-wrapper">
                    {cat.icon}
                  </div>
                  <span className="sz-cat-name">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </header>
  );
}

export default Navbar;