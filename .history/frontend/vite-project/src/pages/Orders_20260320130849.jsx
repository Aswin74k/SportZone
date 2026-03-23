import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("orders/");
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (id) => {
    try {
      await API.post(`orders/${id}/cancel/`);
      toast.success("Order cancelled ❌");
      fetchOrders();
    } catch {
      toast.error("Cannot cancel this order");
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>No Orders Yet</h2>
        <p className="text-muted">Start shopping now 🛒</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-4">My Orders</h2>

      {orders.map((order) => (
        <div key={order.id} className="card mb-4 shadow-sm rounded-4 p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between mb-3">
            <div>
              <h5 className="fw-bold">Order #{order.id}</h5>
              <small className="text-muted">
                {new Date(order.created_at).toLocaleString()}
              </small>
            </div>

            <span className={`badge ${
              order.status === "Pending"
                ? "bg-warning text-dark"
                : order.status === "Cancelled"
                ? "bg-danger"
                : "bg-success"
            }`}>
              {order.status}
            </span>
          </div>

          {/* 🔥 PRODUCTS */}
          {order.items.map((item) => {

            const imageUrl = item.product_image?.startsWith("http")
              ? item.product_image
              : `http://127.0.0.1:8000${item.product_image}`;

            return (
              <div key={item.id} className="d-flex align-items-center mb-3 border-bottom pb-3">

                <img
                  src={imageUrl}
                  alt={item.product_name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain"
                  }}
                />

                <div className="ms-3 flex-grow-1">
                  <h6 className="fw-bold mb-1">{item.product_name}</h6>
                  <small className="text-muted">
                    Qty: {item.quantity}
                  </small>
                </div>

                <div className="fw-bold text-primary">
                  ₹{item.product_price}
                </div>

              </div>
            );
          })}

          {/* TOTAL */}
          <div className="d-flex justify-content-between mt-3">
            <strong>Total</strong>
            <strong className="text-primary">₹{order.total_price}</strong>
          </div>

          {/* CANCEL */}
          {order.status === "Pending" && (
            <button
              className="btn btn-danger mt-3 rounded-pill"
              onClick={() => cancelOrder(order.id)}
            >
              Cancel Order
            </button>
          )}

        </div>
      ))}

    </div>
  );
}

export default Orders;