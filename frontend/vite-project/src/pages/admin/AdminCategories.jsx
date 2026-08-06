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
  const [tableLoading, setTableLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const buildCategoriesQuery = (search) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const qs = params.toString();
    return qs ? `categories/?${qs}` : "categories/";
  };

  const load = (search = searchTerm) => {
    return API.get(buildCategoriesQuery(search)).then((res) => {
      setRows(unwrapList(res.data));
    });
  };

  useEffect(() => {
    setLoading(true);
    load("")
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search input before hitting the backend search endpoint.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTableLoading(true);
      load(searchTerm)
        .catch(() => toast.error("Failed to load categories"))
        .finally(() => setTableLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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
      load(searchTerm);
    } catch {
      toast.error("Save failed");
    }
  };

  const remove = async (category) => {
    if (category.product_count > 0) {
      toast.error("Cannot delete category. Products are assigned to this category.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await API.delete(`categories/${category.id}/`);
      toast.success("Category deleted successfully.");
      load(searchTerm);
    } catch {
      toast.error("Delete failed.");
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

      <div className="row g-2 align-items-center mb-3 mt-4">
        <div className="col-12 col-md-4">
          <input
            type="search"
            className="form-control"
            placeholder="Search by name or slug…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <AdminTableCard
        isEmpty={rows.length === 0}
        empty={<AdminEmptyState title="No categories" message="Create a category to group your products." />}
      >
        <table className="table admin-table admin-table--categories mb-0" style={{ opacity: tableLoading ? 0.5 : 1 }}>
          <colgroup>
            <col className="admin-col-flex" />
            <col style={{ width: "160px" }} />
            <col style={{ width: "104px" }} />
            <col style={{ width: "112px" }} />
            <col style={{ width: "190px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th className="text-center">Products</th>
              <th className="text-center">Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="fw-semibold admin-cell-truncate">{r.name}</td>
                <td className="admin-cell-truncate">
                  <code className="small">{r.slug}</code>
                </td>
                <td className="text-center">{r.product_count}</td>
                <td className="text-center">
                  <AdminStatusBadge status={r.is_active ? "Active" : "Hidden"} variant={r.is_active ? "success" : "secondary"} />
                </td>
                <td className="text-end text-nowrap">
                  <div className="admin-btn-group-actions">
                    <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(r)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-outline-danger" onClick={() => remove(r)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableCard>
    </div>
  );
}