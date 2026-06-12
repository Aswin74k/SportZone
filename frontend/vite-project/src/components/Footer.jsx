import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import Logo from "./Logo";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="sz-footer">
      <div className="container-fluid container-xl py-5">
        <div className="row gy-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="text-decoration-none d-inline-block mb-3">
              <Logo fontSize="1.6rem" />
            </Link>
            <p className="sz-footer-text mb-4 pe-lg-4">
              Premium sports gear for every athlete. Train harder, play smarter — only at SportZone.
            </p>
            <div className="d-flex gap-2 sz-footer-social">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="sz-footer-social-link" aria-label="Social">
                  <Icon size={16} />
                </a>
              ))}
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
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/help">Help</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h5 className="sz-footer-heading">Contact</h5>
            <ul className="list-unstyled sz-footer-contact">
              <li><FaMapMarkerAlt className="text-primary" /> Sports Avenue, Calicut, India</li>
              <li><FaPhone className="text-primary" /> +91 7736476734</li>
              <li><FaEnvelope className="text-primary" /> support@sportzone.com</li>
            </ul>
            <form className="sz-footer-newsletter mt-3" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Your email" aria-label="Email" />
                <button className="btn sz-btn-sport" type="button">Subscribe</button>
              </div>
            </form>
          </div>
        </div>

        <hr className="sz-footer-divider" />

        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <p className="sz-footer-copy mb-0">&copy; {new Date().getFullYear()} SportZone. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <Link to="/privacy" className="sz-footer-legal me-3">Privacy</Link>
            <Link to="/terms" className="sz-footer-legal">Terms</Link>
            <span className="ms-3 sz-pay-pill">UPI</span>
            <span className="sz-pay-pill">Cards</span>
            <span className="sz-pay-pill">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
