import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminTableCard from "../../components/admin/AdminTableCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminLoadMore from "../../components/admin/AdminLoadMore";
import UserOrdersModal from "../../components/admin/UserOrdersModal";
import { unwrapList } from "../../utils/unwrapList";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordersUser, setOrdersUser] = useState(null);

  const load = (pageNum = 1, append = false) => {
    setLoading(true);
    API.get("admin/users/", { params: { search: search || undefined, page: pageNum } })
      .then((res) => {
        const chunk = unwrapList(res.data);
        setRows((prev) => (append ? [...prev, ...chunk] : chunk));
        setHasNext(!!res.data.next);
        setPage(pageNum);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBlock = async (u) => {
    try {
      await API.patch(`admin/users/${u.id}/`, { is_blocked: !u.is_blocked });
      toast.success(u.is_blocked ? "User unblocked" : "User blocked");
      setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, is_blocked: !u.is_blocked } : r)));
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div>
      <AdminPageHeader title="Customers" subtitle="Search accounts, view order history, and manage access." />

      <form
        className="admin-filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          load(1, false);
        }}
      >
        <div className="row g-2 align-items-end">
          <div className="col-md-8">
            <label className="form-label">Search</label>
            <input
              className="form-control"
              placeholder="Email, username, or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              Search
            </button>
          </div>
        </div>
      </form>

      {loading && rows.length === 0 ? (
        <AdminLoading message="Loading customers…" />
      ) : (
        <>
          <AdminTableCard
            isEmpty={rows.length === 0}
            empty={<AdminEmptyState title="No users found" message="Try a different search term." />}
          >
            <table className="table admin-table admin-table--users mb-0" style={{ opacity: loading ? 0.5 : 1 }}>
              <colgroup>
                <col className="admin-col-flex" />
                <col style={{ width: "112px" }} />
                <col style={{ width: "112px" }} />
                <col style={{ width: "210px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const initial = (u.email ? u.email[0] : (u.username ? u.username[0] : "?")).toUpperCase();
                  const charCode = initial.toLowerCase().charCodeAt(0);
                  const hues = [200, 220, 240, 260, 280, 300, 320, 340, 360, 180, 160, 140, 120, 100];
                  const hue = hues[charCode % hues.length];
                  const avatarColor = `hsl(${hue}, 70%, 45%)`;

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-user-row">
                          <div className="admin-user-avatar" style={{ backgroundColor: avatarColor }}>
                            {initial}
                          </div>
                          <div className="admin-user-info">
                            <div className="fw-semibold admin-cell-truncate">{u.email}</div>
                            <div className="text-muted small admin-cell-truncate">
                              {u.first_name || u.username} · ID #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        {u.is_staff ? (
                          <AdminStatusBadge status="Staff" variant="info" />
                        ) : (
                          <AdminStatusBadge status="Customer" variant="secondary" />
                        )}
                      </td>
                      <td className="text-center">
                        {u.is_blocked ? (
                          <AdminStatusBadge status="Blocked" variant="danger" />
                        ) : u.is_active ? (
                          <AdminStatusBadge status="Active" variant="success" />
                        ) : (
                          <AdminStatusBadge status="Inactive" variant="secondary" />
                        )}
                      </td>
                      <td className="text-end admin-btn-group-actions text-nowrap">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setOrdersUser(u)}>
                          Orders
                        </button>
                        <button
                          type="button"
                          className={`btn ${u.is_blocked ? "btn-success" : "btn-warning"}`}
                          onClick={() => toggleBlock(u)}
                        >
                          {u.is_blocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminTableCard>
          <AdminLoadMore hasNext={hasNext} loading={loading} onLoadMore={() => load(page + 1, true)} />
        </>
      )}

      <UserOrdersModal user={ordersUser} onClose={() => setOrdersUser(null)} />
    </div>
  );
}