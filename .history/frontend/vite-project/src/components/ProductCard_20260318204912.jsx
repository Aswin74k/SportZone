import React, { useState } from 'react';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from "../api";
import './ProductCard.css';

const ProductCard = ({ product }) => {

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
    <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">

      <div className="product-image-container bg-light position-relative">

        <span className="badge bg-white text-primary position-absolute top-0 start-0 m-3 shadow-sm rounded-pill fw-bold">
          {product.category}
        </span>

        {/* ✅ FINAL FIXED IMAGE */}
        <img 
  src={product.image}
  alt={product.name}
  className="card-img-top product-image p-4"
  onError={(e) => {
    console.log("IMG ERROR:", product.image);
    e.target.src = "/no-image.png";
  }}
/>

        <div className="product-overlay d-flex align-items-center justify-content-center">
          <button 
            className="btn btn-light rounded-circle shadow-lg"
            onClick={handleAddToCart}
            disabled={loading}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-4">

        <div className="d-flex justify-content-between mb-2">
          <h5 className="fw-bold text-truncate">{product.name}</h5>
          <span className="text-warning">
            <FaStar /> 4.8
          </span>
        </div>

        <p className="text-muted small flex-grow-1">
          {product.description}
        </p>

        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-primary">
            ₹{product.price}
          </span>

          <button 
            className="btn btn-primary rounded-pill px-4"
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