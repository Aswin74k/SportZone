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
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <h3 className="fw-bold mb-4 text-dark">My Orders</h3>

      {orders.map((order) => (
        <div key={order.id} className="card rounded-card mb-4 border-0">

          {/* HEADER */}
          <div className="card-body border-bottom bg-light d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <div>
              <b className="text-dark">Order #{order.id}</b>
              <br />
              <small className="text-secondary">
                {new Date(order.created_at).toLocaleString("en-IN", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </small>
            </div>

            <span className={`badge px-3 py-2 rounded-pill ${order.status === 'Delivered' ? 'bg-success' : order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>
              {order.status}
            </span>
          </div>

          {/* ITEMS */}
          <div className="card-body px-4 py-4">
            {order.items.map((item, index) => (
              <div key={item.id} className={`d-flex align-items-center ${index !== order.items.length - 1 ? 'border-bottom pb-3 mb-3' : ''}`}>

                {/* 🔥 IMAGE FROM BACKEND */}
                <div className="bg-light rounded d-flex align-items-center justify-content-center p-2" style={{ width: "90px", height: "90px" }}>
                  <img
                    src={item.product_image || "/no-image.png"}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain"
                    }}
                    onError={(e) => { e.target.src = "/no-image.png"; }}
                  />
                </div>

                <div className="ms-4 flex-grow-1">
                  <h6 className="fw-bold mb-1">{item.product_name}</h6>
                  <small className="text-secondary">Qty: {item.quantity}</small>
                </div>

                <div className="text-end">
                  <b className="text-primary d-block">₹{Number(item.product_price * item.quantity).toFixed(2)}</b>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="card-body border-top bg-light d-flex justify-content-between align-items-center" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <b className="text-dark fs-5">Total: ₹{Number(order.total_price).toFixed(2)}</b>

            {order.status === "Pending" && (
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-4 hover-shadow"
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