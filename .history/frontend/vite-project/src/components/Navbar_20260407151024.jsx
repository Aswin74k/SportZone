import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api";
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
  FaStar
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

  const cartItemCount = cartItems.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsMenuOpen(false);
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
        <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4">
          <form onSubmit={handleSearchSubmit} className="sz-search-box d-flex align-items-center w-100 ps-2">
            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none px-3 sz-search-input"
              placeholder="Search sports gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="border-0 sz-search-btn text-white d-flex align-items-center justify-content-center">
              <FaSearch size={18} />
            </button>
          </form>
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
        <div className="sz-mobile-search d-lg-none bg-white p-3 shadow-sm position-absolute w-100">
          <form onSubmit={handleSearchSubmit} className="sz-search-box d-flex align-items-center w-100 mb-3 mx-auto">
            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none px-3 sz-search-input"
              placeholder="Search sports gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="border-0 sz-search-btn text-white d-flex align-items-center justify-content-center">
              <FaSearch size={18} />
            </button>
          </form>
          
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