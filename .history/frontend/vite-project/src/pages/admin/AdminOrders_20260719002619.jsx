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
        <>
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setViewOrder(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Order #{viewOrder.id}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setViewOrder(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="text-muted small">Customer</div>
                      <div className="fw-semibold">{viewOrder.user_email}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Order date</div>
                      <div className="fw-semibold">{new Date(viewOrder.created_at).toLocaleString()}</div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-muted small">Status</div>
                      <AdminStatusBadge status={viewOrder.status} />
                    </div>
                    <div className="col-md-4">
                      <div className="text-muted small">Payment method</div>
                      <div className="fw-semibold">{viewOrder.payment_method}</div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-muted small">Payment status</div>
                      <AdminStatusBadge
                        status={viewOrder.payment_status}
                        variant={viewOrder.payment_status === "Paid" ? "success" : "warning"}
                      />
                    </div>
                    <div className="col-md-4">
                      <div className="text-muted small">Total amount</div>
                      <div className="fw-semibold">₹{viewOrder.total_price}</div>
                    </div>
                  </div>

                  <hr />

                  <h6 className="fw-bold mb-2">Shipping details</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="text-muted small">Name</div>
                      <div className="fw-semibold">{viewOrder.shipping_name}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Phone</div>
                      <div className="fw-semibold">{viewOrder.shipping_phone}</div>
                    </div>
                    <div className="col-12">
                      <div className="text-muted small">Address</div>
                      <div className="fw-semibold">
                        {viewOrder.shipping_address}, {viewOrder.shipping_city}
                        {viewOrder.shipping_state ? `, ${viewOrder.shipping_state}` : ""} -{" "}
                        {viewOrder.shipping_pincode}
                      </div>
                    </div>
                  </div>

                  <hr />

                  <h6 className="fw-bold mb-2">Ordered products</h6>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Qty</th>
                          <th>Unit price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewOrder.items || []).map((item) => (
                          <tr key={item.id}>
                            <td>{item.product_name}</td>
                            <td>{item.selected_size}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.unit_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setViewOrder(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}