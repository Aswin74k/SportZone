import "./LoginModal.css";
import { IoClose } from "react-icons/io5";

function LoginModal({ open, onClose, onOpenSignup }) {
  if (!open) return null;

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleWrapperClick}>
      <div className="auth-modal-card login-card">
        <button className="auth-modal-close" onClick={onClose}>
          <IoClose size={20} />
        </button>

        <h2 className="auth-modal-title">Welcome back</h2>
        <p className="auth-modal-subtitle">
          Sign in to continue your SportZone journey.
        </p>

        <form className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-primary-btn">
            Login
          </button>
        </form>

        <p className="auth-switch-text">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="auth-link-btn"
            onClick={onOpenSignup}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;

