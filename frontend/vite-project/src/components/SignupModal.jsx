import { useState } from "react";
import "./SignupModal.css";
import { IoClose, IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

function SignupModal({ open, onClose, onOpenLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleWrapperClick}>
      <div className="auth-modal-card signup-card">
        <button className="auth-modal-close" onClick={onClose}>
          <IoClose size={20} />
        </button>

        <h2 className="auth-modal-title">Create your account</h2>
        <p className="auth-modal-subtitle">
          Join SportZone to save your carts, orders and favorites.
        </p>

        <form className="auth-form">
          <div className="auth-name-row">
            <div className="auth-field">
              <label htmlFor="signup-first-name">First name</label>
              <input
                id="signup-first-name"
                type="text"
                placeholder="Alex"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-last-name">Last name</label>
              <input
                id="signup-last-name"
                type="text"
                placeholder="Morgan"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field auth-password-field">
            <label htmlFor="signup-password">Password</label>
            <div className="auth-password-wrapper">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="auth-field auth-password-field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <div className="auth-password-wrapper">
              <input
                id="signup-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="signup-primary-btn">
            Create account
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link-btn"
            onClick={onOpenLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupModal;

