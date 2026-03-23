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
    (async () => {
      await fetchOrders();
    })();
  }, []);

  const cancelOrder = async (id) => {
    try {
      await API.post(`orders/${id}/cancel/`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch {
      toast.error("Cannot cancel");
    }
  };

  if (!orders.length)
    return (
      <div className="text-center mt-5">
        <h3>No Orders Yet</h3>
      </div>
    );

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">My Orders</h2>

      {orders.map((order) => (
        <div key={order.id} className="card mb-4 shadow-sm">

          {/* HEADER */}
          <div className="card-body border-bottom d-flex justify-content-between">
            <div>
              <b>Order #{order.id}</b>
              <br />
              <small>
                {new Date(order.created_at).toLocaleString("en-IN")}
              </small>
            </div>

            <span className="badge bg-warning text-dark">
              {order.status}
            </span>
          </div>

          {/* ITEMS */}
          <div className="card-body">
            {order.items.map((item) => (
              <div key={item.id} className="d-flex align-items-center mb-3">

                {/* 🔥 IMAGE FROM BACKEND */}
                <img
                  src={item.product_image}
                  alt=""
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    borderRadius: "10px"
                  }}
                />

                <div className="ms-3 flex-grow-1">
                  <h6>{item.product_name}</h6>
                  <small>Qty: {item.quantity}</small>
                </div>

                <b>₹{item.product_price * item.quantity}</b>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="card-body border-top d-flex justify-content-between">
            <b>Total: ₹{order.total_price}</b>

            {order.status === "Pending" && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => cancelOrder(order.id)}
              >
                Cancel
              </button>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}

export default Orders;