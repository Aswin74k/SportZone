import React from "react";

const LogoutModal = ({ show, handleClose, handleLogout }) => {
  if (!show) return null;

  return (
    <div
      className="modal d-block fade show"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 1055,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 p-4 text-center shadow-lg">

          {/* TITLE */}
          <h4 className="fw-bold mb-3 text-dark">
            Logout?
          </h4>

          {/* MESSAGE */}
          <p className="text-muted fw-medium mb-4">
            Are you sure you want to logout?
          </p>

          {/* BUTTONS */}
          <div className="d-flex justify-content-center gap-3">

            {/* CANCEL */}
            <button
              className="btn btn-secondary rounded-pill px-4 py-2 fw-bold hover-shadow"
              onClick={handleClose}
            >
              Cancel
            </button>

            {/* LOGOUT */}
            <button
              className="btn btn-danger rounded-pill px-4 py-2 fw-bold hover-shadow"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;