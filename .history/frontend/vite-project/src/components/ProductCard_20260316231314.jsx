import React from 'react';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="card h-100 product-card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="product-image-container bg-light position-relative">
        <span className="badge bg-white text-primary position-absolute top-0 start-0 m-3 shadow-sm rounded-pill fw-bold z-1">
          {product.category}
        </span>
        <img 
          src={product.image} 
          className="card-img-top product-image p-4" 
          alt={product.name} 
        />
        <div className="product-overlay d-flex align-items-center justify-content-center">
          <button 
            className="btn btn-light rounded-circle shadow-lg btn-icon add-to-cart-btn"
            onClick={() => addToCart(product)}
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
    ${Number(product.price).toFixed(2)}
  </span>

  <button 
    className="btn btn-primary rounded-pill px-4 py-2 hover-lift fw-medium shadow-sm d-md-none d-lg-block"
    onClick={() => addToCart(product)}
  >
    Add to Cart
  </button>
  
  <button 
    className="btn btn-primary rounded-circle p-2 hover-lift shadow-sm d-none d-md-block d-lg-none"
    onClick={() => addToCart(product)}
  >
    <FaShoppingCart />
  </button>
</div>
      </div>
    </div>
  );
};

export default ProductCard;