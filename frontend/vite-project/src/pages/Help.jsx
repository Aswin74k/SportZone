import React from "react";

function Help() {
  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-3">Help Center</h2>
      <p className="text-muted">
        Need help? Contact us and we will get back to you shortly.
      </p>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="fw-bold mb-3">Contact</h5>
        <p className="mb-2">
          Email: <span className="fw-semibold">support@sportzone.com</span>
        </p>
        <p className="mb-0">
          Phone: <span className="fw-semibold">+91 90000 00000</span>
        </p>
      </div>
    </div>
  );
}

export default Help;

