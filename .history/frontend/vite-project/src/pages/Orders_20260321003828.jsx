import React, { useEffect, useState, useCallback } from "react";
import API from "../api";
import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);

  // 🔥 SAFE IMAGE FUNCTION (OUTSIDE MAP)
  const getImageUrl = (image) => {
    if (!image) return "/no-image.png";

    return image.startsWith("http")
      ? image
      : `http://127.0.0.1:8000${image}`;
  };

  // 🔥 FETCH ORDERS (OPTIMIZED)
  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("orders/");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 🔥 CANCEL ORDER
  const cancelOrder = async (id) => {
    try {
      await API.post(`orders/${id}/cancel/`);
      toast.success("Order cancelled ❌");
      fetchOrders();
    } catch {
      toast.error("Cannot cancel order");
    }
  };

  // 🔥 EMPTY STATE
  if (!orders.length) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold">No Orders Yet</h2>
        <p className="text-muted">Start shopping 🛒</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="card mb-4 shadow-sm border-0 rounded-4"
        >

          {/* 🔥 HEADER */}
          <div className="card-body border-bottom d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-1 fw-bold">Order #{order.id}</p>
              <small className="text-muted">
                {new Date(order.created_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </small>
            </div>

            <span
              className={`badge ${
                order.status === "Pending"
                  ? "bg-warning text-dark"
                  : "bg-danger"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* 🔥 ITEMS */}
          <div className="card-body">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="d-flex align-items-center mb-3 border-bottom pb-2"
              >
                {/* IMAGE */}
                <img
                  src={getImageUrl(item.product?.image)}
                  alt={item.product?.name}
                  loading="lazy"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                  }}
                  className="me-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/no-image.png";
                  }}
                />

                {/* DETAILS */}
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-semibold">
                    {item.product?.name}
                  </h6>
                  <small className="text-muted">
                    Qty: {item.quantity}
                  </small>
                </div>

                {/* PRICE */}
                <div className="fw-bold text-primary">
                  ₹{item.product?.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* 🔥 FOOTER */}
          <div className="card-body border-top d-flex justify-content-between align-items-center">
            <div className="fw-bold">
              Total: ₹{order.total_price}
            </div>

            {order.status === "Pending" && (
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                onClick={() => cancelOrder(order.id)}
              >
                Cancel Order
              </button>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}

export default Orders;