import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
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
  }, []);

  // 🔥 CHECKOUT
  const checkout = async () => {
    try {
      setLoading(true);
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

            // 🔥 SAFE IMAGE URL
            const imageUrl = item.product?.image?.startsWith("http")
              ? item.product.image
              : `http://127.0.0.1:8000${item.product?.image}`;

            return (
              <div
                className="card mb-3 border-0 shadow-sm rounded-4"
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
                    <h5 className="fw-bold">{item.product?.name}</h5>
                    <p className="text-muted small">
                      Category: {item.product?.category}
                    </p>
                    <p className="fw-bold text-primary">
                      ₹{item.product?.price}
                    </p>
                  </div>

                  {/* QUANTITY */}
                  <div className="col-md-2 text-center">
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <span className="mx-2">{item.quantity}</span>

                    <button
                      className="btn btn-sm btn-light"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  {/* TOTAL */}
                  <div className="col-md-1 text-center fw-bold">
                    ₹{item.product?.price * item.quantity}
                  </div>

                  {/* DELETE */}
                  <div className="col-md-1 text-center">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {/* 🔥 SUMMARY */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm p-4 rounded-4">

            <h4 className="fw-bold mb-3">Order Summary</h4>

            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <span>Shipping</span>
              <span className="text-success">Free</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>

            <button
              className="btn btn-primary w-100 rounded-pill"
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