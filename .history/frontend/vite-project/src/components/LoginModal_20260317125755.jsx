import React from "react";
import { useForm } from "react-hook-form";

const LoginModal = ({ show, handleClose, openSignup }) => {

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
username: data.email,
password: data.password,
}),
});

```
  const result = await res.json();

  if (res.ok) {
    localStorage.setItem("token", result.access);

    alert("Login successful 🔥");
    handleClose();
    window.location.reload();
  } else {
    alert("Invalid email or password ❌");
  }

} catch (err) {
  console.log(err);
  alert("Server error 😢");
}
```

};

return (
<div
className="modal d-block"
tabIndex="-1"
style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
> <div className="modal-dialog modal-dialog-centered"> <div className="modal-content border-0 rounded-4 shadow-lg">

```
      <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
        <h5 className="modal-title fw-bold fs-3 mt-2">
          Welcome Back
        </h5>
        <button
          type="button"
          className="btn-close shadow-none"
          onClick={handleClose}
        ></button>
      </div>

      <div className="modal-body p-4 pt-2">

        <p className="text-muted small mb-4">
          Sign in to your SportZone account
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label fw-bold small">
              Email address
            </label>

            <input
              type="email"
              className="form-control p-3 bg-light border-0"
              placeholder="name@example.com"
              {...register("email", {
                required: "Email is required",
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
          <div className="mb-4">
            <div className="d-flex justify-content-between">
              <label className="form-label fw-bold small">
                Password
              </label>

              <button
                type="button"
                className="btn btn-link p-0 small text-primary"
                onClick={() => alert("Forgot password feature next 🔥")}
              >
                Forgot?
              </button>
            </div>

            <input
              type="password"
              className="form-control p-3 bg-light border-0"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
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

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-100 p-3 rounded-pill fw-bold"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* SIGNUP */}
        <div className="text-center mt-3">
          <span className="text-muted small">
            Don't have an account?
          </span>

          <button
            className="btn btn-link text-decoration-none p-0 ms-1 fw-bold"
            onClick={openSignup}
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  </div>
</div>
```

);
};

export default LoginModal;
