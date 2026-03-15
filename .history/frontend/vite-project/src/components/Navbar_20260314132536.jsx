import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";

function Navbar() {

  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);

    // ivide backend API call cheyyam
    // example:
    // fetch(`http://127.0.0.1:8000/products/?search=${search}`)
  };

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
        <form className="d-flex mx-auto search-box" onSubmit={handleSearch}>

          <div className="position-relative">

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
                fontSize: "22px",
                cursor: "pointer",
                color: "black"
              }}
            />

          </div>

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