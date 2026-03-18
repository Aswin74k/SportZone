import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.info("Please login to access your cart");
    setTimeout(() => {
        window.dispatchEvent(new Event("openLoginModal"));
    }, 50);
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;