import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-section position-relative">
      <div className="hero-overlay"></div>
      
      <div className="container h-100">
        <div className="row h-100 align-items-center">
          <div className="col-lg-8 col-md-10 text-white position-relative z-1 hero-content">
            <span className="badge bg-primary px-3 py-2 mb-3 rounded-pill text-uppercase tracking-wide animate-fade-in-up shadow-sm">
              New Collection 2026
            </span>
            <h1 className="display-3 fw-bolder mb-4 animate-fade-in-up delay-1 text-white">
              Gear Up For Your<br />
              <span className="text-primary text-glow">Next Game</span>
            </h1>
            <p className="lead fs-4 mb-5 text-light opacity-100 animate-fade-in-up delay-2 max-w-600 fw-medium">
              Premium sports equipment for every athlete. Unleash your potential with professional-grade gear.
            </p>
            <div className="d-flex gap-3 animate-fade-in-up delay-3">
              <Link to="/shop" className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold hero-btn hover-shadow hover-lift transition-all" style={{ transition: "all 0.3s ease" }}>
                Shop Now
              </Link>
              <Link to="/shop?category=new" className="btn btn-outline-light btn-lg rounded-pill px-5 py-3 fw-bold hero-btn-outline hover-shadow hover-lift transition-all" style={{ transition: "all 0.3s ease" }}>
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;