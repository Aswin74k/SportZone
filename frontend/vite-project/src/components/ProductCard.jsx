import React, { useState } from 'react';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { useCart } from "../context/CartContext"; // 🔥 ADD THIS
import './ProductCard.css';

const ProductCard = ({ product }) => {

  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart(); // 🔥 USE CONTEXT

  if (!product) return null;

  const categoryLabel = product.categoryLabel || product.category;
  const rawImage = product.image;
  const imageSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `http://127.0.0.1:8000${rawImage}`
    : "/no-image.png";

  const handleAddToCart = async () => {
    try {
      setLoading(true);

      await addToCart(product.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">

      <div className="product-image-container bg-light position-relative">

        <span className="badge bg-white text-primary position-absolute top-0 start-0 m-3 shadow-sm rounded-pill fw-bold">
          {categoryLabel}
        </span>

        <img 
          src={imageSrc}
          alt={product.name || "Product"}
          className="card-img-top product-image p-4"
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />

        <div className="product-overlay d-flex align-items-center justify-content-center">
          <button 
            className="btn btn-light rounded-circle shadow-lg"
            onClick={handleAddToCart}
            disabled={loading}
          >
            <FaShoppingCart className="text-primary" />
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
          {product.description || ""}
        </p>
        
        <div className="d-flex justify-content-between align-items-center">

          <span className="fw-bold text-primary">
            ₹{Number(product.price || 0).toFixed(2)}
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