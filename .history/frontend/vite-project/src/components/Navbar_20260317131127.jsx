import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBars } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Navbar = () => {
const { cartItemCount } = useCart();
const navigate = useNavigate();

const [search, setSearch] = useState("");
const [user, setUser] = useState(null);

const [isMenuOpen, setIsMenuOpen] = useState(false);
const [showLogin, setShowLogin] = useState(false);
const [showSignup, setShowSignup] = useState(false);
const [showLogout, setShowLogout] = useState(false);

useEffect(() => {
const token = localStorage.getItem("token");

```
if (token) {
  try {
    const decoded = jwtDecode(token);
    setUser(decoded.username || decoded.user_id || "User");
  } catch {
    setUser(null);
  }
}
```

}, []);

const handleLogout = () => {
localStorage.removeItem("token");
setShowLogout(false);
window.location.reload();
};

return (
<> <nav className="navbar navbar-expand-lg sticky-top custom-navbar"> <div className="container">


      <Link className="navbar-brand fw-bold text-primary logo-text" to="/">
        SportZone
      </Link>

      <button
        className="navbar-toggler border-0"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FaBars />
      </button>

      <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>

        <ul className="navbar-nav mx-auto">
          <li className="nav-item">
            <NavLink to="/" className="nav-link">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/shop" className="nav-link">Shop</NavLink>
          </li>
        </ul>

        <div className="d-flex align-items-center gap-3">

          {/* 🔍 SEARCH */}
          <div className="search-box d-none d-md-flex">
            <FaSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/shop?search=${search}`);
                }
              }}
              placeholder="Search..."
            />
          </div>

          {/* 🛒 CART */}
          <Link to="/cart" className="position-relative">
            <FaShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="badge bg-primary position-absolute top-0 start-100 translate-middle">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* 👤 USER */}
          {user ? (
            <>
              <span className="fw-bold">
                Hi, {user} 👋
              </span>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setShowLogout(true)}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}

        </div>
      </div>
    </div>
  </nav>

  {/* LOGIN */}
  <LoginModal
    show={showLogin}
    handleClose={() => setShowLogin(false)}
    openSignup={() => {
      setShowLogin(false);
      setShowSignup(true);
    }}
  />

  {/* SIGNUP */}
  <SignupModal
    show={showSignup}
    handleClose={() => setShowSignup(false)}
    openLogin={() => {
      setShowSignup(false);
      setShowLogin(true);
    }}
  />

  {/* 🔥 LOGOUT MODAL */}
  {showLogout && (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 text-center">

          <h5 className="fw-bold mb-3">Logout?</h5>
          <p className="text-muted">Are you sure you want to logout?</p>

          <div className="d-flex justify-content-center gap-3 mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => setShowLogout(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-danger"
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
