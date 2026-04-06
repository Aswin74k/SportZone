import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import API from "../api";
import "./AuthModal.css";

const ForgotPasswordModal = ({ show, handleClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    mode: "onChange"
  });

  if (!show) return null;

  const handleModalClose = () => {
    setStep(1);
    reset();
    handleClose();
  };

  // 🔥 SEND OTP
  const sendOtp = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;
    
    setLoading(true);
    try {
      await API.post("forgot-password/", { email: getValues("email").toLowerCase() });
      toast.success("OTP sent to your email 📩");
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async () => {
    const isValid = await trigger("otp");
    if (!isValid) return;

    setLoading(true);
    try {
      await API.post("verify-otp/", { 
        email: getValues("email").toLowerCase(), 
        otp: getValues("otp") 
      });
      toast.success("OTP Verified ✨");
      setStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Invalid OTP");
    }
    setLoading(false);
  };

  // 🔥 RESET PASSWORD
  const resetPassword = async () => {
    const isValid = await trigger("password");
    if (!isValid) return;
    
    setLoading(true);
    try {
      await API.post("reset-password/", {
        email: getValues("email").toLowerCase(),
        new_password: getValues("password"),
      });
      toast.success("Password reset successful 🎉");
      handleModalClose();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <div className="modal d-block auth-backdrop">
      <div className="modal-dialog modal-dialog-centered auth-modal-dialog mx-auto">
        <div className="modal-content auth-modal-content">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold auth-title mb-0">Reset Password</h4>
            <button type="button" className="btn-close btn-close-white" onClick={handleModalClose}></button>
          </div>

          <p className="auth-subtitle small mb-4">
            {step === 1 && "Enter your email to receive a password reset OTP."}
            {step === 2 && "Enter the 6-digit code sent to your email."}
            {step === 3 && "Create a new strong password for your account."}
          </p>

          {/* STEP INDICATOR */}
          <div className="d-flex justify-content-between mb-4 text-center small position-relative">
            <div className="position-absolute top-50 start-0 end-0 translate-middle-y auth-step-line-bg" style={{height: "2px", zIndex: 0}}></div>
            <div className="position-absolute top-50 start-0 translate-middle-y transition-all auth-step-line-active" style={{height: "2px", width: `${(step-1)*50}%`, zIndex: 1, transition: "width 0.3s ease"}}></div>
            
            <div className={`position-relative z-2 px-2 rounded-pill ${step >= 1 ? "auth-step-text-active" : "auth-step-text"}`}>
              <span className={`d-inline-flex align-items-center justify-content-center rounded-circle me-1 ${step >= 1 ? 'auth-step-badge-active' : 'auth-step-badge'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>1</span>
              Email
            </div>

            <div className={`position-relative z-2 px-2 rounded-pill ${step >= 2 ? "auth-step-text-active" : "auth-step-text"}`}>
              <span className={`d-inline-flex align-items-center justify-content-center rounded-circle me-1 ${step >= 2 ? 'auth-step-badge-active' : 'auth-step-badge'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>2</span>
              OTP
            </div>

            <div className={`position-relative z-2 px-2 rounded-pill ${step >= 3 ? "auth-step-text-active" : "auth-step-text"}`}>
              <span className={`d-inline-flex align-items-center justify-content-center rounded-circle me-1 ${step >= 3 ? 'auth-step-badge-active' : 'auth-step-badge'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>3</span>
              Reset
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-fade-in mb-3">
                <label className="form-label fw-bold small auth-subtitle">Email Address</label>
                <div className={`input-group auth-input-group ${errors.email ? "is-invalid" : ""}`}>
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g., alex@company.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <div className="auth-error-msg">
                    <FaExclamationCircle /> {errors.email.message}
                  </div>
                )}
                
                <button
                  type="button"
                  className="auth-btn-primary w-100 mt-4 d-flex justify-content-center align-items-center"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...</>
                  ) : "Send OTP"}
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-fade-in mb-3">
                <label className="form-label fw-bold small auth-subtitle">Verification Code</label>
                <div className={`input-group auth-input-group ${errors.otp ? "is-invalid" : ""}`}>
                  <span className="input-group-text"><FaKey /></span>
                  <input
                    className="form-control letter-spacing-2 fw-bold text-center fs-5"
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoComplete="off"
                    {...register("otp", { 
                      required: "OTP is required",
                      minLength: { value: 6, message: "Must be 6 digits" }
                    })}
                  />
                </div>
                {errors.otp && (
                  <div className="auth-error-msg">
                    <FaExclamationCircle /> {errors.otp.message}
                  </div>
                )}

                <button
                  type="button"
                  className="auth-btn-primary w-100 mt-4 d-flex justify-content-center align-items-center"
                  onClick={verifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Verifying...</>
                  ) : "Verify OTP"}
                </button>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-fade-in mb-3">
                <label className="form-label fw-bold small auth-subtitle">New Password</label>
                <div className={`input-group auth-input-group ${errors.password ? "is-invalid" : ""}`}>
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    {...register("password", { 
                      required: "New password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" }
                    })}
                  />
                  <button 
                    type="button" 
                    className="btn-eye-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="auth-error-msg">
                    <FaExclamationCircle /> {errors.password.message}
                  </div>
                )}

                <button
                  type="button"
                  className="auth-btn-primary success-btn w-100 mt-4 d-flex justify-content-center align-items-center"
                  onClick={resetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Resetting...</>
                  ) : "Reset Password"}
                </button>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;