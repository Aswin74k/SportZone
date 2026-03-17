import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBars } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";

import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal"; // 🔥 NEW

const Navbar = () => {
  const { cartItemCount } = useCart();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgot, setShowForgot] = useState(false); // 🔥 NEW
  const [showLogout, setShowLogout] = useState(false);

  // 🔥 GET USER FROM TOKEN
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowLogout(false);
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top custom-navbar">
        <div className="container">
          
          {/* LOGO */}
          <Link className="navbar-brand fw-bold text-primary logo-text" to="/">
            SportZone
          </Link>

          {/* TOGGLE */}
          <button
            className="navbar-toggler border-0"
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

              {/* 🔍 SEARCH */}
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

              {/* 🛒 CART */}
              <Link to="/cart" className="position-relative text-dark cart-icon-link">
                <FaShoppingCart size={22} className="hover-lift" />
                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* 👤 USER / LOGIN */}
              {user ? (
                <>
                  <span className="fw-bold text-dark">
                    Hi, {user} 👋
                  </span>

                  <button
                    className="btn btn-outline-danger rounded-pill px-3"
                    onClick={() => setShowLogout(true)}
                  >
                    Logout
                  </button>
                </>
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

      {/* LOGIN MODAL */}
      <LoginModal
        show={showLogin}
        handleClose={() => setShowLogin(false)}
        openSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
        openForgot={() => {   // 🔥 NEW
          setShowLogin(false);
          setShowForgot(true);
        }}
      />

      {/* SIGNUP MODAL */}
      <SignupModal
        show={showSignup}
        handleClose={() => setShowSignup(false)}
        openLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />

      {/* 🔥 FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        show={showForgot}
        handleClose={() => setShowForgot(false)}
      />

      {/* 🔥 LOGOUT MODAL */}
      {showLogout && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 p-4 text-center shadow">

              <h5 className="fw-bold mb-3">Logout?</h5>
              <p className="text-muted">Are you sure you want to logout?</p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowLogout(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger rounded-pill px-4"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;