import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      
      <Link className="navbar-brand fw-bold" to="/">
        SPORTZONE
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

        {/* Search Box */}
        <form className="d-flex mx-auto search-box">
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search sports products..."
          />
          <button className="btn btn-outline-light" type="submit">
            Search
          </button>
        </form>

        {/* Navigation Links */}
        <ul className="navbar-nav ms-auto">

          <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/cart">
              Cart
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/login">
              Login
            </Link>
          </li>

        </ul>

      </div>
    </nav>
  );
}

export default Navbar;