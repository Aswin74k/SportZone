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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowLogout(false);
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
  const handleCartClick = (e) => {
    if (!user) {
        e.preventDefault();
        toast.info("Please login to access your cart");
        setShowLogin(true);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top custom-navbar shadow-sm transition-all">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary logo-text" to="/">
            SportZone
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaBars className="text-dark" />
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
              <li className="nav-item px-2">
                <NavLink className="nav-link nav-hover transition-all" to="/" onClick={() => setIsMenuOpen(false)}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item px-2">
                <NavLink className="nav-link nav-hover transition-all" to="/shop" onClick={() => setIsMenuOpen(false)}>
                  Shop
                </NavLink>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              <div className="search-box d-none d-md-flex align-items-center bg-light rounded-pill px-3 py-1 transition-all">
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

              <Link to="/cart" className="position-relative text-dark cart-icon-link transition-all" onClick={handleCartClick}>
                <FaShoppingCart size={22} className="hover-lift transition-all" />
                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary transition-all">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="dropdown ms-2">
                  <div 
                    className="d-flex align-items-center gap-2 dropdown-toggle hover-lift transition-all" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm transition-all" style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}>
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="fw-semibold text-dark d-none d-md-block">
                      Hi, {user}
                    </span>
                  </div>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 rounded-4 transition-all">
                    <li>
                      <button className="dropdown-item py-2 fw-medium d-flex align-items-center mb-1 transition-all">
                        <FaBox className="me-2 text-primary" /> My Orders
                      </button>
                    </li>
                    <li><hr className="dropdown-divider opacity-10 my-1" /></li>
                    <li>
                      <button 
                        className="dropdown-item py-2 text-danger fw-medium d-flex align-items-center transition-all"
                        onClick={() => setShowLogout(true)}
                      >
                        <FaSignOutAlt className="me-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  className="btn btn-primary rounded-pill px-4 fw-medium hover-shadow transition-all"
                  onClick={() => setShowLogin(true)}
                  style={{ transition: "all 0.3s ease" }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

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

      {showLogout && (
        <div className="modal d-block fade show transition-all" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered transition-all" style={{ transition: "transform 0.3s ease-out" }}>
            <div className="modal-content border-0 rounded-4 p-4 text-center shadow-lg transition-all">
              <h4 className="fw-bold mb-3 text-dark">Logout?</h4>
              <p className="text-muted fw-medium mb-4">Are you sure you want to logout?</p>
              <div className="d-flex justify-content-center gap-3">
                <button 
                  className="btn btn-secondary rounded-pill px-4 py-2 hover-shadow transition-all fw-bold" 
                  onClick={() => setShowLogout(false)}
                  style={{ transition: "all 0.3s ease" }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger rounded-pill px-4 py-2 hover-shadow transition-all fw-bold" 
                  onClick={handleLogout}
                  style={{ transition: "all 0.3s ease" }}
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