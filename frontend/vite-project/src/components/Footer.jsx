import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light pt-5 pb-3">
      <div className="container">
        <div className="row gy-4 mb-5">
          {/* Brand */}
          <div className="col-lg-4 col-md-6 pe-lg-5">
            <Link to="/" className="text-decoration-none d-inline-block mb-3">
              <h3 className="text-primary fw-bold mb-0 logo-text">SportZone</h3>
            </Link>
            <p className="text-muted small mb-4 pe-lg-4 lh-lg">
              Premium sports equipment for every athlete. We provide the highest quality gear to help you perform your best.
            </p>
            <div className="d-flex gap-3 social-icons">
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white transition-all">
                <FaFacebook />
              </a>
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white transition-all">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white transition-all">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white transition-all">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="text-white fw-bold mb-4 position-relative footer-heading">Categories</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-3"><Link to="/shop?category=football">Football</Link></li>
              <li className="mb-3"><Link to="/shop?category=cricket">Cricket</Link></li>
              <li className="mb-3"><Link to="/shop?category=basketball">Basketball</Link></li>
              <li className="mb-3"><Link to="/shop?category=badminton">Badminton</Link></li>
              <li className="mb-3"><Link to="/shop?category=shoes">Sports Shoes</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="text-white fw-bold mb-4 position-relative footer-heading">Useful Links</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-3"><Link to="/">Home</Link></li>
              <li className="mb-3"><Link to="/shop">Shop</Link></li>
              <li className="mb-3"><Link to="/cart">Cart</Link></li>
              <li className="mb-3"><Link to="#">About Us</Link></li>
              <li className="mb-3"><Link to="#">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white fw-bold mb-4 position-relative footer-heading">Contact Us</h5>
            <ul className="list-unstyled contact-info mb-4">
              <li className="d-flex mb-3 align-items-start">
                <FaMapMarkerAlt className="text-primary mt-1 me-3 fs-5" />
                <span className="text-muted small lh-base">123 Sports Avenue, Athletic City, AC 90210, United States</span>
              </li>
              <li className="d-flex mb-3 align-items-center">
                <FaPhone className="text-primary me-3 fs-5" />
                <span className="text-muted small">+1 (555) 123-4567</span>
              </li>
              <li className="d-flex mb-3 align-items-center">
                <FaEnvelope className="text-primary me-3 fs-5" />
                <span className="text-muted small">support@sportzone.com</span>
              </li>
            </ul>
            <form className="newsletter-form mt-4">
              <div className="input-group p-1 bg-white bg-opacity-10 rounded-pill border border-secondary border-opacity-50">
                <input type="email" className="form-control bg-transparent text-light border-0 shadow-none px-3" placeholder="Email address" />
                <button className="btn btn-primary rounded-pill px-4 fw-medium" type="button">Subscribe</button>
              </div>
            </form>
          </div>
        </div>
        
        <hr className="bg-secondary opacity-25 my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} SportZone. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end payment-icons">
            <span className="badge bg-white bg-opacity-10 text-muted me-2 py-2 px-3 fw-bold rounded-1 border border-secondary border-opacity-25">VISA</span>
            <span className="badge bg-white bg-opacity-10 text-muted me-2 py-2 px-3 fw-bold rounded-1 border border-secondary border-opacity-25">MasterCard</span>
            <span className="badge bg-white bg-opacity-10 text-muted py-2 px-3 fw-bold rounded-1 border border-secondary border-opacity-25">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;