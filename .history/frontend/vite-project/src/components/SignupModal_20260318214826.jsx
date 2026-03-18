import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const SignupModal = ({ show, handleClose, openLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting }
  } = useForm();

  const password = watch("password");

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

        // ✅ AUTO LOGIN
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
    <div className="modal d-block fade show" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg p-4">

          <div className="d-flex justify-content-between">
            <h4 className="fw-bold">Create Account</h4>
            <button className="btn-close" onClick={handleClose}></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-3">

            <input className="form-control mb-3" placeholder="Full Name" {...register("fullName", { required: true })}/>
            <input className="form-control mb-3" type="email" placeholder="Email" {...register("email", { required: true })}/>

            <input type={showPassword ? "text" : "password"} className="form-control mb-3" placeholder="Password" {...register("password", { required: true })}/>
            
            <input type={showConfirmPassword ? "text" : "password"} className="form-control mb-3" placeholder="Confirm Password" {...register("confirmPassword", { required: true })}/>

            <button className="btn btn-primary w-100 rounded-pill">
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>

          </form>

          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={() => {
                handleClose();
                openLogin();
              }}
            >
              Already have an account? Sign In
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupModal;