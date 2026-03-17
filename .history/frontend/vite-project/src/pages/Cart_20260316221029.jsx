import React from "react";
import { useCart } from "../context/CartContext";
import { FaTrash } from "react-icons/fa";
import "./Cart.css";

function Cart() {

  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">Your Cart is Empty</h2>
        <p className="text-muted">Looks like you haven't added anything yet.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-4">Shopping Cart</h2>

      <div className="row">

        {/* Cart Items */}
        <div className="col-lg-8">

          {cartItems.map(item => (

            <div className="card mb-3 border-0 shadow-sm cart-item-card" key={item.id}>

              <div className="row g-0 align-items-center">

                <div className="col-md-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid rounded-start cart-product-img"
                  />
                </div>

                <div className="col-md-5 p-3">

                  <h5 className="fw-bold mb-2">
                    {item.name}
                  </h5>

                  <p className="text-muted small mb-0">
                    Category: {item.category || "Sports"}
                  </p>

                </div>

                <div className="col-md-2 text-center">

                  <div className="quantity-box">

                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>

                    <span className="mx-2">
                      {item.quantity}
                    </span>

                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="col-md-1 text-center fw-bold">
                  ₹{item.price}
                </div>

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

          ))}

        </div>

        {/* Cart Summary */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm p-4 cart-summary">

            <h4 className="fw-bold mb-3">
              Order Summary
            </h4>

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <span>Shipping</span>
              <span className="text-success">Free</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold mb-4">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>

            <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold">
              Proceed to Checkout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Cart;