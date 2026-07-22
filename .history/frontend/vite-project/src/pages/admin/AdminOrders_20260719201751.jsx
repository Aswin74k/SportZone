import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminTableCard from "../../components/admin/AdminTableCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminLoadMore from "../../components/admin/AdminLoadMore";
import { unwrapList } from "../../utils/unwrapList";
import { mediaUrl } from "../../utils/mediaUrl";


const formatCurrency = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return `₹${value}`;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [filters, setFilters] = useState({ status: "", date_from: "", date_to: "", user: "" });
  const [loading, setLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [viewOrder, setViewOrder] = useState(null);

  const load = (pageNum = 1, append = false, search = customerSearch) => {
    setLoading(true);
    const params = { page: pageNum };
    if (filters.status) params.status = filters.status;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.user) params.user = filters.user;
    if (search) params.search = search;

    API.get("admin/orders/", { params })
      .then((res) => {
        const chunk = unwrapList(res.data);
        setRows((prev) => (append ? [...prev, ...chunk] : chunk));
        setHasNext(!!res.data.next);
        setPage(pageNum);
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce customer email/username search before hitting the backend.
  useEffect(() => {
    const timeout = setTimeout(() => {
      load(1, false, customerSearch);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSearch]);

  const updateStatus = async (order, status) => {
    try {
      await API.patch(`admin/orders/${order.id}/`, { status });
      toast.success("Order updated");
      setRows((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    } catch {
      toast.error("Update failed");
    }
  };

  const orderItems = viewOrder?.items || [];
  const hasSizes = orderItems.some(
    (item) => item.selected_size && item.selected_size !== "N/A"
  );
  const itemCount = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = orderItems.reduce(
    (sum, item) => sum + (Number(item.unit_price) || 0) * (item.quantity || 0),
    0
  );
  const totalNum = viewOrder ? Number(viewOrder.total_price) || 0 : 0;
  const otherCharges = totalNum - subtotal;
  const showChargesBreakdown = orderItems.length > 0 && Math.abs(otherCharges) > 0.5;

  return (
    <div>
      <AdminPageHeader title="Orders" subtitle="Track fulfilment, filter by date or customer, and update status." />

      <form
        className="admin-filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          load(1, false);
        }}
      >
        <div className="row g-3 align-items-end">
          <div className="col-6 col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All statuses</option>
              <option>Pending</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">From</label>
            <input
              type="date"
              className="form-control"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">To</label>
            <input
              type="date"
              className="form-control"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">User ID</label>
            <input
              type="number"
              className="form-control"
              placeholder="Optional"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">
              Apply filters
            </button>
          </div>
        </div>
        <div className="row g-3 align-items-end mt-1">
          <div className="col-12 col-md-4">
            <label className="form-label">Search customer</label>
            <input
              type="search"
              className="form-control"
              placeholder="Search by email or username…"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
        </div>
      </form>

      {loading && rows.length === 0 ? (
        <AdminLoading message="Loading orders…" />
      ) : (
        <>
          <AdminTableCard
            isEmpty={rows.length === 0}
            empty={
              <AdminEmptyState
                icon="◎"
                title="No orders found"
                message="Try adjusting your filters or check back when customers place orders."
              />
            }
          >
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Placed</th>
                  <th>Update</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td className="fw-bold">#{o.id}</td>
                    <td>
                      <div className="fw-medium">{o.user_email}</div>
                      <div className="text-muted small">User #{o.user_id}</div>
                    </td>
                    <td className="fw-semibold">₹{o.total_price}</td>
                    <td>
                      <AdminStatusBadge status={o.status} />
                    </td>
                    <td className="text-muted small">{o.payment_method}</td>
                    <td>
                      <AdminStatusBadge
                        status={o.payment_status}
                        variant={o.payment_status === "Paid" ? "success" : "warning"}
                      />
                    </td>
                    <td className="text-muted small">{new Date(o.created_at).toLocaleString()}</td>
                    <td style={{ minWidth: 140 }}>
                      <select
                        className="form-select form-select-sm"
                        value={o.status}
                        onChange={(e) => updateStatus(o, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setViewOrder(o)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableCard>
          <AdminLoadMore hasNext={hasNext} loading={loading} onLoadMore={() => load(page + 1, true)} />
        </>
      )}

      {viewOrder && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(9, 15, 26, 0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setViewOrder(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "18px" }}>
              {/* ---------- Header ---------- */}
              <div
                className="modal-header border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
                style={{ background: "var(--admin-surface-alt)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3"
                    style={{ width: "40px", height: "40px", flexShrink: 0 }}
                  >
                    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </span>
                  <div>
                    <h5 className="modal-title fw-bold m-0" style={{ fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
                      Order #{viewOrder.id}
                    </h5>
                    <div className="text-muted small mt-1">
                      Placed {new Date(viewOrder.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      {" · "}
                      {new Date(viewOrder.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <AdminStatusBadge status={viewOrder.status} />
                </div>
              </div>

              <div className="modal-body p-4">
                {/* ---------- Summary strip ---------- */}
                <div
                  className="d-flex flex-wrap mb-4 rounded-3 border overflow-hidden"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="p-3 flex-fill" style={{ minWidth: "180px", borderRight: "1px solid var(--admin-border)" }}>
                    <div className="text-muted small fw-semibold text-uppercase mb-2" style={{ fontSize: "0.66rem", letterSpacing: "0.06em" }}>
                      Customer
                    </div>
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "180px" }} title={viewOrder.user_email}>
                      {viewOrder.user_email}
                    </div>
                    <div className="text-muted small">User #{viewOrder.user_id}</div>
                  </div>

                  <div className="p-3 flex-fill" style={{ minWidth: "150px", borderRight: "1px solid var(--admin-border)" }}>
                    <div className="text-muted small fw-semibold text-uppercase mb-2" style={{ fontSize: "0.66rem", letterSpacing: "0.06em" }}>
                      Payment
                    </div>
                    <div className="fw-semibold text-dark mb-1">{viewOrder.payment_method}</div>
                    <AdminStatusBadge
                      status={viewOrder.payment_status}
                      variant={viewOrder.payment_status === "Paid" ? "success" : "warning"}
                    />
                  </div>

                  <div className="p-3 flex-fill text-md-end" style={{ minWidth: "150px", background: "var(--admin-accent-soft)" }}>
                    <div className="text-muted small fw-semibold text-uppercase mb-2" style={{ fontSize: "0.66rem", letterSpacing: "0.06em" }}>
                      Order Total
                    </div>
                    <div className="fw-bold" style={{ fontSize: "1.35rem", color: "var(--admin-accent-strong)", letterSpacing: "-0.02em" }}>
                      {formatCurrency(viewOrder.total_price)}
                    </div>
                    {itemCount > 0 && (
                      <div className="text-muted small">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row g-4">
                  {/* ---------- Shipping ---------- */}
                  <div className="col-md-5">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <h6 className="fw-bold m-0 text-uppercase" style={{ fontSize: "0.78rem", letterSpacing: "0.06em", color: "var(--admin-muted)" }}>
                        Shipping
                      </h6>
                    </div>
                    <div
                      className="p-3 border rounded-3 h-100"
                      style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom" style={{ borderColor: "var(--admin-border)" }}>
                        <div className="fw-bold text-dark text-truncate">{viewOrder.shipping_name}</div>
                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary border fw-medium px-2 py-1"
                          style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.02em" }}
                        >
                          Recipient
                        </span>
                      </div>

                      <div className="d-flex gap-2 mb-3">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted flex-shrink-0 mt-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M3 7l9-4 9 4M3 7v10l9 4 9-4V7"></path>
                        </svg>
                        <div className="small text-dark lh-base">
                          <div>{viewOrder.shipping_address}</div>
                          <div>
                            {viewOrder.shipping_city}
                            {viewOrder.shipping_state ? `, ${viewOrder.shipping_state}` : ""}
                            {" "}
                            <span className="fw-semibold">{viewOrder.shipping_pincode}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="d-flex align-items-center gap-2 text-muted small pt-2 border-top"
                        style={{ borderColor: "var(--admin-border)" }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="fw-semibold text-dark">{viewOrder.shipping_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* ---------- Items ---------- */}
                  <div className="col-md-7">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      <h6 className="fw-bold m-0 text-uppercase" style={{ fontSize: "0.78rem", letterSpacing: "0.06em", color: "var(--admin-muted)" }}>
                        Items
                      </h6>
                    </div>

                    {orderItems.length === 0 ? (
                      <div
                        className="border rounded-3 d-flex align-items-center justify-content-center text-muted small h-100"
                        style={{ minHeight: "140px", borderColor: "var(--admin-border)", background: "var(--admin-surface-alt)" }}
                      >
                        No items recorded for this order.
                      </div>
                    ) : (
                      <div className="border rounded-3 overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
                        <table className="table table-sm mb-0" style={{ fontSize: "0.85rem" }}>
                          <thead style={{ background: "var(--admin-surface-alt)" }}>
                            <tr>
                              <th
                                className="ps-3 py-2 border-0 text-muted fw-semibold text-uppercase"
                                colSpan="2"
                                style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}
                              >
                                Item
                              </th>
                              {hasSizes && (
                                <th className="text-center py-2 border-0 text-muted fw-semibold text-uppercase" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                                  Size
                                </th>
                              )}
                              <th className="text-center py-2 border-0 text-muted fw-semibold text-uppercase" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                                Qty
                              </th>
                              <th className="text-end pe-3 py-2 border-0 text-muted fw-semibold text-uppercase" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderItems.map((item) => (
                              <tr key={item.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                                <td className="ps-3 py-2 border-0" style={{ width: "48px" }}>
                                  {item.product_image ? (
                                    <img
                                      src={mediaUrl(item.product_image)}
                                      alt={item.product_name}
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        border: "1px solid var(--admin-border)",
                                        backgroundColor: "var(--admin-surface-alt)",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="d-flex align-items-center justify-content-center bg-light text-muted"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--admin-border)",
                                        fontSize: "0.55rem",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      NO IMG
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 border-0 fw-medium text-dark">
                                  <div className="text-truncate" style={{ maxWidth: "190px" }} title={item.product_name}>
                                    {item.product_name}
                                  </div>
                                </td>
                                {hasSizes && (
                                  <td className="text-center py-2 border-0">
                                    {item.selected_size && item.selected_size !== "N/A" ? (
                                      <span
                                        className="badge bg-secondary bg-opacity-10 text-secondary border fw-semibold"
                                        style={{ fontSize: "0.7rem" }}
                                      >
                                        {item.selected_size}
                                      </span>
                                    ) : (
                                      <span className="text-muted">—</span>
                                    )}
                                  </td>
                                )}
                                <td className="text-center py-2 border-0 text-dark fw-semibold">×{item.quantity}</td>
                                <td className="text-end pe-3 py-2 border-0 fw-semibold text-dark">
                                  {formatCurrency(item.unit_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Totals footer */}
                        <div className="px-3 py-3" style={{ background: "var(--admin-surface-alt)", borderTop: "1px solid var(--admin-border)" }}>
                          {showChargesBreakdown && (
                            <>
                              <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                              </div>
                              <div className="d-flex justify-content-between small text-muted mb-2">
                                <span>{otherCharges > 0 ? "Shipping & fees" : "Adjustment"}</span>
                                <span>{formatCurrency(otherCharges)}</span>
                              </div>
                            </>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>Total</span>
                            <span className="fw-bold" style={{ fontSize: "1rem", color: "var(--admin-accent-strong)" }}>
                              {formatCurrency(viewOrder.total_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="modal-footer border-top px-4 py-3 d-flex justify-content-end"
                style={{ background: "var(--admin-surface-alt)" }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  style={{ borderRadius: "8px" }}
                  onClick={() => setViewOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}