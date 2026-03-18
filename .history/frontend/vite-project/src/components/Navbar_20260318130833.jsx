import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBars } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "./Navbar.css";

import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import LogoutModal from "./LogoutModal";

const Navbar = () => {
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const dropdownRef = useRef();

  // 🔥 USER LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.name);
      } catch {
        setUser(null);
      }
    }

    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener("openLoginModal", handleOpenLogin);

    return () => window.removeEventListener("openLoginModal", handleOpenLogin);
  }, []);

  // 🔥 CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowLogout(false);
    toast.success("Logged out successfully");
    setTimeout(() => window.location.reload(), 500);
  };

  // 🔥 CART PROTECTION
  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      toast.info("Please login to access your cart");
      setShowLogin(true);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top custom-navbar shadow-sm">
        <div className="container">

          {/* LOGO */}
          <Link className="navbar-brand fw-bold text-primary logo-text" to="/">
            SportZone
          </Link>

          {/* TOGGLE */}
          <button
            className="navbar-toggler border-0 shadow-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaBars className="text-dark" />
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>

            {/* NAV LINKS */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
              <li className="nav-item px-2">
                <NavLink className="nav-link nav-hover" to="/" onClick={() => setIsMenuOpen(false)}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item px-2">
                <NavLink className="nav-link nav-hover" to="/shop" onClick={() => setIsMenuOpen(false)}>
                  Shop
                </NavLink>
              </li>
            </ul>

            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">

              {/* SEARCH */}
              <div className="search-box d-none d-md-flex align-items-center bg-light rounded-pill px-3 py-1">
                <FaSearch className="text-muted" />
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && search.trim()) {
                      navigate(`/shop?search=${search}`);
                      setSearch("");
                    }
                  }}
                />
              </div>

              {/* CART */}
              <Link
                to="/cart"
                className="position-relative text-dark cart-icon-link"
                onClick={handleCartClick}
              >
                <FaShoppingCart size={22} className="hover-lift" />
                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* 🔥 USER SECTION */}
              {user ? (
                <div className="position-relative" ref={dropdownRef}>

                  {/* NAME BUTTON */}
                  <div
                    className="px-3 py-2 rounded-pill"
                    style={{
                      cursor: "pointer",
                      background: "#f1f5f9",
                      transition: "0.3s"
                    }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="fw-semibold text-dark">
                      Hi, {user}
                    </span>
                  </div>

                  {/* DROPDOWN */}
                  {isUserMenuOpen && (
                    <div
                      className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg p-2"
                      style={{ minWidth: "140px", zIndex: 999 }}
                    >
                      <button
                        className="dropdown-item text-danger fw-medium rounded-3"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLogout(true);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <button
                  className="btn btn-primary rounded-pill px-4 fw-medium"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MODALS */}
      <LoginModal
        show={showLogin}
        handleClose={() => setShowLogin(false)}
        openSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
        openForgot={() => {
          setShowLogin(false);
          setShowForgot(true);
        }}
      />

      <SignupModal
        show={showSignup}
        handleClose={() => setShowSignup(false)}
        openLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />

      <ForgotPasswordModal
        show={showForgot}
        handleClose={() => setShowForgot(false)}
      />

      <LogoutModal
        show={showLogout}
        handleClose={() => setShowLogout(false)}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;