import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import API from "../api";
import { mediaUrl } from "../utils/mediaUrl";
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
  FiLogOut 
} from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems, fetchCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

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
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const LogoIcon = () => (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sz-logo-athlete me-2.5"
    >
      <circle cx="15" cy="4" r="2" fill="#2563EB" stroke="none" />
      <path d="M7 20h2l3-6 4-3-1-3-4 1-3 4-2-1" />
      <path d="M12 11l1 3 3 4" />
      <path d="M9 14l-3 4h-2" />
    </svg>
  );

  return (
    <>
      <header className="sz-header sticky-top">
        <div className="container-fluid container-xl h-100 px-3 px-md-4">
          <nav className="d-flex align-items-center justify-content-between h-100 w-100">
            
            {/* LEFT: Logo & Mobile Toggle */}
            <div className="d-flex align-items-center sz-brand-wrapper" style={{ width: "180px" }}>
              <button
                className="d-lg-none border-0 bg-transparent text-white p-0 me-3"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open Menu"
              >
                <FiMenu size={24} />
              </button>
              
              <Link to="/" className="sz-logo-link d-flex align-items-center text-decoration-none">
                <LogoIcon />
                <span className="sz-logo-text">
                  <span className="sz-logo-sport text-white">SPORT</span>
                  <span className="sz-logo-zone text-primary">ZONE</span>
                </span>
              </Link>
            </div>

            {/* CENTER: Search Bar */}
            <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4 position-relative" ref={searchWrapperRef}>
              <form onSubmit={handleSearchSubmit} className="sz-search-form d-flex align-items-center">
                <div className="sz-search-icon-wrap ps-3 text-muted d-flex align-items-center">
                  <FiSearch size={18} />
                </div>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none px-2 sz-search-input"
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
                <button type="submit" className="sz-search-btn btn text-white d-flex align-items-center justify-content-center">
                  <FiSearch size={18} />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() && (
                <div className="sz-search-suggestions shadow show">
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Actions */}
            <div className="sz-nav-actions d-flex align-items-center" style={{ gap: "32px" }}>
              
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
                    <FiUser size={22} className="sz-action-icon" />
                    <span className="sz-action-label text-now-wrap mt-1">You</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="sz-action-link bg-transparent border-0 d-flex flex-column align-items-center text-white"
                    onClick={() => navigate("/login")}
                  >
                    <FiUser size={22} className="sz-action-icon" />
                    <span className="sz-action-label text-now-wrap mt-1">You</span>
                  </button>
                )}

                {/* Dropdown Card */}
                {showAccountDropdown && isAuthenticated && (
                  <div className="sz-account-dropdown shadow p-2">
                    <div className="sz-dropdown-header px-3 py-2.5 text-start border-bottom border-light mb-1">
                      <span className="d-block fw-bold text-dark text-truncate">{user?.name || user?.username || "Athlete"}</span>
                      <span className="d-block text-muted small text-truncate">{user?.email}</span>
                    </div>
                    <div className="d-flex flex-column text-start">
                      <Link to="/profile" className="sz-dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded" onClick={() => setShowAccountDropdown(false)}>
                        <FiUser size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link to="/orders" className="sz-dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded" onClick={() => setShowAccountDropdown(false)}>
                        <FiPackage size={16} />
                        <span>Orders</span>
                      </Link>
                      <Link to="/wishlist" className="sz-dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded" onClick={() => setShowAccountDropdown(false)}>
                        <FiHeart size={16} />
                        <span>Wishlist</span>
                      </Link>
                      <Link to="#" className="sz-dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded" onClick={(e) => { e.preventDefault(); toast.info("Your Coupons are active at checkout! ⚡"); setShowAccountDropdown(false); }}>
                        <FiPercent size={16} />
                        <span>Coupons</span>
                      </Link>
                      <Link to="/help" className="sz-dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded" onClick={() => setShowAccountDropdown(false)}>
                        <FiHelpCircle size={16} />
                        <span>Support</span>
                      </Link>
                      <hr className="my-1 text-muted opacity-10" />
                      <button onClick={handleLogout} className="sz-dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded text-danger bg-transparent border-0 w-100 text-start">
                        <FiLogOut size={16} />
                        <span>Logout</span>
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
            <LogoIcon />
            <span className="sz-logo-text">
              <span className="sz-logo-sport text-dark">SPORT</span>
              <span className="sz-logo-zone text-primary">ZONE</span>
            </span>
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
              <div className="sz-drawer-search-suggestions shadow-sm show w-100">
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
              <button 
                onClick={handleLogout} 
                className="sz-drawer-link py-2.5 fs-6 text-danger text-decoration-none fw-bold bg-transparent border-0 w-100 text-start p-0 mt-3"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
