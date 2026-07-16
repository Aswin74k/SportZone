import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import { toast } from "react-toastify";
import { mediaUrl } from "../utils/mediaUrl";
import StoreShell from "../components/StoreShell";
import { useCart } from "../context/CartContext";
import {
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaShoppingBag,
  FaCopy,
  FaRedo,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTruckMoving
} from "react-icons/fa";
import "./Orders.css";

const statusClass = (s) => {
  if (s === "Delivered") return "delivered";
  if (s === "Cancelled") return "cancelled";
  if (s === "Shipped") return "shipped";
  return "pending";
};

const getStatusIcon = (s) => {
  if (s === "Delivered") return <FaCheckCircle className="me-1" />;
  if (s === "Cancelled") return <FaTimesCircle className="me-1" />;
  if (s === "Shipped") return <FaTruck className="me-1" />;
  return <FaBoxOpen className="me-1" />;
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { addToCart } = useCart();

  const fetchOrders = async () => {
    try {
      const res = await API.get("orders/");
      const orderList = Array.isArray(res.data) ? res.data : [];
      setOrders(orderList);

      // Expand the first order by default if it's the first load
      if (orderList.length > 0) {
        setExpandedOrders((prev) => {
          if (Object.keys(prev).length === 0) {
            return { [orderList[0].id]: true };
          }
          return prev;
        });
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const confirmCancel = (order) => {
    setOrderToCancel(order);
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await API.post(`orders/${orderToCancel.id}/cancel/`);
      toast.success(`Order #${orderToCancel.id} cancelled successfully.`);
      setOrderToCancel(null);
      fetchOrders();
    } catch {
      toast.error("Could not cancel order. Please contact support.");
    }
  };

  const handleCopyOrderId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id.toString());
    toast.success("Order ID copied to clipboard!");
  };

  const handleBuyAgain = async (item) => {
    try {
      await addToCart({
        product_id: item.product_id,
        size: item.selected_size,
        quantity: 1,
      });
    } catch {
      toast.error("Failed to add product to cart");
    }
  };

  // Filter orders based on tabs
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return order.status === "Pending" || order.status === "Shipped";
    if (activeTab === "completed") return order.status === "Delivered";
    if (activeTab === "cancelled") return order.status === "Cancelled";
    return true;
  });

  return (
    <StoreShell>
      <div className="orders-container px-3 px-md-0">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <span className="sz-kicker mb-1">Track & Manage</span>
          <h1 className="display-6 fw-extrabold mb-2" style={{ color: "var(--sz-navy)" }}>My Orders</h1>
          <p className="text-muted small">View order status, request support, or cancel pending purchases.</p>
        </motion.div>

        {/* Filters Tabs */}
        <div className="mb-4">
          <div className="orders-tab-bar">
            {[
              { id: "all", label: "All Orders" },
              { id: "active", label: "In Progress" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`orders-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3 small">Retrieving your order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sz-section text-center py-5 bg-white rounded-4 border shadow-sm"
          >
            <div className="empty-orders-illustration">
              <FaShoppingBag />
            </div>
            <h3 className="fw-bold mb-2">No orders found</h3>
            <p className="text-muted mb-4">
              {activeTab === "all"
                ? "You haven't placed any orders yet. Ready to start shopping?"
                : `You don't have any orders under the "${activeTab}" filter right now.`}
            </p>
            <a href="/shop" className="btn btn-primary px-5 py-2.5 rounded-pill font-weight-bold">
              Explore SportZone Gear
            </a>
          </motion.div>
        ) : (
          filteredOrders.map((order, i) => {
            const isExpanded = !!expandedOrders[order.id];
            const createdDate = new Date(order.created_at);

            return (
              <motion.div
                key={order.id}
                className="order-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
              >
                {/* Header Summary (Click to Toggle) */}
                <div className="order-header-interactive" onClick={() => toggleExpand(order.id)}>
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <span className="order-number-title">Order #{order.id}</span>
                    <button
                      type="button"
                      className="copy-order-btn d-inline-flex align-items-center"
                      onClick={(e) => handleCopyOrderId(e, order.id)}
                      title="Copy Order ID"
                    >
                      <FaCopy className="me-1" /> Copy ID
                    </button>
                    <span className="text-muted d-none d-sm-inline">|</span>
                    <span className="text-muted small">
                      {createdDate.toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
                    <span className={`badge-status ${statusClass(order.status)} d-flex align-items-center`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <b className="fs-5" style={{ color: "var(--sz-navy)" }}>
                      ₹{Number(order.total_price).toFixed(0)}
                    </b>
                    {isExpanded ? <FaChevronUp className="text-muted" /> : <FaChevronDown className="text-muted" />}
                  </div>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="order-details-pane overflow-hidden"
                    >
                      <div className="p-4 border-top">
                        {/* Stepper Status (Only if not cancelled) */}
                        {order.status !== "Cancelled" ? (
                          <div className="stepper-wrapper p-3 mb-4">
                            <div className="stepper-container">
                              <div className="stepper-progress-line">
                                <div
                                  className="stepper-progress-fill"
                                  style={{
                                    width:
                                      order.status === "Pending"
                                        ? "33%"
                                        : order.status === "Shipped"
                                        ? "66%"
                                        : order.status === "Delivered"
                                        ? "100%"
                                        : "0%",
                                  }}
                                />
                              </div>
                              {[
                                { name: "Placed", check: true },
                                { name: "Processing", check: true },
                                { name: "Shipped", check: order.status === "Shipped" || order.status === "Delivered" },
                                { name: "Delivered", check: order.status === "Delivered" },
                              ].map((step, idx) => {
                                const isCompleted =
                                  order.status === "Delivered" ||
                                  (order.status === "Shipped" && idx <= 2) ||
                                  (order.status === "Pending" && idx <= 1);
                                const isActive =
                                  (order.status === "Pending" && idx === 1) ||
                                  (order.status === "Shipped" && idx === 2) ||
                                  (order.status === "Delivered" && idx === 3);

                                return (
                                  <div
                                    key={step.name}
                                    className={`step-node ${isCompleted ? "completed" : ""} ${
                                      isActive ? "active" : ""
                                    }`}
                                  >
                                    <div className="step-circle">
                                      {isCompleted ? <span className="fs-6">✓</span> : idx + 1}
                                    </div>
                                    <span className="step-label">{step.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-center mt-2">
                              <span className="small text-muted font-weight-medium">
                                {order.status === "Pending" && "🚀 Your order is being prepared and will ship soon."}
                                {order.status === "Shipped" && "🚚 Package is in transit. Est. delivery: 2-3 business days."}
                                {order.status === "Delivered" && "🎉 Delivered! We hope you love your new gear."}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3 py-2.5 px-3">
                            <FaExclamationTriangle className="flex-shrink-0" />
                            <span className="small fw-semibold">This order has been cancelled and refunded (if prepaid).</span>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="mb-4">
                          <h5 className="info-section-header">Items Summary</h5>
                          {order.items?.map((item, index) => (
                            <div
                              key={item.id}
                              className={`d-flex flex-wrap align-items-center gap-3 py-3 ${
                                index !== order.items.length - 1 ? "border-bottom" : ""
                              }`}
                            >
                              <a
                                href={`/shop`}
                                className="rounded-3 bg-light d-flex align-items-center justify-content-center p-2 flex-shrink-0 border"
                                style={{ width: 80, height: 80 }}
                              >
                                <img
                                  src={mediaUrl(item.product_image) || "/no-image.png"}
                                  alt=""
                                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                  onError={(e) => {
                                    e.target.src = "/no-image.png";
                                  }}
                                />
                              </a>
                              <div className="flex-grow-1 min-w-0">
                                <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: "0.95rem" }}>
                                  {item.product_name}
                                </h6>
                                <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
                                  <span>Size: <b className="text-dark">{item.selected_size}</b></span>
                                  <span>•</span>
                                  <span>Qty: <b className="text-dark">{item.quantity}</b></span>
                                  <span>•</span>
                                  <span>Price: <b className="text-dark">₹{Number(item.product_price).toFixed(0)}</b></span>
                                </div>
                              </div>
                              <div className="d-flex flex-column align-items-end gap-2">
                                <b className="fs-5" style={{ color: "var(--sz-navy)" }}>
                                  ₹{Number(item.product_price * item.quantity).toFixed(0)}
                                </b>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary order-item-btn"
                                  onClick={() => handleBuyAgain(item)}
                                >
                                  <FaRedo size={12} /> Buy Again
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Details (Address, Payment) Grid */}
                        <div className="row g-3 mb-4">
                          <div className="col-12 col-md-6">
                            <h5 className="info-section-header">Delivery Details</h5>
                            <div className="bg-light p-3 rounded-3 border h-100">
                              {order.shipping_name ? (
                                <div className="info-content-text">
                                  <div className="fw-bold mb-1 d-flex align-items-center gap-1">
                                    <FaUser size={12} className="text-muted" /> {order.shipping_name}
                                  </div>
                                  <div className="d-flex align-items-start gap-1 mb-1">
                                    <FaMapMarkerAlt size={12} className="text-muted mt-1" />
                                    <span>
                                      {order.shipping_address}, {order.shipping_city}, {order.shipping_state} -{" "}
                                      {order.shipping_pincode}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center gap-1">
                                    <FaPhoneAlt size={12} className="text-muted" /> {order.shipping_phone}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted small italic">No shipping information available.</span>
                              )}
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <h5 className="info-section-header">Payment Info</h5>
                            <div className="bg-light p-3 rounded-3 border h-100">
                              <div className="info-content-text">
                                <div className="mb-2">
                                  <span className="text-muted small block">Payment Method:</span>
                                  <div className="fw-bold d-flex align-items-center gap-1">
                                    <FaMoneyBillWave size={12} className="text-success" />
                                    {order.payment_method === "COD" ? "Cash on Delivery" : "Online Payment (Razorpay)"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted small block">Payment Status:</span>
                                  <div>
                                    <span
                                      className={`badge rounded-pill px-2.5 py-1 ${
                                        order.payment_status === "Paid"
                                          ? "bg-success"
                                          : order.payment_status === "Failed"
                                          ? "bg-danger"
                                          : "bg-warning text-dark"
                                      }`}
                                      style={{ fontSize: "0.72rem" }}
                                    >
                                      {order.payment_status || "Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions footer */}
                        <div className="d-flex justify-content-end align-items-center gap-2 pt-3 border-top">
                          {order.status === "Pending" && (
                            <button
                              type="button"
                              className="btn btn-outline-danger rounded-pill px-4 btn-sm"
                              onClick={() => confirmCancel(order)}
                            >
                              Cancel Order
                            </button>
                          )}
                          {order.status !== "Cancelled" && (
                            <button
                              type="button"
                              className="btn btn-dark rounded-pill px-4 btn-sm d-inline-flex align-items-center gap-1"
                              onClick={() => {
                                toast.info(`Mock Tracking carrier loaded. Package tracking ID: SZ-${order.id}924`);
                              }}
                            >
                              <FaTruckMoving /> Track Shipment
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pure React Cancellation Modal */}
      <AnimatePresence>
        {orderToCancel && (
          <div className="sz-modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sz-modal-card p-4"
            >
              <div className="text-center">
                <div
                  className="bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "60px", height: "60px", backgroundColor: "#ffebeb" }}
                >
                  <FaExclamationTriangle size={28} className="text-danger" />
                </div>
                <h4 className="fw-bold mb-2">Cancel Order #{orderToCancel.id}?</h4>
                <p className="text-muted small mb-3">
                  Are you sure you want to cancel this order? This action cannot be undone. You will receive refunds if payment has already been captured.
                </p>

                {/* Cancelled Item Details (Product image, name, size if any) */}
                <div className="text-start border rounded-3 p-3 mb-4 bg-light" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <span className="text-muted small mb-2 d-block font-weight-bold text-uppercase" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                    Items to cancel:
                  </span>
                  {orderToCancel.items?.map((item) => (
                    <div key={item.id} className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom last-border-0">
                      <div className="rounded border bg-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, padding: 2 }}>
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
                        <div className="small fw-bold text-truncate" style={{ fontSize: "0.85rem" }}>{item.product_name}</div>
                        <div className="text-muted extra-small" style={{ fontSize: "0.72rem" }}>
                          Qty: {item.quantity} 
                          {item.selected_size && item.selected_size !== "N/A" && ` • Size: ${item.selected_size}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 flex-grow-1"
                    onClick={() => setOrderToCancel(null)}
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4 flex-grow-1"
                    onClick={cancelOrder}
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StoreShell>
  );
}

export default Orders;
