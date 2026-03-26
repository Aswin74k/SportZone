import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import API from "../api"; // 🔥 ADD THIS
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    fetchCart, // ✅ IMPORTANT (not fetchCartFromBackend)
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const [loading, setLoading] = useState(false);

  // 🔥 LOAD CART
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 🔥 CHECKOUT
  // pages/Cart.jsx (ONLY REPLACE THESE PARTS)

  const checkout = async () => {
    setLoading(true);
    try {
      await API.post("orders/checkout/");
      toast.success("Order placed successfully 🎉");
      fetchCart();
    } catch {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 EMPTY CART
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">Your Cart is Empty</h2>
        <p className="text-muted">Start shopping now 🛒</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-4">Shopping Cart</h2>

      <div className="row">

        {/* 🔥 CART ITEMS */}
        <div className="col-lg-8">

          {cartItems.map((item) => {

            // 🔥 SAFE IMAGE URL (handles absolute + relative paths)
            const rawImage = item.product?.image;
            const imageUrl = rawImage
              ? rawImage.startsWith("http")
                ? rawImage
                : `http://127.0.0.1:8000${rawImage}`
              : "/no-image.png";

            return (
              <div
                className="card mb-3 border-0 rounded-card shadow-sm cart-item-card"
                key={item.id}
              >
                <div className="row g-0 align-items-center">

                  {/* IMAGE */}
                  <div className="col-md-3 p-3 d-flex align-items-center justify-content-center">
                    <img
                      src={imageUrl}
                      alt={item.product?.name}
                      style={{
                        height: "160px",
                        width: "160px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="col-md-5 p-3">
                    <h5 className="fw-bold text-dark mb-1">{item.product?.name}</h5>
                    
                    <div className="text-muted small mb-2 d-flex flex-wrap gap-3">
                      <span>Category: <span className="fw-medium text-dark">{item.product?.category}</span></span><br /><br />
                      {(item.size || item.product?.size) && (
                        <span>Size: <span className="fw-medium text-dark">{item.size || item.product.size}</span></span>
                      )}
                    </div>

                    {item.product?.description && (
                      <p 
                        className="text-muted small mb-2"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {item.product.description}
                      </p>
                    )}

                    <div className="fw-bold text-primary fs-5 mt-1">
                      ₹{Number(item.product?.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  {/* QUANTITY */}
                  <div className="col-md-2 d-flex align-items-center justify-content-center">
                    <div className="bg-light rounded-pill d-flex align-items-center px-2 py-1 border">
                      <button
                        className="btn btn-sm btn-link text-dark text-decoration-none fw-bold fs-6"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeFromCart(item.id);
                          }
                        }}
                      >
                        -
                      </button>
                      <span className="mx-3 fw-semibold text-dark">{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-link text-dark text-decoration-none fw-bold fs-6"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="col-md-1 text-center fw-bold text-dark">
                    ₹{Number((item.product?.price || 0) * item.quantity).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>

                  {/* DELETE */}
                  <div className="col-md-1 text-center">
                    <button
                      className="btn btn-light text-danger rounded-circle p-2 hover-shadow border-0"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove Item"
                    >
                      <FaTrash size={14} className="mb-1" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {/* 🔥 SUMMARY */}
        <div className="col-lg-4">

          <div className="card rounded-card border-0 shadow-sm p-4 cart-summary">

            <h4 className="fw-bold mb-3 text-dark">Order Summary</h4>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal</span>
              <span className="fw-semibold text-dark">₹{Number(cartTotal || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Shipping</span>
              <span className="text-success fw-semibold">Free</span>
            </div>

            <hr className="text-muted opacity-25" />

            <div className="d-flex justify-content-between fw-bold mb-4 fs-5">
              <span className="text-dark">Total</span>
              <span className="text-primary">₹{Number(cartTotal || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>

            <button
              className="btn btn-primary w-100 rounded-pill hover-shadow py-2 fw-semibold"
              onClick={checkout}              
              disabled={loading}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          

          </div>

        </div>

      </div>
    </div>
  );
}

export default Cart;