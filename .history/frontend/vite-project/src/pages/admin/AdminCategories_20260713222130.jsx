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

const emptyForm = { name: "", slug: "", is_active: true };

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    API.get("categories/")
      .then((res) => setRows(unwrapList(res.data)))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, []);

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, slug: row.slug, is_active: row.is_active });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.patch(`categories/${editingId}/`, form);
        toast.success("Category updated");
      } else {
        await API.post("categories/", form);
        toast.success("Category created");
      }
      cancelEdit();
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category? Products must be reassigned first.")) return;
    try {
      await API.delete(`categories/${id}/`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed (category may still be in use)");
    }
  };

  if (loading) return <AdminLoading message="Loading categories…" />;

  return (
    <div>
      <AdminPageHeader title="Categories" subtitle="Organize your catalogue and control visibility on the storefront." />

      <AdminFormCard title={editingId ? "Edit category" : "Add category"}>
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Footwear"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Slug (URL key)</label>
              <input
                className="form-control"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                required
                disabled={!!editingId}
                placeholder="footwear"
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="catActive"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="catActive">
                  Visible on store
                </label>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3 pt-3 border-top">
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </AdminFormCard>

      <AdminTableCard
        isEmpty={rows.length === 0}
        empty={<AdminEmptyState title="No categories" message="Create a category to group your products." />}
      >
        <table className="table admin-table mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="fw-semibold">{r.name}</td>
                <td>
                  <code className="small">{r.slug}</code>
                </td>
                <td>
                  <AdminStatusBadge status={r.is_active ? "Active" : "Hidden"} variant={r.is_active ? "success" : "secondary"} />
                </td>
                <td className="text-end admin-btn-group-actions">
                  <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(r)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-outline-danger" onClick={() => remove(r.id)}>
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
