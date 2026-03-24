import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../api";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card border-0 rounded-4 shadow-lg p-4 mx-auto" style={{ maxWidth: 520 }}>
        <h4 className="fw-bold mb-3">Forgot Password</h4>

        {step === 1 && (
          <>
            <label className="form-label small fw-bold text-muted">Email</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light border-0"><FaEnvelope /></span>
              <input
                type="email"
                className="form-control bg-light border-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <button className="btn btn-primary w-100 rounded-pill" onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="form-label small fw-bold text-muted">OTP</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light border-0"><FaKey /></span>
              <input
                className="form-control bg-light border-0"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <button className="btn btn-primary w-100 rounded-pill" onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label className="form-label small fw-bold text-muted">New Password</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light border-0"><FaLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control bg-light border-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="input-group-text bg-light border-0"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button className="btn btn-success w-100 rounded-pill" onClick={resetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

