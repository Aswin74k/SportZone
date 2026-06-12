import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api";
import { toast } from "react-toastify";
import { mediaUrl } from "../utils/mediaUrl";
import StoreShell from "../components/StoreShell";

const statusClass = (s) => {
  if (s === "Delivered") return "bg-success";
  if (s === "Cancelled") return "bg-danger";
  if (s === "Shipped") return "bg-primary";
  return "bg-warning text-dark";
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await API.get("orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  return (
    <StoreShell>
      <div className="container-fluid container-xl" style={{ maxWidth: 920 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="sz-kicker mb-1">Track gear</p>
          <h1 className="h3 fw-bold">My orders</h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-3 small">Loading orders…</p>
          </div>
        ) : !orders.length ? (
          <div className="sz-section text-center py-5">
            <h3 className="fw-bold">No orders yet</h3>
            <p className="text-muted">Your SportZone purchases will show up here.</p>
          </div>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order.id}
              className="sz-section mb-3 p-0 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 border-bottom bg-light">
                <div>
                  <span className="fw-bold">Order #{order.id}</span>
                  <div className="small text-muted">
                    {new Date(order.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <span className={`badge rounded-pill px-3 py-2 ${statusClass(order.status)}`}>{order.status}</span>
              </div>

              <div className="px-4 py-3">
                {order.items?.map((item, index) => (
                  <div
                    key={item.id}
                    className={`d-flex align-items-center gap-3 ${index !== order.items.length - 1 ? "border-bottom pb-3 mb-3" : ""}`}
                  >
                    <div
                      className="rounded-3 bg-light d-flex align-items-center justify-content-center p-2 flex-shrink-0"
                      style={{ width: 72, height: 72 }}
                    >
                      <img
                        src={mediaUrl(item.product_image) || "/no-image.png"}
                        alt=""
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h6 className="fw-semibold mb-0 text-truncate">{item.product_name}</h6>
                      <small className="text-muted">Qty {item.quantity}</small>
                    </div>
                    <b className="text-nowrap" style={{ color: "var(--sz-navy)" }}>
                      ₹{Number(item.product_price * item.quantity).toFixed(0)}
                    </b>
                  </div>
                ))}
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center px-4 py-3 border-top bg-light">
                <span className="fw-bold fs-5">Total ₹{Number(order.total_price).toFixed(0)}</span>
                {order.status === "Pending" && (
                  <button type="button" className="btn btn-outline-danger btn-sm rounded-pill px-4" onClick={() => cancelOrder(order.id)}>
                    Cancel order
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </StoreShell>
  );
}

export default Orders;
