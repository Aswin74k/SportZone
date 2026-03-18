import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPasswordModal = ({ show, handleClose }) => {

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!show) return null;

  // 🔥 SEND OTP
  const sendOtp = async () => {
    if (!email) {
      toast.warning("Please enter your email");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to your email 📩");
        setStep(2);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }

    } catch {
      toast.error("Server error");
    }

    setLoading(false);
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async () => {
    if (!otp) {
      toast.warning("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP Verified ✨");
        setStep(3);
      } else {
        toast.error(data.error || "Invalid OTP");
      }

    } catch {
      toast.error("Server error");
    }

    setLoading(false);
  };

  // 🔥 RESET PASSWORD
  const resetPassword = async () => {
    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful 🎉");
        handleClose();
        setTimeout(() => {
          setStep(1);
          setEmail("");
          setOtp("");
          setPassword("");
        }, 300);
      } else {
        toast.error(data.error || "Failed to reset password");
      }

    } catch {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Reset Password</h4>
            <button
              className="btn-close shadow-none"
              onClick={handleClose}
            ></button>
          </div>

          <p className="text-muted small mb-4">
            {step === 1 && "Enter your email to receive a password reset OTP"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new strong password for your account"}
          </p>

          {/* STEP INDICATOR */}
          <div className="d-flex justify-content-between mb-4 text-center small position-relative">
            <div className="position-absolute top-50 start-0 end-0 translate-middle-y" style={{height: "2px", background: "var(--light-gray)", zIndex: 0}}></div>
            <div className="position-absolute top-50 start-0 translate-middle-y transition-all" style={{height: "2px", background: "var(--primary-color)", width: `${(step-1)*50}%`, zIndex: 1, transition: "width 0.3s ease"}}></div>
            
            <div className={`position-relative z-2 bg-white px-2 rounded-pill ${step >= 1 ? "fw-bold text-primary" : "text-muted"}`}>
              <span className={`d-inline-flex align-items-center justify-content-center rounded-circle me-1 border ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-secondary'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>1</span>
              Email
            </div>

            <div className={`position-relative z-2 bg-white px-2 rounded-pill ${step >= 2 ? "fw-bold text-primary" : "text-muted"}`}>
              <span className={`d-inline-flex align-items-center justify-content-center rounded-circle me-1 border ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-secondary'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>2</span>
              OTP
            </div>

            <div className={`position-relative z-2 bg-white px-2 rounded-pill ${step >= 3 ? "fw-bold text-primary" : "text-muted"}`}>
              <span className={`d-inline-flex align-items-center justify-content-center rounded-circle me-1 border ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-secondary'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>3</span>
              Reset
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-3 position-relative">
                <label className="form-label fw-bold small text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaEnvelope className="text-muted" /></span>
                  <input
                    type="email"
                    className="form-control bg-light border-0 p-3"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary w-100 p-3 rounded-pill fw-bold hover-shadow mt-2"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                   <>
                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                     Sending...
                   </>
                ) : "Send OTP"}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-3 position-relative">
                <label className="form-label fw-bold small text-muted">Verification Code</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaKey className="text-muted" /></span>
                  <input
                    className="form-control bg-light border-0 p-3 letter-spacing-2 fw-medium text-center"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary w-100 p-3 rounded-pill fw-bold hover-shadow mt-2"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? (
                   <>
                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                     Verifying...
                   </>
                ) : "Verify OTP"}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="mb-3 position-relative">
                <label className="form-label fw-bold small text-muted">New Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><FaLock className="text-muted" /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-light border-0 p-3"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="input-group-text bg-light border-0" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                  </button>
                </div>
              </div>

              <button
                className="btn btn-success w-100 p-3 rounded-pill fw-bold hover-shadow mt-2"
                onClick={resetPassword}
                disabled={loading}
              >
                {loading ? (
                   <>
                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                     Resetting...
                   </>
                ) : "Reset Password"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;