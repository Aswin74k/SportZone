import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "./AuthModal.css";

const SignupModal = ({ show, handleClose, openLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  // Reset form when modal toggles
  useEffect(() => {
    if (show) {
      reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [show, reset]);

  const passwordVal = watch("password");

  if (!show) return null;

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    const payload = {
      name: data.fullName.trim(),
      email: data.email.toLowerCase(),
      password: data.password
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("token", result.access);
        window.dispatchEvent(new Event("loginSuccess"));
        toast.success("Account created successfully 🎉");
        reset();
        handleClose();
      } else {
        toast.error(result.error || "Signup failed!");
      }
    } catch {
      toast.error("Server error 😢");
    }
  };

  return (
    <div className="modal d-block auth-backdrop">
      <div className="modal-dialog modal-dialog-centered auth-modal-dialog mx-auto">
        <div className="modal-content auth-modal-content">

          <div className="d-flex justify-content-between align-items-center mb-1">
            <h4 className="fw-bold text-dark mb-0">Create Account</h4>
            <button className="btn-close" onClick={handleClose}></button>
          </div>
          <p className="text-muted small mb-4">Join SportZone for faster checkout</p>

          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Full Name</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text"><FaUser /></span>
                <input 
                  type="text" 
                  className={`form-control ${errors.fullName ? "is-invalid" : ""}`} 
                  placeholder="John Doe" 
                  {...register("fullName", { required: "Full name is required" })}
                />
              </div>
              {errors.fullName && <div className="text-danger small mt-1">{errors.fullName.message}</div>}
            </div>

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

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Password</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text"><FaLock /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`form-control ${errors.password ? "is-invalid" : ""}`} 
                  placeholder="••••••••" 
                  {...register("password", { 
                    required: "Password is required", 
                    minLength: { value: 6, message: "Minimum 6 characters" } 
                  })}
                />
                <button type="button" className="input-group-text" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Confirm Password</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text"><FaLock /></span>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`} 
                  placeholder="••••••••" 
                  {...register("confirmPassword", { 
                    required: "Please confirm your password", 
                    validate: value => value === passwordVal || "Passwords do not match" 
                  })}
                />
                <button type="button" className="input-group-text" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>}
            </div>

            <button className="auth-btn-primary w-100" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>

          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <button
              className="auth-link-subtle"
              onClick={() => {
                handleClose();
                openLogin();
              }}
            >
              Already have an account? <span className="auth-link-primary">Sign In</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupModal;