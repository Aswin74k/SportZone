import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light pt-5 pb-3">
      <div className="container">
        <div className="row gy-4 mb-5">
          <div className="col-lg-4 col-md-6 pe-lg-5">
            <Link to="/" className="text-decoration-none d-inline-block mb-3 hover-lift transition-all">
              <h3 className="text-primary fw-bold mb-0 logo-text">SportZone</h3>
            </Link>
            <p className="text-light opacity-75 small mb-4 pe-lg-4 lh-lg fw-medium">
              Premium sports equipment for every athlete. We provide the highest quality gear to help you perform your best.
            </p>
            <div className="d-flex gap-3 social-icons">
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white hover-lift transition-all" style={{ transition: "all 0.3s ease" }}>
                <FaFacebook />
              </a>
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white hover-lift transition-all" style={{ transition: "all 0.3s ease" }}>
                <FaTwitter />
              </a>
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white hover-lift transition-all" style={{ transition: "all 0.3s ease" }}>
                <FaInstagram />
              </a>
              <a href="#" className="social-icon rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white hover-lift transition-all" style={{ transition: "all 0.3s ease" }}>
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="text-white fw-bold mb-4 position-relative footer-heading">Categories</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/shop?category=football" style={{ transition: "all 0.3s ease" }}>Football</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/shop?category=cricket" style={{ transition: "all 0.3s ease" }}>Cricket</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/shop?category=basketball" style={{ transition: "all 0.3s ease" }}>Basketball</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/shop?category=badminton" style={{ transition: "all 0.3s ease" }}>Badminton</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/shop?category=shoes" style={{ transition: "all 0.3s ease" }}>Sports Shoes</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="text-white fw-bold mb-4 position-relative footer-heading">Useful Links</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/" style={{ transition: "all 0.3s ease" }}>Home</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/shop" style={{ transition: "all 0.3s ease" }}>Shop</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="/cart" style={{ transition: "all 0.3s ease" }}>Cart</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="#" style={{ transition: "all 0.3s ease" }}>About Us</Link></li>
              <li className="mb-3"><Link className="text-light opacity-75 text-decoration-none hover-lift transition-all d-inline-block fw-medium" to="#" style={{ transition: "all 0.3s ease" }}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h5 className="text-white fw-bold mb-4 position-relative footer-heading">Contact Us</h5>
            <ul className="list-unstyled contact-info mb-4">
              <li className="d-flex mb-3 align-items-start">
                <FaMapMarkerAlt className="text-primary mt-1 me-3 fs-5" />
                <span className="text-light opacity-75 small lh-base fw-medium">123 Sports Avenue, Athletic City, AC 90210, United States</span>
              </li>
              <li className="d-flex mb-3 align-items-center">
                <FaPhone className="text-primary me-3 fs-5" />
                <span className="text-light opacity-75 small fw-medium">+91 </span>
              </li>
              <li className="d-flex mb-3 align-items-center">
                <FaEnvelope className="text-primary me-3 fs-5" />
                <span className="text-light opacity-75 small fw-medium">support@sportzone.com</span>
              </li>
            </ul>
            <form className="newsletter-form mt-4">
              <div className="input-group p-1 bg-white bg-opacity-10 rounded-pill border border-secondary border-opacity-50 transition-all shadow-sm">
                <input type="email" className="form-control bg-transparent text-light border-0 shadow-none px-3 fw-medium" placeholder="Email address" />
                <button className="btn btn-primary rounded-pill px-4 fw-medium hover-shadow transition-all" type="button" style={{ transition: "all 0.3s ease" }}>Subscribe</button>
              </div>
            </form>
          </div>
        </div>
        
        <hr className="bg-light opacity-25 my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-light opacity-75 small mb-0 fw-medium">&copy; {new Date().getFullYear()} SportZone. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end payment-icons">
            <span className="badge bg-white bg-opacity-10 text-light opacity-75 me-2 py-2 px-3 fw-bold rounded-1 border border-light border-opacity-25 transition-all hover-lift" style={{ transition: "all 0.3s ease" }}>VISA</span>
            <span className="badge bg-white bg-opacity-10 text-light opacity-75 me-2 py-2 px-3 fw-bold rounded-1 border border-light border-opacity-25 transition-all hover-lift" style={{ transition: "all 0.3s ease" }}>MasterCard</span>
            <span className="badge bg-white bg-opacity-10 text-light opacity-75 py-2 px-3 fw-bold rounded-1 border border-light border-opacity-25 transition-all hover-lift" style={{ transition: "all 0.3s ease" }}>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;