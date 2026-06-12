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

  const load = (pageNum = 1, append = false) => {
    setLoading(true);
    const params = { page: pageNum };
    if (filters.status) params.status = filters.status;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.user) params.user = filters.user;

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
                  <th>Placed</th>
                  <th>Update</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableCard>
          <AdminLoadMore hasNext={hasNext} loading={loading} onLoadMore={() => load(page + 1, true)} />
        </>
      )}
    </div>
  );
}
