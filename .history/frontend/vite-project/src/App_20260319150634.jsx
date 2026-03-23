import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Cart from './pages/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext'; // 🔥 IMPORTANT
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';

function App() {
  return (
    <CartProvider> {/* 🔥 MUST */}
      <Router>
        <div className="d-flex flex-column min-vh-100">

          <Navbar />

          <main className="flex-grow-1 main-content">

            <ToastContainer position="top-center" autoClose={3000} />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<AllProducts />} />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
            </Routes>

          </main>

        </div>
      </Router>
    </CartProvider>
  );
}

export default App;