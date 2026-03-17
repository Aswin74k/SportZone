import { Navigate } from "react-router-dom";

const handleAddToCart = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login to add items 😢");
    return;
  }

  addToCart(product);
};

export default ProtectedRoute;