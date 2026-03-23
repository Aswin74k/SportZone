import React, { useEffect, useState } from "react";
import API from "./api";
import { toast } from "react-toastify";

function Orders() {
  const [orders, setOrders] = useState([]);

  // 🔥 FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await API.get("orders/");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
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
        <div key={order.id} className="card mb-4 shadow-sm border-0 rounded-4">

          {/* 🔥 ORDER HEADER */}
          <div className="card-body border-bottom">
            <div className="d-flex justify-content-between align-items-center">

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
          </div>

          {/* 🔥 ORDER ITEMS */}
          <div className="card-body">
            {order.items.map((item) => {

              // 🔥 SAFE IMAGE FIX
              const imageUrl = item.product?.image
                ? item.product.image.startsWith("http")
                  ? item.product.image
                  : `http://127.0.0.1:8000${item.product.image}`
                : "/no-image.png";

              return (
                <div
                  key={item.id}
                  className="d-flex align-items-center mb-3 border-bottom pb-2"
                >

                  {/* IMAGE */}
                  <img
                    src={imageUrl}
                    alt={item.product?.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "contain",
                    }}
                    className="me-3"
                    onError={(e) => {
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
              );
            })}
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