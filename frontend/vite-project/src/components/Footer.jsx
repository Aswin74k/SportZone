import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaArrowUp, 
  FaCcVisa,
  FaCcMastercard
} from "react-icons/fa";
import Logo from "./Logo";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }
    setStatus({ type: "success", message: "Successfully subscribed to newsletter!" });
    setEmail("");
    setTimeout(() => {
      setStatus({ type: "", message: "" });
    }, 3000);
  };

  return (
    <footer className="sz-footer position-relative">
      <div className="container-fluid container-xl py-5">
        <div className="row gy-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="text-decoration-none d-inline-block mb-3">
              <Logo fontSize="1.6rem" light={true} />
            </Link>
            <p className="sz-footer-text mb-4 pe-lg-4">
              Premium sports gear for every athlete. Train harder, play smarter — only at SportZone.
            </p>
            <div className="d-flex gap-2 sz-footer-social">
              <a href="#" className="sz-footer-social-link fb" aria-label="Facebook">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="sz-footer-social-link twitter" aria-label="Twitter">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="sz-footer-social-link instagram" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="sz-footer-social-link youtube" aria-label="Youtube">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="sz-footer-heading">Shop</h5>
            <ul className="list-unstyled sz-footer-links">
              <li><Link to="/shop?category=cricket">Cricket</Link></li>
              <li><Link to="/shop?category=football">Football</Link></li>
              <li><Link to="/shop?category=running">Running</Link></li>
              <li><Link to="/shop?category=basketball">Basketball</Link></li>
              <li><Link to="/shop">All products</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="sz-footer-heading">Account</h5>
            <ul className="list-unstyled sz-footer-links">
              <li><Link to="/orders">Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/help">Help</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h5 className="sz-footer-heading">Newsletter</h5>
            <p className="sz-footer-text mb-3">Subscribe to get special offers and once-in-a-lifetime deals.</p>
            <form className="sz-footer-newsletter mb-3" onSubmit={handleSubscribe}>
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email Address" 
                />
                <button className="btn sz-btn-sport" type="submit">Subscribe</button>
              </div>
            </form>
            {status.message && (
              <p className={`sz-newsletter-feedback small ${status.type === "success" ? "text-success-custom" : "text-danger-custom"}`}>
                {status.message}
              </p>
            )}

            <div className="mt-4">
              <h6 className="text-white small fw-bold mb-2">Customer Hotline Hours</h6>
              <ul className="list-unstyled sz-footer-contact">
                <li>
                  <FaPhone className="text-primary mt-1" />
                  <a href="tel:+917736476734" className="text-decoration-none sz-footer-contact-link">
                    +91 7736476734
                  </a>
                  <span className="text-muted small ms-1">(9 AM - 6 PM IST)</span>
                </li>
                <li>
                  <FaEnvelope className="text-primary mt-1" />
                  <a href="mailto:support@sportzone.com" className="text-decoration-none sz-footer-contact-link">
                    support@sportzone.com
                  </a>
                </li>
                <li>
                  <FaMapMarkerAlt className="text-primary mt-1" />
                  <span className="text-muted">Calicut, Kerala, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="sz-footer-divider" />

        {/* 🚀 Bottom Meta Bar */}
        <div className="row align-items-center gy-3 sz-footer-bottom">
          <div className="col-md-6 text-center text-md-start">
            <p className="sz-footer-copy mb-0">
              &copy; {new Date().getFullYear()} SportZone. Designed for athletes, powered by performance. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end d-flex flex-column flex-sm-row justify-content-md-end align-items-center gap-3">
            <div className="sz-footer-legal-links">
              <Link to="/privacy" className="sz-footer-legal me-3">Privacy Policy</Link>
              <Link to="/terms" className="sz-footer-legal">Terms of Use</Link>
            </div>
            <div className="sz-footer-payments d-flex align-items-center justify-content-center justify-content-md-end gap-2">
              <span className="sz-pay-badge-wrapper" title="Visa Payment">
                <FaCcVisa size={22} className="payment-icon visa" />
              </span>
              <span className="sz-pay-badge-wrapper" title="Mastercard Payment">
                <FaCcMastercard size={22} className="payment-icon mastercard" />
              </span>
              <span className="sz-pay-badge-wrapper" title="Razorpay Secure Gateway">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="22" height="22" className="payment-icon razorpay">
                  <title>Razorpay</title>
                  <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Floating Back to Top Button */}
      <button 
        className={`sz-back-to-top btn rounded-circle ${showScrollTop ? "show" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to Top"
        type="button"
      >
        <FaArrowUp size={16} />
      </button>
    </footer>
  );
};

export default Footer;
