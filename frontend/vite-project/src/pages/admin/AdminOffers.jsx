import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminFormCard from "../../components/admin/AdminFormCard";
import AdminTableCard from "../../components/admin/AdminTableCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import { unwrapList } from "../../utils/unwrapList";

const empty = {
  title: "",
  description: "",
  discount_percent: "10",
  promo_code: "",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

export default function AdminOffers() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get("offers/")
      .then((res) => setRows(unwrapList(res.data)))
      .catch(() => toast.error("Failed to load offers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (o) => {
    setEditingId(o.id);
    setForm({
      title: o.title,
      description: o.description || "",
      discount_percent: String(o.discount_percent),
      promo_code: o.promo_code || "",
      is_active: o.is_active,
      starts_at: o.starts_at ? o.starts_at.slice(0, 16) : "",
      ends_at: o.ends_at ? o.ends_at.slice(0, 16) : "",
    });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(empty);
  };

  const payload = () => ({
    title: form.title,
    description: form.description,
    discount_percent: form.discount_percent,
    promo_code: form.promo_code,
    is_active: form.is_active,
    starts_at: form.starts_at || null,
    ends_at: form.ends_at || null,
  });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.patch(`offers/${editingId}/`, payload());
        toast.success("Offer updated");
      } else {
        await API.post("offers/", payload());
        toast.success("Offer created");
      }
      cancel();
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete offer?")) return;
    try {
      await API.delete(`offers/${id}/`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <AdminLoading message="Loading offers…" />;

  return (
    <div>
      <AdminPageHeader title="Offers & promos" subtitle="Create discount campaigns and promo codes for your store." />

      <AdminFormCard title={editingId ? "Edit offer" : "New offer"}>
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Discount %</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Promo code</label>
              <input
                className="form-control text-uppercase"
                value={form.promo_code}
                onChange={(e) => setForm({ ...form, promo_code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="oAct"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="oAct">
                  Active
                </label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Starts (optional)</label>
              <input
                type="datetime-local"
                className="form-control"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ends (optional)</label>
              <input
                type="datetime-local"
                className="form-control"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3 pt-3 border-top">
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? "Save" : "Create"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminFormCard>

      <AdminTableCard isEmpty={rows.length === 0} empty={<AdminEmptyState title="No offers" message="Create a promo to boost conversions." />}>
        <table className="table admin-table mb-0">
          <thead>
            <tr>
              <th>Offer</th>
              <th>Discount</th>
              <th>Code</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="fw-semibold">{o.title}</td>
                <td>
                  <span className="admin-badge admin-badge--info">{o.discount_percent}%</span>
                </td>
                <td>
                  {o.promo_code ? (
                    <code className="small bg-light px-2 py-1 rounded">{o.promo_code}</code>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <AdminStatusBadge status={o.is_active ? "Active" : "Inactive"} variant={o.is_active ? "success" : "secondary"} />
                </td>
                <td className="text-end admin-btn-group-actions">
                  <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(o)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-outline-danger" onClick={() => del(o.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableCard>
    </div>
  );
}
