import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🔥 CONTEXT
import { CartProvider } from './context/CartContext';

// 🔥 COMPONENTS
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// 🔥 PAGES
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Cart from './pages/Cart';

// 🔥 TOAST
import { ToastContainer } from 'react-toastify';

// 🔥 STYLES
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';

function App() {
  return (
    <CartProvider> {/* 🔥 VERY IMPORTANT */}
      
      <Router>
        <div className="d-flex flex-column min-vh-100">

          {/* 🔥 NAVBAR */}
          <Navbar />

          {/* 🔥 MAIN CONTENT */}
          <main className="flex-grow-1 main-content">

            {/* 🔥 TOAST */}
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
            />

            {/* 🔥 ROUTES */}
            <Routes>

              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<AllProducts />} />

              {/* 🔒 PROTECTED CART */}
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