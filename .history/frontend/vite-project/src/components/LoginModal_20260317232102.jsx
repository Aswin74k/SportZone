import React from "react";
import { useForm } from "react-hook-form";

const LoginModal = ({ show, handleClose, openSignup, openForgot }) => {

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
        alert("Login successful 🔥");
        handleClose();
        window.location.reload();
      } else {
        alert(result.error || "Invalid credentials ❌");
      }

    } catch {
      alert("Server error 😢");
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 rounded-4">

          <h4 className="fw-bold mb-3">Login</h4>

          <form onSubmit={handleSubmit(onSubmit)}>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              {...register("email", { required: "Email required" })}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              {...register("password", { required: "Password required" })}
            />

            <button className="btn btn-primary w-100 mb-2">
              {isSubmitting ? "Logging..." : "Login"}
            </button>

          </form>

          <button
            className="btn btn-link"
            onClick={() => {
              handleClose();
              openForgot();   // ✅ FIX
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

          <button className="btn btn-secondary mt-2" onClick={handleClose}>
            Close
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;