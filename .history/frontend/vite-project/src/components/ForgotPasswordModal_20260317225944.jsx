import React, { useState } from "react";

const ForgotPasswordModal = ({ show, handleClose }) => {

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  if (!show) return null;

  // 🔥 SEND OTP
  const sendOtp = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP sent to your email 📩");
        setStep(2);
      } else {
        alert(data.error);
      }

    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok) {
        setStep(3);
      } else {
        alert(data.error);
      }

    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  // 🔥 RESET PASSWORD
  const resetPassword = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful 🎉");
        handleClose();
        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
      } else {
        alert(data.error);
      }

    } catch {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg">

          {/* HEADER */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold fs-3 mt-2">
              Reset Password
            </h5>

            <button
              className="btn-close shadow-none"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body p-4 pt-2">

            <p className="text-muted small mb-4">
              Follow the steps to reset your password
            </p>

            {/* STEP INDICATOR */}
            <div className="d-flex justify-content-between mb-4 text-center small">
              <div className={step >= 1 ? "fw-bold text-primary" : "text-muted"}>
                Email
              </div>

              <div className={step >= 2 ? "fw-bold text-primary" : "text-muted"}>
                OTP
              </div>

              <div className={step >= 3 ? "fw-bold text-primary" : "text-muted"}>
                Reset
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <label className="form-label fw-bold small">
                  Enter your email
                </label>

                <input
                  type="email"
                  className="form-control p-3 bg-light border-0 mb-3"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="btn btn-primary w-100 p-3 rounded-pill fw-bold"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <label className="form-label fw-bold small">
                  Enter OTP
                </label>

                <input
                  className="form-control p-3 bg-light border-0 mb-3"
                  placeholder="6 digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  className="btn btn-primary w-100 p-3 rounded-pill fw-bold"
                  onClick={verifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <label className="form-label fw-bold small">
                  New Password
                </label>

                <input
                  type="password"
                  className="form-control p-3 bg-light border-0 mb-3"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  className="btn btn-success w-100 p-3 rounded-pill fw-bold"
                  onClick={resetPassword}
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;