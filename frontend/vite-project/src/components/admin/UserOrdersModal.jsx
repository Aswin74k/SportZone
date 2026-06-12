import { useEffect, useState } from "react";
import API from "../../api";
import AdminLoading from "./AdminLoading";
import AdminStatusBadge from "./AdminStatusBadge";
import { unwrapList } from "../../utils/unwrapList";

export default function UserOrdersModal({ user, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    API.get(`admin/users/${user.id}/orders/`)
      .then((res) => setOrders(unwrapList(res.data)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <div>
                <h5 className="modal-title fw-bold mb-0">Orders</h5>
                <p className="small text-muted mb-0">{user.email}</p>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body p-0">
              {loading ? (
                <AdminLoading message="Loading orders…" />
              ) : orders.length === 0 ? (
                <p className="text-center text-muted py-5 mb-0">No orders for this customer.</p>
              ) : (
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="fw-semibold">#{o.id}</td>
                        <td>₹{o.total_price}</td>
                        <td>
                          <AdminStatusBadge status={o.status} />
                        </td>
                        <td className="text-muted small">{new Date(o.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} aria-hidden="true" />
    </>
  );
}
