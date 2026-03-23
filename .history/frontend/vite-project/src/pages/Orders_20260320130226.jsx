import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);

  // 🔥 FETCH ORDERS
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

  // 🔥 CANCEL ORDER
  const cancelOrder = async (id) => {
    try {
      await API.post(`orders/${id}/cancel/`);
      toast.success("Order cancelled ❌");
      fetchOrders(); // refresh
    } catch {
      toast.error("Cannot cancel this order");
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>No Orders Yet</h2>
        <p className="text-muted">Place your first order 🛒</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-4">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="card mb-4 border-0 shadow-sm rounded-4 p-4"
        >
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Order #{order.id}</h5>
              <small className="text-muted">
                {new Date(order.created_at).toLocaleString()}
              </small>
            </div>

            <span
              className={`badge ${
                order.status === "Pending"
                  ? "bg-warning text-dark"
                  : order.status === "Cancelled"
                  ? "bg-danger"
                  : "bg-success"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* TOTAL */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-medium">Total</span>
            <span className="fw-bold text-primary">
              ₹{order.total_price}
            </span>
          </div>

          {/* CANCEL BUTTON */}
          {order.status === "Pending" && (
            <button
              className="btn btn-danger rounded-pill px-4"
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