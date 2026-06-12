import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function StaffRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAllowed(false);
      return;
    }

    let cancelled = false;

    API.get("profile/")
      .then((res) => {
        if (!cancelled) {
          setAllowed(!!res.data?.is_staff);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllowed(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (allowed === false) {
      toast.error("This area is restricted to staff accounts.");
    }
  }, [allowed]);

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Waiting for API response
  if (allowed === null) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Checking permissions...</p>
      </div>
    );
  }

  // Logged in but not staff
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  // Staff user
  return children;
}