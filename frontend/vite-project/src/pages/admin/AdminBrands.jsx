import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminFormCard from "../../components/admin/AdminFormCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ImageDropzone from "../../components/admin/ImageDropzone";
import { mediaUrl } from "../../utils/mediaUrl";
import { unwrapList } from "../../utils/unwrapList";

const empty = { name: "", is_active: true };

export default function AdminBrands() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API.get("brands/")
      .then((res) => setRows(unwrapList(res.data)))
      .catch(() => toast.error("Failed to load brands"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, []);

  const setImageFile = (files) => {
    const f = files[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({ name: b.name || "", is_active: b.is_active });
    setFile(null);
    setPreview(null);
  };

  const cancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setEditingId(null);
    setForm(empty);
    setFile(null);
    setPreview(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("is_active", form.is_active ? "true" : "false");
    if (file) fd.append("logo", file);

    try {
      if (editingId) {
        if (file) {
          await API.patch(`brands/${editingId}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await API.patch(`brands/${editingId}/`, {
            name: form.name.trim(),
            is_active: form.is_active,
          });
        }
        toast.success("Brand updated");
      } else {
        if (!file) {
          toast.error("Upload a brand logo");
          return;
        }
        await API.post("brands/", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Brand created");
      }
      cancel();
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete brand? This will set product brand values to empty.")) return;
    try {
      await API.delete(`brands/${id}/`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <AdminLoading message="Loading brands…" />;

  const currentBrand = editingId ? rows.find((b) => b.id === editingId) : null;
  const previewSrc = preview || (currentBrand ? mediaUrl(currentBrand.logo) : null);

  return (
    <div>
      <AdminPageHeader title="Brands" subtitle="Sports brands and logos — filters items and displays on homepage." />

      <AdminFormCard title={editingId ? "Edit brand" : "Add brand"}>
        <form onSubmit={save}>
          <div className="row g-4">
            <div className="col-lg-5">
              <ImageDropzone label="Brand logo" hint="Recommended square white logo (PNG, max 10MB)" onFiles={setImageFile} />
              {previewSrc && (
                <div className="mt-3 rounded-3 overflow-hidden border p-3 bg-light text-center" style={{ width: 140, height: 140, margin: "0 auto" }}>
                  <img src={previewSrc} alt="Preview" className="img-fluid h-100 object-fit-contain mix-blend-multiply" />
                </div>
              )}
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">Brand Name</label>
                  <input required className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nike, Adidas" />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="brAct"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="brAct">
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? "Save" : "Create"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancel}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </AdminFormCard>

      {rows.length === 0 ? (
        <AdminEmptyState icon="▧" title="No brands" message="Add brand entries to classify and display sports gear on the homepage." />
      ) : (
        <div className="row g-3">
          {rows.map((b) => (
            <div className="col-sm-6 col-lg-3" key={b.id}>
              <div className="admin-card text-center p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="bg-light border rounded p-3 mb-3 d-flex align-items-center justify-content-center mx-auto" style={{ width: 100, height: 100 }}>
                    <img src={mediaUrl(b.logo)} alt={b.name} className="img-fluid h-100 object-fit-contain mix-blend-multiply" />
                  </div>
                  <h4 className="h6 fw-bold mb-1">{b.name}</h4>
                  <AdminStatusBadge status={b.is_active ? "Active" : "Inactive"} variant={b.is_active ? "success" : "secondary"} />
                </div>
                <div className="admin-btn-group-actions d-flex gap-2 mt-3 justify-content-center">
                  <button type="button" className="btn btn-outline-primary btn-sm px-3" onClick={() => startEdit(b)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-outline-danger btn-sm px-3" onClick={() => del(b.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
