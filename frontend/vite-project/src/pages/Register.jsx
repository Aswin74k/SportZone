import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import "./Auth.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const passwordVal = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("token", result.access);
        localStorage.setItem("access", result.access);
        localStorage.setItem("refresh", result.refresh);
        
        login({ name: payload.name });
        toast.success("Account created successfully 🎉");
        navigate("/");
      } else {
        toast.error(result.error || "Signup failed!");
      }
    } catch {
      toast.error("Server error 😢");
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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join SportZone for faster checkout</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-group">
              <FaUser className="auth-input-icon" />
              <input
                type="text"
                className={`auth-input ${errors.fullName ? "is-invalid" : ""}`}
                placeholder="Enter your full name"
                {...register("fullName", { required: "Full name is required" })}
              />
            </div>
            {errors.fullName && (
              <div className="auth-error-msg"><FaExclamationCircle /> {errors.fullName.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-group">
              <FaEnvelope className="auth-input-icon" />
              <input
                type="email"
                className={`auth-input ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter your email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email"
                  }
                })}
              />
            </div>
            {errors.email && (
              <div className="auth-error-msg"><FaExclamationCircle /> {errors.email.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="auth-label">Password</label>
            <div className="auth-input-group">
              <FaLock className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className={`auth-input ${errors.password ? "is-invalid" : ""}`}
                placeholder="Create a password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
              <button type="button" className="btn-eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <div className="auth-error-msg"><FaExclamationCircle /> {errors.password.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="auth-label">Confirm Password</label>
             <div className="auth-input-group">
              <FaLock className="auth-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`auth-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                placeholder="Confirm your password"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: val => val === passwordVal || "Passwords do not match"
                })}
              />
              <button type="button" className="btn-eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="auth-error-msg"><FaExclamationCircle /> {errors.confirmPassword.message}</div>
            )}
          </div>

          <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link fw-bold">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
