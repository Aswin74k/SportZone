import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBars, FaBox, FaSignOutAlt } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "./Navbar.css";

import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import LogoutModal from "./LogoutModal"; // ✅ use this

const Navbar = () => {
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // 🔥 USER LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.username);
      } catch {
        setUser(null);
      }
    }

    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener("openLoginModal", handleOpenLogin);

    return () => window.removeEventListener("openLoginModal", handleOpenLogin);
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

              {/* USER */}
              {user ? (
                <div className="dropdown ms-2">
                  <div
                    className="d-flex align-items-center gap-2 dropdown-toggle hover-lift"
                    data-bs-toggle="dropdown"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {user.charAt(0).toUpperCase()}
                    </div>

                    <span className="fw-semibold text-dark d-none d-md-block">
                      Hi, {user}
                    </span>
                  </div>

                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 rounded-4">
                    <li>
                      <button className="dropdown-item py-2 fw-medium d-flex align-items-center">
                        <FaBox className="me-2 text-primary" /> My Orders
                      </button>
                    </li>

                    <li><hr className="dropdown-divider" /></li>

                    <li>
                      <button
                        className="dropdown-item py-2 text-danger fw-medium d-flex align-items-center"
                        onClick={() => setShowLogout(true)}
                      >
                        <FaSignOutAlt className="me-2" /> Logout
                      </button>
                    </li>
                  </ul>
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

      {/* ✅ CLEAN LOGOUT MODAL */}
      <LogoutModal
        show={showLogout}
        handleClose={() => setShowLogout(false)}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;