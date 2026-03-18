import React from 'react';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.info("Please login first");
    window.dispatchEvent(new Event("openLoginModal"));
    return;
  }

  addToCart(product);
};

  return (
    <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden transition-all" style={{ transition: "all 0.3s ease-in-out" }}>
      <div className="product-image-container bg-light position-relative transition-all">
        <span className="badge bg-white text-primary position-absolute top-0 start-0 m-3 shadow-sm rounded-pill fw-bold z-1 transition-all">
          {product.category}
        </span>

        <img 
          src={product.image} 
          className="card-img-top product-image p-4 transition-all" 
          alt={product.name} 
        />

        <div className="product-overlay d-flex align-items-center justify-content-center transition-all">
          <button 
            className="btn btn-light rounded-circle shadow-lg btn-icon add-to-cart-btn hover-lift transition-all"
            onClick={handleAddToCart}
            title="Add to Cart"
            style={{ transition: "all 0.3s ease" }}
          >
            <FaShoppingCart className="text-primary" />
          </button>
        </div>
      </div>
      
      <div className="card-body d-flex flex-column p-4 transition-all">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold text-dark mb-0 text-truncate transition-all" style={{ maxWidth: "80%" }}>
            {product.name}
          </h5>

          <div className="d-flex align-items-center text-warning small transition-all">
            <FaStar />
            <span className="ms-1 text-muted">4.8</span>
          </div>
        </div>
        
        <p className="card-text text-muted small mb-3 flex-grow-1 transition-all">
          {product.description || "Premium quality sports gear for professionals."}
        </p>
        
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="fs-5 fw-bolder text-primary transition-all">
            ₹{Number(product.price).toFixed(2)}
          </span>

          <button 
            className="btn btn-primary rounded-pill px-4 py-2 hover-lift fw-medium shadow-sm d-md-none d-lg-block transition-all"
            onClick={handleAddToCart}
            style={{ transition: "all 0.3s ease" }}
          >
            Add to Cart
          </button>
          
          <button 
            className="btn btn-primary rounded-circle p-2 hover-lift shadow-sm d-none d-md-block d-lg-none transition-all"
            onClick={handleAddToCart}
            style={{ transition: "all 0.3s ease" }}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;