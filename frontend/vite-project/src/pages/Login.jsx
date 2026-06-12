import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import "./Auth.css";

const Login = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const emailValue = watch("email");

  const onContinue = async () => {
    const isEmailValid = await trigger("email");
    if (isEmailValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data) => {
    if (step === 1) {
      onContinue();
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.toLowerCase(), password: data.password }),
      });
      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("token", result.access);
        localStorage.setItem("access", result.access);
        localStorage.setItem("refresh", result.refresh);
        login({
          name: result.user?.name ?? result.name ?? data.email.split("@")[0],
          is_staff: !!result.user?.is_staff,
        });

        toast.success("Welcome back 👋");
        navigate(from, { replace: true });
      } else {
        toast.error("Invalid email or password");
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
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your SportZone account</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {step === 1 && (
            <div className="fade-in">
              <div className="mb-4">
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
              </div>
              <button 
                type="button" 
                onClick={onContinue} 
                className="auth-primary-btn"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="auth-email-display">
                <span className="auth-email-text">{emailValue}</span>
                <button type="button" className="auth-link" onClick={() => setStep(1)}>Change</button>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                   <label className="auth-label mb-0">Password</label>
                   <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                </div>
               
                <div className="auth-input-group">
                  <FaLock className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`auth-input ${errors.password ? "is-invalid" : ""}`}
                    placeholder="Enter your password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 6, message: "Incorrect password" }
                    })}
                    autoFocus
                  />
                  <button type="button" className="btn-eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="auth-error-msg">
                    <FaExclamationCircle /> {errors.password.message}
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                className="auth-primary-btn" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </div>
          )}
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link fw-bold">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
