import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

const LoginModal = ({ show, handleClose, openSignup, openForgot }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
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

        window.dispatchEvent(new Event("loginSuccess"));

        reset();
        handleClose();
      } else {
        toast.error(result.error || "Invalid credentials ❌");
      }
    } catch {
      toast.error("Server error 😢");
    }
  };

  return (
    <div className="modal d-block fade show" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 p-4 rounded-4 shadow-lg">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark">Welcome Back</h4>
            <button className="btn-close" onClick={handleClose}></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email</label>
              <div className="input-group shadow-sm rounded-3">
                <span className="input-group-text bg-light border-0"><FaEnvelope /></span>
                <input type="email" className="form-control bg-light border-0 p-3" {...register("email", { required: true })}/>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Password</label>
              <div className="input-group shadow-sm rounded-3">
                <span className="input-group-text bg-light border-0"><FaLock /></span>
                <input type={showPassword ? "text" : "password"} className="form-control bg-light border-0 p-3" {...register("password", { required: true })}/>
                <button type="button" className="input-group-text bg-light border-0" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary w-100 p-3 rounded-pill fw-bold">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* 🔥 ACTION LINKS */}
          <div className="text-center mt-3">

            <button
              className="btn btn-link d-block"
              onClick={() => {
                handleClose();
                openForgot();
              }}
            >
              Forgot Password?
            </button>

            <button
              className="btn btn-link"
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