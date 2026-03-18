import React, { useEffect, useState } from "react";
import API from "../api";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "./Cart.css";

function Cart() {

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH CART
  const fetchCart = async () => {
    try {
      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load cart");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 🔥 REMOVE ITEM
  const removeFromCart = async (id) => {
    try {
      await API.delete(`cart/${id}/`);
      toast.success("Item removed");
      fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  // 🔥 UPDATE QUANTITY
  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    try {
      await API.patch(`cart/${id}/`, { quantity });
      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  // 🔥 CHECKOUT
  const checkout = async () => {
    try {
      setLoading(true);
      await API.post("orders/checkout/");
      toast.success("Order placed successfully 🎉");
      fetchCart();
    } catch {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  if (cartItems.length === 0) {
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

        {/* CART ITEMS */}
        <div className="col-lg-8">

          {cartItems.map(item => (

            <div className="card mb-3 border-0 shadow-sm" key={item.id}>

              <div className="row g-0 align-items-center">

                {/* IMAGE */}
                <div className="col-md-3">
                  <img
                    src={`http://127.0.0.1:8000${item.product.image}`}
                    alt={item.product.name}
                    className="img-fluid rounded-start"
                  />
                </div>

                {/* DETAILS */}
                <div className="col-md-5 p-3">
                  <h5 className="fw-bold mb-2">
                    {item.product.name}
                  </h5>

                  <p className="text-muted small mb-0">
                    Category: {item.product.category}
                  </p>
                </div>

                {/* QUANTITY */}
                <div className="col-md-2 text-center">

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

                {/* PRICE */}
                <div className="col-md-1 text-center fw-bold">
                  ₹{item.product.price}
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

          ))}

        </div>

        {/* SUMMARY */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm p-4">

            <h4 className="fw-bold mb-3">Order Summary</h4>

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

            <button
              className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
              onClick={checkout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Cart;