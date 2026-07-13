import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import API from "../api";
import { mediaUrl } from "../utils/mediaUrl";
import Logo from "./Logo";
import { 
  FiSearch, 
  FiUser, 
  FiHeart, 
  FiShoppingBag, 
  FiMenu, 
  FiX, 
  FiPackage, 
  FiPercent, 
  FiHelpCircle, 
  FiLogOut,
  FiUserCheck,
  FiChevronRight
} from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems, fetchCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [animateCart, setAnimateCart] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const searchWrapperRef = useRef(null);
  const mobileSearchWrapperRef = useRef(null);
  const accountWrapperRef = useRef(null);

  const cartItemCount = cartItems.length;

  // Fetch cart on mount
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

  // Click outside to close suggestions and account dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideDesktop = searchWrapperRef.current && !searchWrapperRef.current.contains(e.target);
      const isOutsideMobile = mobileSearchWrapperRef.current && !mobileSearchWrapperRef.current.contains(e.target);
      const isOutsideAccount = accountWrapperRef.current && !accountWrapperRef.current.contains(e.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowSuggestions(false);
      }
      if (isOutsideAccount) {
        setShowAccountDropdown(false);
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
    setShowAccountDropdown(false);
    navigate("/");
    toast.success("Successfully logged out from SportZone! ⚡");
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.info("Please log in to view your cart!");
      navigate("/login");
    }
  };

  const userDisplayName = user?.name || user?.username || "Athlete";
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const RunnerIcon = () => (
    <div className="sz-logo-runner-container me-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#sz-runner-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sz-logo-runner"
      >
        <defs>
          <linearGradient id="sz-runner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        
        {/* Animated dynamic speed lines */}
        <line x1="2" y1="8" x2="6" y2="8" className="sz-runner-trail sz-trail-1" strokeWidth="1.5" />
        <line x1="1" y1="12" x2="5" y2="12" className="sz-runner-trail sz-trail-2" strokeWidth="1.5" />
        <line x1="3" y1="16" x2="7" y2="16" className="sz-runner-trail sz-trail-3" strokeWidth="1.5" />

        {/* Athlete runner shape */}
        <circle cx="16" cy="5" r="2.2" fill="url(#sz-runner-gradient)" stroke="none" />
        <path d="M8 20h2l3.5-6.5 3.5-3-1-3-4 1-3.5 4.5-2.5-1" />
        <path d="M12.5 11l1.5 3.5 3.5 4" />
        <path d="M9.5 14.5l-3.5 4.5h-2.5" />
      </svg>
    </div>
  );

  return (
    <>
      <header className="sz-header sticky-top">
        <div className="container-fluid container-xl h-100 px-3 px-md-4">
          <nav className="d-flex align-items-center justify-content-between h-100 w-100">
            
            {/* LEFT: Mobile Toggle & Logo */}
            <div className="d-flex align-items-center sz-brand-wrapper">
              <button
                className="d-lg-none border-0 bg-transparent text-white p-0 me-3 sz-menu-toggle"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open Menu"
              >
                <FiMenu size={24} />
              </button>
              
              <Link to="/" className="sz-logo-link d-flex align-items-center text-decoration-none">
                <RunnerIcon />
                <Logo fontSize="1.45rem" />
              </Link>
            </div>

            {/* MIDDLE-LEFT: Desktop Nav Links */}
            <div className="d-none d-xl-flex align-items-center sz-desktop-nav gap-3 ms-4">
              <Link to="/shop" className={`sz-nav-item ${location.pathname === "/shop" ? "active" : ""}`}>
                Shop
              </Link>
              <Link to="/shop?badge=new" className="sz-nav-item">
                New Arrivals
              </Link>
              <Link to="/shop?badge=trending" className="sz-nav-item">
                Best Sellers
              </Link>
              <Link to="/help" className={`sz-nav-item ${location.pathname === "/help" ? "active" : ""}`}>
                Support
              </Link>
            </div>

            {/* CENTER: Expandable Search Bar */}
            <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4 position-relative" ref={searchWrapperRef}>
              <form onSubmit={handleSearchSubmit} className="sz-search-form d-flex align-items-center">
                <div className="sz-search-icon-wrap ps-3 text-muted d-flex align-items-center">
                  <FiSearch size={18} />
                </div>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none px-2 sz-search-input"
                  placeholder="Search sports gear, shoes, apparel..."
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
                <button type="submit" className="sz-search-btn btn text-white d-flex align-items-center justify-content-center">
                  <FiSearch size={18} />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() && (
                <div className="sz-search-suggestions shadow-lg show">
                  {searchLoading && (
                    <div className="sz-suggestion-loading p-3 text-muted text-center">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Searching products...
                    </div>
                  )}
                  {!searchLoading && suggestions.length === 0 && (
                    <div className="sz-suggestion-no-results p-3 text-muted text-center fw-medium">
                      No products found for "{searchQuery}"
                    </div>
                  )}
                  {!searchLoading && suggestions.length > 0 && (
                    <div className="sz-suggestion-list py-2">
                      <div className="sz-suggestion-header px-3 pb-2 text-muted fw-bold text-uppercase">Suggested Products</div>
                      {suggestions.map((item, index) => (
                        <div
                          key={item.id}
                          className={`sz-suggestion-item px-3 py-2 d-flex align-items-center gap-3 ${index === activeSuggestionIndex ? "active" : ""}`}
                          onClick={() => {
                            navigate(`/product/${item.id}`);
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                        >
                          <img src={mediaUrl(item.image) || "/no-image.png"} alt={item.name} className="sz-suggestion-img" />
                          <div className="sz-suggestion-details d-flex flex-column text-start">
                            <span className="sz-suggestion-name text-truncate fw-semibold">{item.name}</span>
                            {item.category && (
                              <span className="sz-suggestion-category-name text-muted small">
                                in {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                              </span>
                            )}
                          </div>
                          <FiChevronRight className="ms-auto sz-suggestion-arrow" size={16} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: User Menu, Wishlist & Cart Actions */}
            <div className="sz-nav-actions d-flex align-items-center" style={{ gap: "28px" }}>
              
              {/* Account Dropdown Trigger */}
              <div 
                className="position-relative" 
                ref={accountWrapperRef}
                onMouseEnter={() => setShowAccountDropdown(true)}
                onMouseLeave={() => setShowAccountDropdown(false)}
              >
                {isAuthenticated ? (
                  <button 
                    type="button" 
                    className="sz-action-link bg-transparent border-0 d-flex flex-column align-items-center text-white"
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  >
                    <div className="sz-user-avatar-badge">
                      {userInitial}
                    </div>
                    <span className="sz-action-label text-now-wrap mt-1">You</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="sz-action-link bg-transparent border-0 d-flex flex-column align-items-center text-white"
                    onClick={() => navigate("/login")}
                  >
                    <FiUser size={22} className="sz-action-icon" />
                    <span className="sz-action-label text-now-wrap mt-1">Login</span>
                  </button>
                )}

                {/* Dropdown Card */}
                {showAccountDropdown && isAuthenticated && (
                  <div className="sz-account-dropdown shadow-lg p-2">
                    <div className="sz-dropdown-header px-3 py-3 text-start border-bottom border-light mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="sz-dropdown-avatar">{userInitial}</div>
                        <div className="sz-dropdown-user-info text-truncate">
                          <span className="d-block fw-bold text-dark text-truncate lh-sm">{userDisplayName}</span>
                          <span className="d-block text-muted small text-truncate mt-0.5">{user?.email}</span>
                        </div>
                      </div>
                      <div className="sz-athlete-badge mt-2.5 d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill">
                        <span>🏆</span> <span className="fw-bold text-uppercase">Elite Athlete</span>
                      </div>
                    </div>
                    
                    <div className="d-flex flex-column text-start">
                      {/* Grid for Quick Shortcuts */}
                      <div className="sz-dropdown-grid p-1 mb-2">
                        <Link to="/orders" className="sz-dropdown-grid-card text-decoration-none" onClick={() => setShowAccountDropdown(false)}>
                          <FiPackage size={18} />
                          <span>Orders</span>
                        </Link>
                        <Link to="/wishlist" className="sz-dropdown-grid-card text-decoration-none" onClick={() => setShowAccountDropdown(false)}>
                          <FiHeart size={18} />
                          <span>Wishlist</span>
                        </Link>
                        <Link to="#" className="sz-dropdown-grid-card text-decoration-none" onClick={(e) => { e.preventDefault(); toast.info("Your Coupons are active at checkout! ⚡"); setShowAccountDropdown(false); }}>
                          <FiPercent size={18} />
                          <span>Coupons</span>
                        </Link>
                        <Link to="/help" className="sz-dropdown-grid-card text-decoration-none" onClick={() => setShowAccountDropdown(false)}>
                          <FiHelpCircle size={18} />
                          <span>Support</span>
                        </Link>
                      </div>

                      {user?.is_staff && (
                        <>
                          <div className="dropdown-divider my-1 border-light" />
                          <Link to="/admin" className="sz-dropdown-action-btn admin d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none mb-1 mx-1" onClick={() => setShowAccountDropdown(false)}>
                            <FiUserCheck size={16} />
                            <span className="fw-bold">Admin Panel</span>
                          </Link>
                        </>
                      )}
                      
                      <div className="dropdown-divider my-1 border-light" />
                      <button onClick={handleLogout} className="sz-dropdown-action-btn signout d-flex align-items-center gap-2 px-3 py-2 rounded text-danger bg-transparent border-0 w-100 text-start mx-1 mb-1">
                        <FiLogOut size={16} />
                        <span className="fw-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist Link */}
              <Link to="/wishlist" className="sz-action-link d-flex flex-column align-items-center text-white text-decoration-none">
                <FiHeart size={22} className="sz-action-icon" />
                <span className="sz-action-label text-now-wrap mt-1">Wishlist</span>
              </Link>

              {/* Cart Link with Badge */}
              <Link to="/cart" className="sz-action-link d-flex flex-column align-items-center text-white text-decoration-none position-relative" onClick={handleCartClick}>
                <div className="position-relative d-inline-flex">
                  <FiShoppingBag size={22} className="sz-action-icon" />
                  {cartItemCount > 0 && (
                    <span className={`sz-cart-badge d-flex align-items-center justify-content-center ${animateCart ? 'pop' : ''}`}>
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </div>
                <span className="sz-action-label text-now-wrap mt-1">Cart</span>
              </Link>

            </div>

          </nav>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div 
        className={`sz-drawer-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      <div className={`sz-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="sz-drawer-header d-flex align-items-center justify-content-between p-3 border-bottom border-light">
          <Link to="/" className="sz-logo-link d-flex align-items-center text-decoration-none" onClick={() => setIsMenuOpen(false)}>
            <RunnerIcon />
            <Logo fontSize="1.35rem" />
          </Link>
          <button 
            className="sz-drawer-close-btn bg-transparent border-0 text-dark p-0"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close Menu"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="sz-drawer-body p-3">
          {/* Mobile Search */}
          <div className="sz-drawer-search-wrapper mb-4" ref={mobileSearchWrapperRef}>
            <form onSubmit={handleSearchSubmit} className="sz-drawer-search-box d-flex align-items-center w-100 ps-2">
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none px-2 sz-search-input"
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
                <FiSearch size={18} />
              </button>
            </form>

            {showSuggestions && searchQuery.trim() && (
              <div className="sz-drawer-search-suggestions shadow-lg show w-100">
                {searchLoading && <div className="sz-suggestion-loading p-3 text-muted text-center">Searching...</div>}
                {!searchLoading && suggestions.length === 0 && (
                  <div className="sz-suggestion-no-results p-3 text-muted text-center">No products found</div>
                )}
                {!searchLoading && suggestions.length > 0 && (
                  <div className="sz-suggestion-list py-1">
                    {suggestions.map((item, index) => (
                      <div
                        key={item.id}
                        className={`sz-suggestion-item px-3 py-2 d-flex align-items-center gap-3 ${index === activeSuggestionIndex ? "active" : ""}`}
                        onClick={() => {
                          navigate(`/product/${item.id}`);
                          setShowSuggestions(false);
                          setSearchQuery("");
                          setIsMenuOpen(false);
                        }}
                      >
                        <img src={mediaUrl(item.image) || "/no-image.png"} alt={item.name} className="sz-suggestion-img" />
                        <div className="sz-suggestion-details text-start">
                          <span className="sz-suggestion-name text-truncate d-block fw-semibold">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Menu Items */}
          <div className="d-flex flex-column gap-2 text-start px-2">
            <Link to="/shop" className="sz-drawer-link py-2.5 fs-6 text-dark text-decoration-none fw-bold" onClick={() => setIsMenuOpen(false)}>
              Shop All Products
            </Link>
            <Link to="/wishlist" className="sz-drawer-link py-2.5 fs-6 text-dark text-decoration-none fw-bold" onClick={() => setIsMenuOpen(false)}>
              My Wishlist
            </Link>
            <Link to="/orders" className="sz-drawer-link py-2.5 fs-6 text-dark text-decoration-none fw-bold" onClick={() => setIsMenuOpen(false)}>
              Track Orders
            </Link>
            <Link to="/help" className="sz-drawer-link py-2.5 fs-6 text-dark text-decoration-none fw-bold" onClick={() => setIsMenuOpen(false)}>
              Support & Help
            </Link>
            {isAuthenticated && (
              <>
                <div className="dropdown-divider my-2" />
                <button 
                  onClick={handleLogout} 
                  className="sz-drawer-link py-2.5 fs-6 text-danger text-decoration-none fw-bold bg-transparent border-0 w-100 text-start p-0 mt-2"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;  
