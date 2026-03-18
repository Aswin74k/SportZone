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
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch("password");

  if (!show) return null;

  const onSubmit = async (data) => {

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: data.fullName.trim(), // ✅ FULL NAME
          email: data.email.toLowerCase(),
          password: data.password
        })
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Account created successfully 🎉");
        handleClose();
        openLogin();
      } else {
        toast.error(result.error || "Signup failed!");
      }

    } catch {
      toast.error("Server error 😢");
    }
  };

  return (
    <div
      className="modal d-block fade show"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        zIndex: 1055
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg my-4">

          {/* HEADER */}
          <div className="modal-header border-0 pb-0 px-4 pt-4 d-flex justify-content-between">
            <h4 className="fw-bold mb-0 text-dark">Create Account</h4>
            <button className="btn-close" onClick={handleClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body p-4 pt-2">
            <p className="text-muted small mb-4">
              Join SportZone for faster checkout
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* FULL NAME */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">
                  Full Name
                </label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <span className="input-group-text bg-light border-0">
                    <FaUser className="text-muted" />
                  </span>
                  <input
                    className="form-control bg-light border-0 p-3 shadow-none"
                    placeholder="John Doe"
                    {...register("fullName", {
                      required: "Full name required",
                    })}
                  />
                </div>
                {errors.fullName && (
                  <small className="text-danger">
                    {errors.fullName.message}
                  </small>
                )}
              </div>

              {/* EMAIL */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">
                  Email
                </label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <span className="input-group-text bg-light border-0">
                    <FaEnvelope className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-0 p-3 shadow-none"
                    placeholder="name@example.com"
                    {...register("email", {
                      required: "Email required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <small className="text-danger">
                    {errors.email.message}
                  </small>
                )}
              </div>

              {/* PASSWORD */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">
                  Password
                </label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <span className="input-group-text bg-light border-0">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-light border-0 p-3"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password required",
                      minLength: {
                        value: 6,
                        message: "Min 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <small className="text-danger">
                    {errors.password.message}
                  </small>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted">
                  Confirm Password
                </label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <span className="input-group-text bg-light border-0">
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control bg-light border-0 p-3"
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-0"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <small className="text-danger">
                    {errors.confirmPassword.message}
                  </small>
                )}
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-100 p-3 rounded-pill fw-bold"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>

            </form>

            <div className="text-center mt-3">
              <span className="text-muted small">
                Already have an account?
              </span>
              <button
                className="btn btn-link p-0 ms-1 fw-bold"
                onClick={openLogin}
              >
                Sign In
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;