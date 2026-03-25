import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">

        {/* 🔥 NAVBAR */}
        <Navbar />

        {/* 🔥 MAIN CONTENT */}
        <main className="flex-grow-1 main-content">

          {/* 🔥 TOAST */}
          <ToastContainer position="top-center" autoClose={3000} />

          <Routes>

            {/* 🔥 PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<AllProducts />} />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
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

            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* 🔥 404 PAGE */}
            <Route
              path="*"
              element={
                <div className="container text-center py-5">
                  <h2 className="fw-bold">404 - Page Not Found</h2>
                  <p className="text-muted">
                    The page you are looking for does not exist.
                  </p>
                </div>
              }
            />

          </Routes>

        </main>

      </div>
    </Router>
  );
}

export default App;