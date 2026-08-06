import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import API from "./api";

import Navbar from "./components/Navbar";
import StaffRoute from "./components/StaffRoute";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProductDetail from "./pages/ProductDetails/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout/Checkout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminReviews from "./pages/admin/AdminReviews";

import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";

function AppContent() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);
  const isAdminSection = location.pathname.startsWith("/admin");
  useEffect(() => {
  const token = localStorage.getItem("access");

  if (!token || isAdminSection) return;

  const interval = setInterval(() => {
    API.get("/profile/").catch(() => {});
  }, 10000); // Check every 10 seconds

  return () => clearInterval(interval);
}, [isAdminSection]);

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* 🔥 NAVBAR (Hidden on Auth Pages & Admin) */}
      {!isAuthPage && !isAdminSection && <Navbar />}

      {/* 🔥 MAIN CONTENT */}
      <main className="flex-grow-1 main-content">

        {/* 🔥 TOAST (Only in Admin Panel) */}
        {isAdminSection && (
          <ToastContainer
            position="top-center"
            autoClose={3200}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
            toastClassName="sz-toast"
          />
        )}

          <Routes>

            {/* 🔥 PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<AllProducts />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* 🔥 PROTECTED ROUTES */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />



            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            /

            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/admin"
              element={
                <StaffRoute>
                  <AdminLayout />
                </StaffRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>

            {/* 🔥 404 PAGE */}
            <Route
              path="*"
              element={
                <div className="sz-page">
                  <div className="container text-center py-5">
                    <h2 className="fw-bold">404 — Page not found</h2>
                    <p className="text-muted mb-4">This page does not exist on SportZone.</p>
                    <a href="/" className="btn sz-btn-sport">
                      Back to home
                    </a>
                  </div>
                </div>
              }
            />

          </Routes>

        </main>

      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;