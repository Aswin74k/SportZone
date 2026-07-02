import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebookF, 
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
      <div className="container-fluid container-xl pt-5 pb-4">
        {/* Main Footer Content Grid */}
        <div className="sz-footer-main-grid">
          
          {/* Column 1: Brand & Socials */}
          <div className="footer-brand-col">
            <Link to="/" className="text-decoration-none d-inline-block mb-3">
              <Logo fontSize="1.35rem" light={true} />
            </Link>
            <p className="sz-footer-text mb-4 pe-lg-3">
              Premium sports gear for every athlete. Train harder, play smarter.
            </p>
            <h5 className="sz-footer-heading-small">Social</h5>
            <div className="d-flex gap-3.5 sz-footer-social-flat">
              <a href="#" className="sz-footer-social-flat-link fb" aria-label="Facebook">
                <FaFacebookF size={15} />
              </a>
              <a href="#" className="sz-footer-social-flat-link twitter" aria-label="X (formerly Twitter)">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="15" height="15" style={{ display: "block" }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="sz-footer-social-flat-link instagram" aria-label="Instagram">
                <FaInstagram size={15} />
              </a>
              <a href="#" className="sz-footer-social-flat-link youtube" aria-label="Youtube">
                <FaYoutube size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="footer-links-col">
            <h5 className="sz-footer-heading">Shop</h5>
            <ul className="sz-footer-links">
              <li><Link to="/shop?category=cricket">Cricket</Link></li>
              <li><Link to="/shop?category=football">Football</Link></li>
              <li><Link to="/shop?category=running">Running</Link></li>
              <li><Link to="/shop?category=basketball">Basketball</Link></li>
              <li><Link to="/shop">All Products</Link></li>
            </ul>
          </div>

          {/* Column 3: Account Links */}
          <div className="footer-links-col">
            <h5 className="sz-footer-heading">Account</h5>
            <ul className="sz-footer-links">
              <li><Link to="/orders">Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-news-col">
            <h5 className="sz-footer-heading">Newsletter</h5>
            <p className="sz-footer-text mb-3">Subscribe to get special offers and gear releases.</p>
            <form onSubmit={handleSubscribe} className="sz-footer-newsletter-form">
              <input 
                type="email" 
                className="sz-newsletter-input-field"
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email Address" 
                required
              />
              <button type="submit" className="sz-newsletter-submit-btn">Subscribe</button>
            </form>
            {status.message && (
              <p className={`sz-newsletter-feedback small mb-0 mt-2 ${status.type === "success" ? "text-success-custom" : "text-danger-custom"}`}>
                {status.message}
              </p>
            )}
          </div>

          {/* Column 5: Support/Hotline */}
          <div className="footer-contact-col">
            <h5 className="sz-footer-heading">Support</h5>
            <ul className="sz-footer-contact">
              <li>
                <FaPhone className="contact-icon" size={12} />
                <a href="tel:+917736476734" className="sz-footer-contact-link">
                  +91 7736476734
                </a>
              </li>
              <li>
                <FaEnvelope className="contact-icon" size={12} />
                <a href="mailto:support@sportzone.com" className="sz-footer-contact-link">
                  support@sportzone.com
                </a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" size={12} />
                <span className="text-muted">Calicut, Kerala, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Meta Bar (Sleek, perfect alignments and spacing) */}
        <div className="sz-footer-bottom">
          <div className="sz-footer-copy-wrapper">
            <p className="sz-footer-copy">
              &copy; {new Date().getFullYear()} SportZone. All rights reserved.
            </p>
          </div>
          
          <div className="sz-footer-legal-links">
            <Link to="/privacy" className="sz-footer-legal">Privacy Policy</Link>
            <span className="sz-footer-divider-dot">·</span>
            <Link to="/terms" className="sz-footer-legal">Terms of Use</Link>
          </div>

          <div className="sz-footer-payments">
            <span className="sz-pay-badge-wrapper" title="Visa Payment">
              <FaCcVisa size={20} className="payment-icon visa" />
            </span>
            <span className="sz-pay-badge-wrapper" title="Mastercard Payment">
              <FaCcMastercard size={20} className="payment-icon mastercard" />
            </span>
            <span className="sz-pay-badge-wrapper" title="Razorpay Secure Gateway">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="18" height="18" className="payment-icon razorpay">
                <title>Razorpay</title>
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
              </svg>
            </span>
          </div>
        </div>

      </div>

      {/* Floating Back to Top Button */}
      <button 
        className={`sz-back-to-top btn rounded-circle ${showScrollTop ? "show" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to Top"
        type="button"
      >
        <FaArrowUp size={14} />
      </button>
    </footer>
  );
};

export default Footer;
