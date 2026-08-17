import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
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
  FaClock,
  FaCopy,
  FaRedo,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaExclamationTriangle,
  FaStar,
  FaEye,
  FaShoppingBag,
  FaArrowRight,
  FaCreditCard,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaRunning,
  FaFlagCheckered,
} from "react-icons/fa";
import "./Orders.css";

/* ---------------- constants ---------------- */

const STATUS_META = {
  Pending: { label: "Pending", cls: "pending", icon: FaClock, step: 1 },
  Processing: { label: "Processing", cls: "processing", icon: FaBoxOpen, step: 2 },
  Shipped: { label: "Shipped", cls: "shipped", icon: FaTruck, step: 3 },
  Delivered: { label: "Delivered", cls: "delivered", icon: FaCheckCircle, step: 4 },
  Cancelled: { label: "Cancelled", cls: "cancelled", icon: FaTimesCircle, step: 0 },
};

const TRACK_STEPS = [
  { key: "Pending", label: "Placed" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
];

const FILTER_TABS = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const inFlight = (status) => ["Pending", "Processing", "Shipped"].includes(status);

/* ---------------- helpers ---------------- */

const formatINR = (value) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

const getUnitPrice = (item) =>
  item.unit_price ? Number(item.unit_price) : Number(item.product_price) / (Number(item.quantity) || 1);

const withFallbackImage = (e) => {
  e.target.onerror = null;
  e.target.src = "/no-image.png";
};

/* ---------------- presentational pieces ---------------- */

function OrdersSkeleton() {
  return (
    <div className="orders-skeleton" aria-busy="true" aria-label="Loading orders">
      {[1, 2].map((n) => (
        <div key={n} className="skeleton-card">
          <div className="skeleton-row">
            <span className="sk sk-title" />
            <span className="sk sk-badge" />
          </div>
          <span className="sk sk-track" />
          <div className="skeleton-item">
            <span className="sk sk-thumb" />
            <div className="skeleton-item-lines">
              <span className="sk sk-line" style={{ width: "60%" }} />
              <span className="sk sk-line" style={{ width: "35%" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ showReset, onReset }) {
  return (
    <div className="orders-empty">
      <div className="empty-icon"><FaShoppingBag /></div>
      <h2>No orders yet</h2>
      <p>Looks like you haven&apos;t placed any orders yet.</p>
      <div className="empty-actions">
        {showReset && (
          <button type="button" className="btn-ghost" onClick={onReset}>
            View All Orders
          </button>
        )}
        <Link to="/shop" className="btn-dark">
          Continue Shopping <FaArrowRight />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const Icon = meta.icon;
  return (
    <span className={`status-badge ${meta.cls}`}><Icon /> {meta.label}</span>
  );
}

function OrderTimeline({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="cancelled-note">
        <FaExclamationTriangle />
        <div>
          <strong>Order Cancelled</strong>
          <p>Payment refund (if captured) has been processed.</p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_META[status]?.step || 1;
  const fillPercent = ((currentStep - 1) / (TRACK_STEPS.length - 1)) * 100;
  const isDelivered = status === "Delivered";

  return (
    <div className="timeline">
      <div className="timeline-track">
        <div className="timeline-fill" style={{ width: `${fillPercent}%` }} />
        {!isDelivered && (
          <span className="timeline-runner" style={{ left: `${fillPercent}%` }} aria-hidden="true">
            <FaRunning />
          </span>
        )}
      </div>
      <div className="timeline-steps">
        {TRACK_STEPS.map((step, idx) => {
          const done = currentStep >= idx + 1;
          const isFinish = idx === TRACK_STEPS.length - 1;
          return (
            <div key={step.key} className={`timeline-step ${done ? "done" : ""}`}>
              <span className="timeline-dot">
                {isFinish ? <FaFlagCheckered /> : done ? <FaCheck /> : null}
              </span>
              <span className="timeline-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductRow({ item, isDelivered, onBuyAgain, isAdding }) {
  const unitPrice = getUnitPrice(item);
  const subtotal = Number(item.product_price) || unitPrice * (item.quantity || 1);
  const originalPrice = item.original_price ? Number(item.original_price) : null;
  const hasDiscount = originalPrice && originalPrice > unitPrice;
  const discountPct = hasDiscount ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100) : 0;
  const productUrl = `/product/${item.product_id}`;

  return (
    <div className="product-row">
      <Link to={productUrl} className="product-thumb">
        <img src={mediaUrl(item.product_image) || "/no-image.png"} alt={item.product_name} onError={withFallbackImage} />
      </Link>

      <div className="product-main">
        <div className="product-tags">
          {(item.brand || item.product_brand) && (
            <span className="tag tag-brand">{item.brand || item.product_brand}</span>
          )}
          {item.selected_size && item.selected_size !== "N/A" && (
            <span className="tag">Size: {item.selected_size}</span>
          )}
          <span className="tag tag-qty">Qty {item.quantity}</span>
        </div>

        <Link to={productUrl} className="product-name">{item.product_name}</Link>

        <div className="product-price-mobile">
          <span>{formatINR(subtotal)}</span>
          {hasDiscount && (
            <>
              <span className="strike">{formatINR(originalPrice)}</span>
              <span className="save">{discountPct}% OFF</span>
            </>
          )}
        </div>

        <div className="product-actions">
          <Link to={productUrl} className="pill pill-outline">
            <FaEye /> View Product
          </Link>
          {isDelivered && (
            <Link to={`${productUrl}?review=true`} className="pill pill-review">
              <FaStar /> Write Review
            </Link>
          )}
          <button type="button" className="pill pill-dark" onClick={() => onBuyAgain(item)} disabled={isAdding}>
            <FaRedo className={isAdding ? "spin" : ""} /> {isAdding ? "Adding..." : "Buy Again"}
          </button>
        </div>
      </div>

      <div className="product-price-desktop">
        <div className="price-now">{formatINR(subtotal)}</div>
        <div className="price-unit">{formatINR(unitPrice)} × {item.quantity}</div>
        {hasDiscount && (
          <div className="price-discount">
            <span className="strike">{formatINR(originalPrice)}</span>
            <span className="save">{discountPct}% OFF</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, defaultExpanded, onCopyId, onCancelRequest, onBuyAgain, addingId }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { date, time } = formatDateTime(order.created_at);
  const isDelivered = order.status === "Delivered";
  const paymentLabel = order.payment_method === "COD" ? "Cash on Delivery" : "Razorpay Online";

  const itemsSubtotal = useMemo(() => {
    if (!Array.isArray(order.items)) return Number(order.total_price);
    return order.items.reduce((sum, item) => sum + getUnitPrice(item) * (Number(item.quantity) || 1), 0);
  }, [order.items, order.total_price]);

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-header-left">
          <div className="order-id-row">
            <FaReceipt />
            <span className="order-id">Order #{order.id}</span>
            <button type="button" className="copy-btn" onClick={() => onCopyId(order.id)} aria-label="Copy order ID">
              <FaCopy /> Copy ID
            </button>
          </div>
          <div className="order-meta">
            <span>{date} at {time}</span>
            <span><FaCreditCard /> {paymentLabel}</span>
          </div>
        </div>
        <div className="order-header-right">
          <div className="order-total">
            <span className="total-label">Grand Total</span>
            <span className="total-value">{formatINR(order.total_price)}</span>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="order-timeline-wrap">
        <OrderTimeline status={order.status} />
      </div>

      <div className="order-body">
        <div className="order-body-header">
          <span className="section-label">Items ({order.items?.length || 0})</span>
          <button type="button" className="toggle-btn" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? "Hide Details" : "Show Details"} {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        <div className="product-list">
          {order.items?.map((item) => (
            <ProductRow
              key={item.id}
              item={item}
              isDelivered={isDelivered}
              onBuyAgain={onBuyAgain}
              isAdding={addingId === item.id}
            />
          ))}
        </div>
      </div>

      {expanded && (
        <div className="order-details-grid">
          <div className="detail-card">
            <div className="detail-card-header"><FaMapMarkerAlt /> Delivery Address</div>
            {order.shipping_name ? (
              <div className="detail-card-body">
                <strong>{order.shipping_name}</strong>
                <p>
                  {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                </p>
                {order.shipping_phone && <span className="phone"><FaPhoneAlt /> {order.shipping_phone}</span>}
              </div>
            ) : (
              <p className="detail-card-body muted">Standard delivery address recorded.</p>
            )}
          </div>

          <div className="detail-card">
            <div className="detail-card-header"><FaCreditCard /> Payment Summary</div>
            <div className="detail-card-body">
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>{formatINR(itemsSubtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className="free">FREE</span>
              </div>
              <div className="summary-row grand">
                <span>Grand Total</span>
                <span>{formatINR(order.total_price)}</span>
              </div>
              {order.status === "Pending" && (
                <button type="button" className="cancel-btn" onClick={() => onCancelRequest(order)}>
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CancelModal({ order, onClose, onConfirm }) {
  if (!order) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-alert-icon"><FaExclamationTriangle /></div>
        <h4>Cancel Order #{order.id}?</h4>
        <p className="modal-sub">
          Are you sure you want to cancel this order? This action cannot be undone. Refunds will be credited automatically.
        </p>

        <div className="modal-items">
          <span className="modal-items-label">Items to cancel</span>
          {order.items?.map((item) => (
            <div key={item.id} className="modal-item-row">
              <img src={mediaUrl(item.product_image) || "/no-image.png"} alt={item.product_name} onError={withFallbackImage} />
              <div>
                <div className="modal-item-name">{item.product_name}</div>
                <div className="modal-item-sub">
                  Qty: {item.quantity}{item.selected_size && item.selected_size !== "N/A" && ` • Size: ${item.selected_size}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-modal-secondary" onClick={onClose}>
            Keep Order
          </button>
          <button type="button" className="btn-modal-danger" onClick={onConfirm}>
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const { addToCart } = useCart();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCopyId = useCallback((id) => {
    navigator.clipboard.writeText(id.toString());
    toast.success(`Order #${id} copied to clipboard!`);
  }, []);

  const handleBuyAgain = useCallback(
    async (item) => {
      setAddingId(item.id);
      try {
        await addToCart({ product_id: item.product_id, size: item.selected_size, quantity: 1 });
        toast.success(`${item.product_name} added to cart!`);
      } catch {
        toast.error("Failed to add product to cart");
      } finally {
        setAddingId(null);
      }
    },
    [addToCart]
  );

  const handleCancelOrder = async () => {
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

  const counts = useMemo(
    () => ({
      all: orders.length,
      processing: orders.filter((o) => inFlight(o.status)).length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    if (activeTab === "processing") return orders.filter((o) => inFlight(o.status));
    if (activeTab === "delivered") return orders.filter((o) => o.status === "Delivered");
    if (activeTab === "cancelled") return orders.filter((o) => o.status === "Cancelled");
    return orders;
  }, [orders, activeTab]);

  return (
    <StoreShell>
      <div className="orders-page">
        <header className="orders-header">
          <span className="kicker">Order History</span>
          <h1>My Orders</h1>
          <p className="subtitle">Track shipments, write reviews, and reorder your favourite gear.</p>

          <div className="filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} <span className="tab-count">{counts[tab.id]}</span>
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <OrdersSkeleton />
        ) : filteredOrders.length === 0 ? (
          <EmptyState showReset={activeTab !== "all"} onReset={() => setActiveTab("all")} />
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                defaultExpanded={idx === 0}
                onCopyId={handleCopyId}
                onCancelRequest={setOrderToCancel}
                onBuyAgain={handleBuyAgain}
                addingId={addingId}
              />
            ))}
          </div>
        )}
      </div>

      <CancelModal order={orderToCancel} onClose={() => setOrderToCancel(null)} onConfirm={handleCancelOrder} />
    </StoreShell>
  );
}

export default Orders;