import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import API from "../api";
import "./SearchBar.css";

function SearchBar() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await API.get(`products/?search=${encodeURIComponent(trimmed)}`);
        const list = Array.isArray(res.data) ? res.data.slice(0, 5) : [];
        setSuggestions(list);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const submitSearch = (value) => {
    const text = (value || "").trim();
    if (!text) return;
    setShowSuggestions(false);
    navigate(`/shop?search=${encodeURIComponent(text)}`);
  };

  return (
    <div className="searchbar-wrapper" ref={wrapperRef}>
      <div className="searchbar-input-wrap">
        <input
          type="text"
          className="searchbar-input"
          placeholder="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitSearch(query);
            }
          }}
        />
        <button
          type="button"
          className="searchbar-btn"
          onClick={() => submitSearch(query)}
          aria-label="Search"
        >
          <FaSearch />
        </button>
      </div>

      {showSuggestions && (
        <div className="searchbar-suggestions">
          {loading && <div className="searchbar-item text-muted">Searching...</div>}
          {!loading && suggestions.length === 0 && (
            <div className="searchbar-item text-muted">No products found</div>
          )}
          {!loading &&
            suggestions.map((item) => (
              <button
                type="button"
                className="searchbar-item"
                key={item.id}
                onClick={() => submitSearch(item.name)}
              >
                {item.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

