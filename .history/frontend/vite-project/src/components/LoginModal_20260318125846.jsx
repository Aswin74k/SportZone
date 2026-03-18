import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

const LoginModal = ({ show, handleClose, openSignup, openForgot }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  if (!show) return null;

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("token", result.access);
        toast.success("Login successful 🔥");
        handleClose();
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        toast.error(result.error || "Invalid credentials ❌");
      }
    } catch {
      toast.error("Server error 😢");
    }
  };

  return (
    <div className="modal d-block fade show transition-all" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered transition-all" style={{ transition: "transform 0.3s ease-out" }}>
        <div className="modal-content border-0 p-4 rounded-4 shadow-lg transition-all">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0 text-dark">Welcome Back</h4>
            <button className="btn-close shadow-none transition-all hover-lift" onClick={handleClose}></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3 position-relative">
              <label className="form-label fw-bold small text-muted">Email Address</label>
              <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                <span className="input-group-text bg-light border-0"><FaEnvelope className="text-muted" /></span>
                <input
                  type="email"
                  className="form-control bg-light border-0 p-3 shadow-none transition-all"
                  
                  {...register("email", { required: "Email required" })}
                />
              </div>
              {errors.email && <small className="text-danger mt-1 d-block fw-medium">{errors.email.message}</small>}
            </div>

            <div className="mb-4 position-relative">
              <label className="form-label fw-bold small text-muted">Password</label>
              <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                <span className="input-group-text bg-light border-0"><FaLock className="text-muted" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-light border-0 p-3 shadow-none transition-all"
                  
                  {...register("password", { required: "Password required" })}
                />
                <button 
                  type="button" 
                  className="input-group-text bg-light border-0 hover-lift transition-all" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                </button>
              </div>
              {errors.password && <small className="text-danger mt-1 d-block fw-medium">{errors.password.message}</small>}
            </div>

            <div className="d-flex justify-content-end mb-4">
              <button
                type="button"
                className="btn btn-link text-decoration-none p-0 fw-medium small text-primary hover-lift transition-all"
                onClick={() => {
                  handleClose();
                  openForgot();
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button 
              disabled={isSubmitting} 
              className="btn btn-primary w-100 p-3 rounded-pill fw-bold hover-shadow mb-3 transition-all"
              style={{ transition: "all 0.3s ease" }}
            >
              {isSubmitting ? (
                 <>
                   <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                   Signing in...
                 </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-2">
            <span className="text-muted small fw-medium">Don't have an account?</span>
            <button
              className="btn btn-link text-decoration-none p-0 ms-1 fw-bold text-primary hover-lift transition-all"
              onClick={() => {
                handleClose();
                openSignup();
              }}
            >
              Create Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;