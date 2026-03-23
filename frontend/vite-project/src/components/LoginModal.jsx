import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import "./AuthModal.css";

const LoginModal = ({ show, handleClose, openSignup, openForgot }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  // Reset form when modal toggles
  useEffect(() => {
    if (show) {
      reset();
      setTimeout(() => setShowPassword(false), 0);
    }
  }, [show, reset]);

  if (!show) return null;

 const onSubmit = async (data) => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email.toLowerCase(),
        password: data.password,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      // Keep storage keys consistent with API/auth usage.
      localStorage.setItem("token", result.access);
      localStorage.setItem("access", result.access); // backward compatible
      localStorage.setItem("refresh", result.refresh);

      toast.success("Welcome back 👋");
      window.dispatchEvent(new Event("loginSuccess"));
      reset();
      handleClose();
    } else {
      toast.error("Invalid email or password");
    }
  } catch {
    toast.error("Server error 😢");
  }
};

  return (
    <div className="modal d-block auth-backdrop">
      <div className="modal-dialog modal-dialog-centered auth-modal-dialog mx-auto">
        <div className="modal-content auth-modal-content">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark mb-0">Welcome Back</h4>
            <button className="btn-close" onClick={handleClose}></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text"><FaEnvelope /></span>
                <input 
                  type="email" 
                  className={`form-control ${errors.email ? "is-invalid" : ""}`} 
                  placeholder="john@example.com" 
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Password</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text"><FaLock /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`form-control ${errors.password ? "is-invalid" : ""}`} 
                  placeholder="••••••••" 
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" className="input-group-text" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
              
              {/* Forgot Password Link Positioned Here */}
              <div className="text-end mt-2">
                <button
                  type="button"
                  className="auth-link-subtle"
                  onClick={() => {
                    handleClose();
                    openForgot();
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button className="auth-btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <button
              className="auth-link-subtle"
              onClick={() => {
                handleClose();
                openSignup();
              }}
            >
              Don't have an account? <span className="auth-link-primary">Create Account</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;