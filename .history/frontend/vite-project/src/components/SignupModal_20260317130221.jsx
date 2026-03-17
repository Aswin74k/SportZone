import React from "react";
import { useForm } from "react-hook-form";

const SignupModal = ({ show, handleClose, openLogin }) => {

const {
register,
handleSubmit,
watch,
formState: { errors, isSubmitting }
} = useForm();

const password = watch("password");

if (!show) return null;

const onSubmit = async (data) => {
try {
const res = await fetch("http://127.0.0.1:8000/api/register/", {
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
    alert("Account created successfully 🎉");
    handleClose();
    openLogin();
  } else {
    alert(result.message || "Signup failed ❌");
  }

} catch (err) {
  console.log(err);
  alert("Server error 😢");
}


};

return (
<div
className="modal d-block"
style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
> <div className="modal-dialog modal-dialog-centered"> <div className="modal-content border-0 rounded-4 shadow-lg my-4">


      <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
        <h5 className="modal-title fw-bold fs-3 mt-2">
          Create Account
        </h5>

        <button
          className="btn-close"
          onClick={handleClose}
        ></button>
      </div>

      <div className="modal-body p-4 pt-2">

        <p className="text-muted small mb-4">
          Join SportZone for faster checkout
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* FIRST NAME */}
          <div className="mb-3">
            <label className="form-label fw-bold small">
              First Name
            </label>

            <input
              className="form-control p-3 bg-light border-0"
              placeholder="John"
              {...register("firstName", {
                required: "First name required",
              })}
            />

            {errors.firstName && (
              <small className="text-danger">
                {errors.firstName.message}
              </small>
            )}
          </div>

          {/* LAST NAME */}
          <div className="mb-3">
            <label className="form-label fw-bold small">
              Last Name
            </label>

            <input
              className="form-control p-3 bg-light border-0"
              placeholder="Doe"
              {...register("lastName", {
                required: "Last name required",
              })}
            />

            {errors.lastName && (
              <small className="text-danger">
                {errors.lastName.message}
              </small>
            )}
          </div>

          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label fw-bold small">
              Email
            </label>

            <input
              type="email"
              className="form-control p-3 bg-light border-0"
              placeholder="name@example.com"
              {...register("email", {
                required: "Email required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email",
                },
              })}
            />

            {errors.email && (
              <small className="text-danger">
                {errors.email.message}
              </small>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="form-label fw-bold small">
              Password
            </label>

            <input
              type="password"
              className="form-control p-3 bg-light border-0"
              placeholder="••••••••"
              {...register("password", {
                required: "Password required",
                minLength: {
                  value: 6,
                  message: "Min 6 characters",
                },
              })}
            />

            {errors.password && (
              <small className="text-danger">
                {errors.password.message}
              </small>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="mb-4">
            <label className="form-label fw-bold small">
              Confirm Password
            </label>

            <input
              type="password"
              className="form-control p-3 bg-light border-0"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

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

        {/* LOGIN SWITCH */}
        <div className="text-center mt-3">
          <span className="text-muted small">
            Already have an account?
          </span>

          <button
            className="btn btn-link text-decoration-none p-0 ms-1 fw-bold"
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
