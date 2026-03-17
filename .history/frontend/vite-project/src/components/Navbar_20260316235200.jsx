import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaSearch, FaBars } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import "./Navbar.css";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const Navbar = () => {
const { cartItemCount } = useCart();

const navigate = useNavigate();
const [search, setSearch] = useState("");

const [isMenuOpen, setIsMenuOpen] = useState(false);
const [showLogin, setShowLogin] = useState(false);
const [showSignup, setShowSignup] = useState(false);

const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

const openLogin = () => {
setShowSignup(false);
setShowLogin(true);
};

const openSignup = () => {
setShowLogin(false);
setShowSignup(true);
};

const handleSearch = (e) => {
if (e.key === "Enter" && search.trim() !== "") {
navigate(`/shop?search=${search}`);
setSearch("");
}
};

return (
<> <nav className="navbar navbar-expand-lg sticky-top custom-navbar"> <div className="container">

```
      <Link className="navbar-brand fw-bold text-primary logo-text" to="/">
        SportZone
      </Link>

      <button
        className="navbar-toggler border-0"
        type="button"
        onClick={toggleMenu}
      >
        <FaBars className="text-dark" />
      </button>

      <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>

        <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">

          <li className="nav-item px-2">
            <NavLink
              className="nav-link nav-hover"
              to="/"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>

          <li className="nav-item px-2">
            <NavLink
              className="nav-link nav-hover"
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </NavLink>
          </li>

          <li className="nav-item px-2">
            <NavLink
              className="nav-link nav-hover"
              to="/shop?category=all"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </NavLink>
          </li>

        </ul>

        <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">

          <div className="search-box d-none d-md-flex align-items-center bg-light rounded-pill px-3 py-1">

            <FaSearch className="text-muted" />

            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />

          </div>

          <Link
            to="/cart"
            className="position-relative text-dark cart-icon-link"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaShoppingCart size={22} className="hover-lift" />

            {cartItemCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                {cartItemCount}
              </span>
            )}

          </Link>

          <button
            className="btn btn-primary rounded-pill px-4 ms-2 d-none d-lg-block fw-medium"
            onClick={openLogin}
          >
            Login
          </button>

          <button
            className="btn btn-primary rounded-pill mt-3 w-100 d-lg-none fw-medium"
            onClick={() => {
              openLogin();
              setIsMenuOpen(false);
            }}
          >
            Login
          </button>

        </div>

      </div>
    </div>
  </nav>

  <LoginModal
    show={showLogin}
    handleClose={() => setShowLogin(false)}
    openSignup={openSignup}
  />

  <SignupModal
    show={showSignup}
    handleClose={() => setShowSignup(false)}
    openLogin={openLogin}
  />
</>


);
};

export default Navbar;
