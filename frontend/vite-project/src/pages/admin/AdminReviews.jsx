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

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (pageNum = 1, append = false) => {
    setLoading(true);
    const params = { page: pageNum };
    if (filter === "pending") params.is_approved = "false";
    if (filter === "approved") params.is_approved = "true";

    API.get("admin/reviews/", { params })
      .then((res) => {
        const chunk = unwrapList(res.data);
        setRows((prev) => (append ? [...prev, ...chunk] : chunk));
        setHasNext(!!res.data.next);
        setPage(pageNum);
      })
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const approve = async (r, val) => {
    try {
      await API.patch(`admin/reviews/${r.id}/`, { is_approved: val });
      toast.success(val ? "Approved" : "Unapproved");
      setRows((prev) => prev.map((row) => (row.id === r.id ? { ...row, is_approved: val } : row)));
    } catch {
      toast.error("Update failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await API.delete(`admin/reviews/${id}/`);
      toast.success("Deleted");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div>
      <AdminPageHeader title="Reviews" subtitle="Moderate customer feedback before it appears on product pages." />

      <div className="admin-filter-bar d-flex flex-wrap align-items-center gap-3">
        <label className="form-label mb-0 fw-semibold small">Show</label>
        <div className="btn-group btn-group-sm" role="group" aria-label="Review filter">
          {[
            { value: "", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`btn ${filter === opt.value ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <AdminLoading message="Loading reviews…" />
      ) : (
        <>
          <AdminTableCard
            isEmpty={rows.length === 0}
            empty={
              <AdminEmptyState
                icon="★"
                title="No reviews"
                message={filter === "pending" ? "All caught up — no pending reviews." : "Reviews will appear when customers submit feedback."}
              />
            }
          >
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.product_name}</td>
                    <td>
                      <div className="small">{r.user_email}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                        #{r.id}
                      </div>
                    </td>
                    <td>
                      <span className="admin-rating" title={`${r.rating} out of 5`}>
                        {stars(r.rating)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <p className="mb-0 small text-muted" style={{ lineHeight: 1.4 }}>
                        {r.comment || <em className="text-secondary">No comment</em>}
                      </p>
                    </td>
                    <td>
                      <AdminStatusBadge
                        status={r.is_approved ? "Approved" : "Pending"}
                        variant={r.is_approved ? "success" : "warning"}
                      />
                    </td>
                    <td className="text-end text-nowrap">
                      <div className="admin-btn-group-actions">
                        {!r.is_approved ? (
                          <button type="button" className="btn btn-success" onClick={() => approve(r, true)}>
                            Approve
                          </button>
                        ) : (
                          <button type="button" className="btn btn-outline-warning" onClick={() => approve(r, false)}>
                            Unapprove
                          </button>
                        )}
                        <button type="button" className="btn btn-outline-danger" onClick={() => del(r.id)}>
                          Delete
                        </button>
                      </div>
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
