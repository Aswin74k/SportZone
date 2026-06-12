import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaHeart, FaHeadset, FaShieldAlt, FaFileContract, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import API from "../api";
import StoreShell from "../components/StoreShell";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("profile/");
        if (mounted) setUsername(res.data?.username || "");
      } catch {
        if (mounted) setUsername("");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const hiName = username || (loading ? "…" : "User");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("token");
    clearCart?.();
    window.dispatchEvent(new Event("logout"));
    toast.success("Logged out successfully 👋");
    navigate("/");
  };

  return (
    <StoreShell>
    <div className="account-page container py-4" style={{ maxWidth: '900px' }}>
      <div className="account-header text-center">
        <div className="account-avatar mx-auto mb-2">
          <FaUserCircle size={40} />
        </div>
        <h2 className="account-greeting">
          Hi, {hiName} 👋
        </h2>
      </div>

      <div className="account-grid row g-3 mt-1">
        <div className="col-md-6">
          <button
            type="button"
            className="account-card"
            onClick={() => navigate("/orders")}
          >
            <div className="account-card-icon">
              <FaBox size={20} />
            </div>
            <div className="account-card-title">Orders</div>
          </button>
        </div>

        <div className="col-md-6">
          <button
            type="button"
            className="account-card"
            onClick={() => navigate("/wishlist")}
          >
            <div className="account-card-icon">
              <FaHeart size={20} />
            </div>
            <div className="account-card-title">Wishlist</div>
          </button>
        </div>

        <div className="col-md-6">
          <button
            type="button"
            className="account-card"
            onClick={() => navigate("/help")}
          >
            <div className="account-card-icon">
              <FaHeadset size={20} />
            </div>
            <div className="account-card-title">Help Center</div>
          </button>
        </div>

        <div className="col-md-6">
          <button
            type="button"
            className="account-card"
            onClick={() => navigate("/privacy")}
          >
            <div className="account-card-icon">
              <FaShieldAlt size={20} />
            </div>
            <div className="account-card-title">Privacy Policy</div>
          </button>
        </div>

        <div className="col-md-6">
          <button
            type="button"
            className="account-card"
            onClick={() => navigate("/terms")}
          >
            <div className="account-card-icon">
              <FaFileContract size={20} />
            </div>
            <div className="account-card-title">Terms</div>
          </button>
        </div>

        {/* LOGOUT BUTTON IN GRID */}
        <div className="col-md-6">
          <button
            type="button"
            className="account-card text-danger border border-danger bg-transparent"
            style={{ borderStyle: 'solid' }}
            onClick={handleLogout}
          >
            <div className="account-card-icon bg-transparent text-danger">
              <FaUserCircle size={20} />
            </div>
            <div className="account-card-title text-danger">Logout</div>
          </button>
        </div>
      </div>
    </div>
    </StoreShell>
  );
}

export default Profile;

