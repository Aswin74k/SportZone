import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    toast.info("Please login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;