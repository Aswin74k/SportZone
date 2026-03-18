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
    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
from django.utils.timezone import now
from datetime import timedelta
import random

from .models import EmailOTP


def generate_otp():
    return str(random.randint(100000, 999999))


# 🔥 REGISTER (NO USERNAME SYSTEM)
@api_view(['POST'])
def register_user(request):

    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not name:
        return Response({"error": "Name is required"}, status=400)

    if not email:
        return Response({"error": "Email is required"}, status=400)

    if not password:
        return Response({"error": "Password is required"}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    # 🔥 username = email (internal use)
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name
    )

    return Response({
        "message": "Account created successfully",
        "name": user.first_name
    })


# 🔥 LOGIN WITH EMAIL
@api_view(['POST'])
def login_user(request):

    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Email & password required"}, status=400)

    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return Response({"error": "User not found"}, status=400)

    user = authenticate(username=user_obj.username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        # 🔥 send name to frontend
        refresh['name'] = user.first_name

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    return Response({"error": "Invalid email or password"}, status=400)


# 🔥 FORGOT PASSWORD (OTP)
@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=400)

    otp = generate_otp()

    EmailOTP.objects.filter(email=email).delete()
    EmailOTP.objects.create(email=email, otp=otp)

    send_mail(
        "SportZone Password Reset",
        f"Your OTP is {otp}",
        "your_email@gmail.com",
        [email],
        fail_silently=False,
    )

    return Response({"message": "OTP sent successfully"})


# 🔥 VERIFY OTP
@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    record = EmailOTP.objects.filter(email=email, otp=otp).last()

    if not record:
        return Response({"error": "Invalid OTP"}, status=400)

    if now() - record.created_at > timedelta(minutes=5):
        return Response({"error": "OTP expired"}, status=400)

    return Response({"message": "OTP verified"})


# 🔥 RESET PASSWORD
@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    user.set_password(password)
    user.save()

    EmailOTP.objects.filter(email=email).delete()

    return Response({"message": "Password reset successful"})
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Account created successfully 🎉");
        handleClose();
        openLogin();
      } else {
        toast.error(result.error || "Signup failed!");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div
      className="modal d-block fade show transition-all"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered transition-all" style={{ transition: "transform 0.3s ease-out" }}>
        <div className="modal-content border-0 rounded-4 shadow-lg my-4 transition-all">

          <div className="modal-header border-bottom-0 pb-0 px-4 pt-4 d-flex justify-content-between">
            <h4 className="fw-bold mb-0 text-dark">Create Account</h4>
            <button className="btn-close shadow-none hover-lift transition-all" onClick={handleClose}></button>
          </div>

          <div className="modal-body p-4 pt-2">
            <p className="text-muted small mb-4 fw-medium">
              Join SportZone for faster checkout and exclusive offers
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-2 mb-3">
                <div className="col-6 position-relative">
                  <label className="form-label fw-bold small text-muted">First Name</label>
                  <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                    <span className="input-group-text bg-light border-0"><FaUser className="text-muted" /></span>
                    <input
                      className="form-control bg-light border-0 p-3 shadow-none transition-all"
                      placeholder="John"
                      {...register("firstName", { required: "Required" })}
                    />
                  </div>
                  {errors.firstName && <small className="text-danger mt-1 d-block fw-medium">{errors.firstName.message}</small>}
                </div>

                <div className="col-6 position-relative">
                  <label className="form-label fw-bold small text-muted">Last Name</label>
                  <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                    <span className="input-group-text bg-light border-0"><FaUser className="text-muted" /></span>
                    <input
                      className="form-control bg-light border-0 p-3 shadow-none transition-all"
                      placeholder="Doe"
                      {...register("lastName", { required: "Required" })}
                    />
                  </div>
                  {errors.lastName && <small className="text-danger mt-1 d-block fw-medium">{errors.lastName.message}</small>}
                </div>
              </div>

              <div className="mb-3 position-relative">
                <label className="form-label fw-bold small text-muted">Email Address</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                  <span className="input-group-text bg-light border-0"><FaEnvelope className="text-muted" /></span>
                  <input
                    type="email"
                    className="form-control bg-light border-0 p-3 shadow-none transition-all"
                    placeholder="name@example.com"
                    {...register("email", {
                      required: "Email required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                    })}
                  />
                </div>
                {errors.email && <small className="text-danger mt-1 d-block fw-medium">{errors.email.message}</small>}
              </div>

              <div className="mb-3 position-relative">
                <label className="form-label fw-bold small text-muted">Password</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                  <span className="input-group-text bg-light border-0"><FaLock className="text-muted" /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-light border-0 p-3 shadow-none transition-all"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password required",
                      minLength: { value: 6, message: "Min 6 characters" },
                    })}
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

              <div className="mb-4 position-relative">
                <label className="form-label fw-bold small text-muted">Confirm Password</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden transition-all">
                  <span className="input-group-text bg-light border-0"><FaLock className="text-muted" /></span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control bg-light border-0 p-3 shadow-none transition-all"
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Confirm your password",
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  <button 
                    type="button" 
                    className="input-group-text bg-light border-0 hover-lift transition-all" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                  </button>
                </div>
                {errors.confirmPassword && <small className="text-danger mt-1 d-block fw-medium">{errors.confirmPassword.message}</small>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-100 p-3 rounded-pill fw-bold hover-shadow transition-all"
                style={{ transition: "all 0.3s ease" }}
              >
                {isSubmitting ? (
                   <>
                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                     Creating Account...
                   </>
                ) : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted small fw-medium">
                Already have an account?
              </span>
              <button
                className="btn btn-link text-decoration-none p-0 ms-1 fw-bold text-primary hover-lift transition-all"
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