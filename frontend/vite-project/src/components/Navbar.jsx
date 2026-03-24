import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBars, FaUserCircle } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "./Navbar.css";
import SearchBar from "./SearchBar";

import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

const Navbar = () => {
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // 🔥 LOAD USER FROM TOKEN
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("access");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded.name || "User");
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("loginSuccess", loadUser);

    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener("openLoginModal", handleOpenLogin);

    return () => {
      window.removeEventListener("loginSuccess", loadUser);
      window.removeEventListener("openLoginModal", handleOpenLogin);
    };
  }, []);

  // 🔥 CART PROTECTION
  const handleCartClick = (e) => {
    if (!localStorage.getItem("access")) {
      e.preventDefault();
      toast.info("Please login first");
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

            {/* NAV LINKS (LEFT) */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-medium">
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

            {/* CENTER SEARCH */}
            <div className="mx-auto d-none d-lg-block" style={{ width: '400px' }}>
              <SearchBar />
            </div>

            {/* MOBILE SEARCH */}
            <div className="d-block d-lg-none mt-3 mb-3">
              <SearchBar />
            </div>

            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center justify-content-start gap-4 mt-2 mt-lg-0 ms-lg-auto">
              {/* CART */}
              <Link
                to="/cart"
                className="position-relative text-dark cart-icon-link hover-lift"
                onClick={handleCartClick}
              >
                <FaShoppingCart size={22} />

                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary shadow-sm" style={{ fontSize: '0.7rem' }}>
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* YOU / LOGIN */}
              {user ? (
                <button
                  type="button"
                  className="you-btn hover-lift"
                  onClick={() => navigate("/profile")}
                >
                  <FaUserCircle size={20} />
                  <span>You</span>
                </button>
              ) : (
                <button
                  className="btn btn-primary rounded-pill px-4 hover-shadow"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 🔥 MODALS */}
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
    </>
  );
};

export default Navbar;