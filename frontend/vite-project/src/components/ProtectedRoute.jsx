import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access") || localStorage.getItem("token");

  if (!token) {
    toast.info("Please login to continue");
    window.dispatchEvent(new Event("openLoginModal"));
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;