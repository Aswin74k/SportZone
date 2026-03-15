import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import CartIcon from "./CartIcon";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

function Navbar() {
  const [search, setSearch] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg main-navbar">
        <div className="container-fluid navbar-inner px-3">
          <Link className="navbar-brand fw-bold" to="/">
            Sport<span>Zone</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-3">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Shop
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#categories">
                  Categories
                </a>
              </li>
            </ul>

            <form className="d-flex ms-auto me-3 search-box" onSubmit={handleSearch}>
              <div className="position-relative w-100">
                <input
                  className="form-control pe-5"
                  type="search"
                  placeholder="Search sports products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <CiSearch
                  onClick={handleSearch}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                />
              </div>
            </form>

            <div className="navbar-actions">
              <CartIcon />
              <button
                type="button"
                className="btn btn-outline-dark login-btn"
                onClick={openLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal
        open={showLogin}
        onClose={closeModals}
        onOpenSignup={openSignup}
      />
      <SignupModal
        open={showSignup}
        onClose={closeModals}
        onOpenLogin={openLogin}
      />
    </>
  );
}

export default Navbar;