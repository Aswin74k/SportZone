import React, { useState } from 'react';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from "../api";
import './ProductCard.css';

const BASE_URL = "http://127.0.0.1:8000"; // ✅ ADD THIS

const ProductCard = ({ product }) => {
  console.log("product data", product);
  

  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.info("Please login first");
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    try {
      setLoading(true);

      await API.post("cart/", {
        product: product.id,
        quantity: 1,
      });

      toast.success("Added to cart 🛒");

    } catch (err) {
      console.log(err);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden transition-all">

      <div className="product-image-container bg-light position-relative">

        <span className="badge bg-white text-primary position-absolute top-0 start-0 m-3 shadow-sm rounded-pill fw-bold z-1">
          {product.category}
        </span>

        {/* ✅ IMAGE FIX */}
        <img 
          src={`${BASE_URL}${product.image}`}
          onError={(e) => {
            console.log("IMG ERROR:", product.image);
            e.target.src = "https://via.placeholder.com/300";
          }}
          className="card-img-top product-image p-4"
          alt={product.name}
        />

        <div className="product-overlay d-flex align-items-center justify-content-center">
          <button 
            className="btn btn-light rounded-circle shadow-lg btn-icon add-to-cart-btn hover-lift"
            onClick={handleAddToCart}
            disabled={loading}
            title="Add to Cart"
          >
            <FaShoppingCart className="text-primary" />
          </button>
        </div>
      </div>
      
      <div className="card-body d-flex flex-column p-4">

        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "80%" }}>
            {product.name}
          </h5>

          <div className="d-flex align-items-center text-warning small">
            <FaStar />
            <span className="ms-1 text-muted">4.8</span>
          </div>
        </div>
        
        <p className="card-text text-muted small mb-3 flex-grow-1">
          {product.description || "Premium quality sports gear for professionals."}
        </p>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">

          <span className="fs-5 fw-bolder text-primary">
            ₹{Number(product.price).toFixed(2)}
          </span>

          <button 
            className="btn btn-primary rounded-pill px-4 py-2 fw-medium shadow-sm"
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;

