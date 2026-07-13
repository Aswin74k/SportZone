import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../api";
import Logo from "../components/Logo";
import "./Auth.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      toast.warning("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await API.post("forgot-password/", { email });
      toast.success("OTP sent to your email 📩");
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.warning("Please enter OTP");
      return;
    }
    setLoading(true);
    try {
      await API.post("verify-otp/", { email, otp });
      toast.success("OTP verified");
      setStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await API.post("reset-password/", { email, new_password: password });
      toast.success("Password reset successful 🎉");
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-brand-header fade-in">
        <Link to="/" className="auth-brand-link">
          <Logo fontSize="2rem" />
        </Link>
        <div className="auth-brand-tagline">Premium Sports Gear</div>
      </div>

      <div className="auth-card fade-in">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Securely recover your SportZone account</p>

        {step === 1 && (
          <div className="fade-in">
            <div className="mb-4">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-group">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  autoFocus
                />
              </div>
            </div>
            <button className="auth-primary-btn" onClick={sendOtp} disabled={loading}>
              {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
             <div className="auth-email-display">
                <span className="auth-email-text">{email}</span>
                <button type="button" className="auth-link" onClick={() => setStep(1)}>Change</button>
              </div>
              
            <div className="mb-4">
              <label className="auth-label">OTP Verification</label>
              <div className="auth-input-group">
                <FaKey className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  autoFocus
                />
              </div>
            </div>
            <button className="auth-primary-btn" onClick={verifyOtp} disabled={loading}>
              {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Verifying...
                  </>
                ) : "Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <div className="mb-4">
              <label className="auth-label">New Password</label>
              <div className="auth-input-group">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-eye-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button className="auth-primary-btn" onClick={resetPassword} disabled={loading}>
              {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Resetting...
                  </>
                ) : "Reset Password"}
            </button>
          </div>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login" className="auth-link fw-bold">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
