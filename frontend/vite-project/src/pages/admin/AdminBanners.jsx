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

const empty = {
  title: "",
  subtitle: "",
  description: "",
  link_url: "",
  product_id: "",
  linked_category_id: "",
  featured_product_ids: [],
  offer_percent: "",
  cashback_text: "",
  button_text: "Shop Now",
  sort_order: 0,
  is_active: true,
  banner_type: "premium",
};

export default function AdminBanners() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([API.get("banners/"), API.get("products/"), API.get("categories/")])
      .then(([bRes, pRes, cRes]) => {
        setRows(unwrapList(bRes.data));
        setProducts(unwrapList(pRes.data));
        setCategories(unwrapList(cRes.data));
      })
      .catch(() => toast.error("Failed to load banners, products, and categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
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
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      description: b.description || "",
      link_url: b.link_url || "",
      product_id: b.product?.id || b.product_id || "",
      linked_category_id: b.linked_category?.id || b.linked_category_id || "",
      featured_product_ids: b.featured_products ? b.featured_products.map((p) => p.id) : [],
      offer_percent: b.offer_percent !== null && b.offer_percent !== undefined ? b.offer_percent : "",
      cashback_text: b.cashback_text || "",
      button_text: b.button_text || "Shop Now",
      sort_order: b.sort_order,
      is_active: b.is_active,
      banner_type: b.banner_type || "premium",
    });
    setFile(null);
    setPreview(null);
    setProductSearchQuery("");
  };

  const cancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setEditingId(null);
    setForm(empty);
    setFile(null);
    setPreview(null);
    setProductSearchQuery("");
  };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("description", form.description || "");
    fd.append("link_url", form.link_url);
    if (form.product_id) {
      fd.append("product_id", String(form.product_id));
    } else {
      fd.append("product_id", "");
    }
    if (form.linked_category_id) {
      fd.append("linked_category_id", String(form.linked_category_id));
    } else {
      fd.append("linked_category_id", "");
    }
    if (form.offer_percent !== "") {
      fd.append("offer_percent", String(form.offer_percent));
    } else {
      fd.append("offer_percent", "");
    }
    
    if (form.featured_product_ids && form.featured_product_ids.length > 0) {
      form.featured_product_ids.forEach((id) => {
        fd.append("featured_product_ids", String(id));
      });
    } else {
      fd.append("featured_product_ids", "");
    }

    fd.append("cashback_text", form.cashback_text);
    fd.append("button_text", form.button_text);
    fd.append("sort_order", String(form.sort_order));
    fd.append("is_active", form.is_active ? "true" : "false");
    fd.append("banner_type", form.banner_type || "premium");
    if (file) fd.append("image", file);

    try {
      if (editingId) {
        if (file) {
          await API.patch(`banners/${editingId}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await API.patch(`banners/${editingId}/`, {
            title: form.title,
            subtitle: form.subtitle,
            description: form.description || "",
            link_url: form.link_url,
            product_id: form.product_id !== "" ? Number(form.product_id) : null,
            linked_category_id: form.linked_category_id !== "" ? Number(form.linked_category_id) : null,
            featured_product_ids: form.featured_product_ids || [],
            offer_percent: form.offer_percent !== "" ? Number(form.offer_percent) : null,
            cashback_text: form.cashback_text,
            button_text: form.button_text,
            sort_order: form.sort_order,
            is_active: form.is_active,
            banner_type: form.banner_type || "premium",
          });
        }
        toast.success("Banner updated");
      } else {
        if (!file) {
          toast.error("Upload a banner image");
          return;
        }
        await API.post("banners/", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Banner created");
      }
      cancel();
      load();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete banner?")) return;
    try {
      await API.delete(`banners/${id}/`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <AdminLoading message="Loading banners…" />;

  const currentBanner = editingId ? rows.find((b) => b.id === editingId) : null;
  const previewSrc = preview || (currentBanner ? mediaUrl(currentBanner.image) : null);

  return (
    <div>
      <AdminPageHeader title="Banners" subtitle="Homepage hero slides — images, links, and display order." />

      <AdminFormCard title={editingId ? "Edit banner" : "Upload banner"}>
        <form onSubmit={save}>
          <div className="row g-4">
            <div className="col-lg-5">
              <ImageDropzone label="Banner background image" hint="Recommended 1600x600 wide premium ratio" onFiles={setImageFile} />
              {previewSrc && (
                <div 
                  className="mt-3 border banner-preview-container"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "12px",
                    background: "#f8fafc"
                  }}
                >
                  <img 
                    src={previewSrc} 
                    alt="Preview" 
                    style={{ 
                      width: "100%", 
                      height: "auto", 
                      maxHeight: "220px", 
                      objectFit: "contain", 
                      objectPosition: "center",
                      display: "block"
                    }} 
                  />
                </div>
              )}
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Banner Name / Title</label>
                  <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner Title" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Subtitle</label>
                  <input className="form-control" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Banner Subtitle" />
                </div>
                <div className="col-12">
                  <label className="form-label">Collection Description (Optional)</label>
                  <textarea 
                    className="form-control" 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    placeholder="Official match gear and fan-favorite products."
                    rows="2"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Banner Type / Template</label>
                  <select
                    className="form-select"
                    value={form.banner_type}
                    onChange={(e) => setForm({ ...form, banner_type: e.target.value })}
                  >
                    <option value="premium">Premium Banner</option>
                    <option value="sale">Sale/Promo Banner</option>
                    <option value="countdown">Countdown Urgent Offer</option>
                    <option value="new_arrival">New Arrival Spotlight</option>
                    <option value="sports">Sports Athletic Theme</option>
                    <option value="minimal">Luxury Minimalist</option>
                    <option value="full_width">Full-width Hero Banner</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Linked Product (Optional)</label>
                  <select
                    className="form-select"
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value ? Number(e.target.value) : "" })}
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ID: {p.id} · ₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Linked Category (Optional)</label>
                  <select
                    className="form-select"
                    value={form.linked_category_id}
                    onChange={(e) => setForm({ ...form, linked_category_id: e.target.value ? Number(e.target.value) : "" })}
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Offer % (Optional)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.offer_percent}
                    onChange={(e) => setForm({ ...form, offer_percent: e.target.value !== "" ? Number(e.target.value) : "" })}
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Cashback Text (Optional)</label>
                  <input
                    className="form-control"
                    value={form.cashback_text}
                    onChange={(e) => setForm({ ...form, cashback_text: e.target.value })}
                    placeholder="e.g. Up to ₹500 Cashback"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Custom URL / Link URL (Optional)</label>
                  <input
                    className="form-control"
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    placeholder="e.g. /shop or https://…"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Button Text</label>
                  <input
                    className="form-control"
                    value={form.button_text}
                    onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sort order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
                  />
                </div>
                
                {/* Featured Products Checklist */}
                <div className="col-12">
                  <label className="form-label d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Featured Products (Multiple Selection)</span>
                    <span className="badge bg-primary">{form.featured_product_ids ? form.featured_product_ids.length : 0} selected</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Search products to feature..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                  />
                  <div className="border rounded p-3" style={{ maxHeight: "180px", overflowY: "auto", background: "#f8fafc" }}>
                    <div className="row g-2">
                      {products
                        .filter((p) => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                        .map((p) => {
                          const isChecked = form.featured_product_ids ? form.featured_product_ids.includes(p.id) : false;
                          return (
                            <div className="col-md-6" key={p.id}>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`feat-p-${p.id}`}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let updated = [...(form.featured_product_ids || [])];
                                    if (e.target.checked) {
                                      updated.push(p.id);
                                    } else {
                                      updated = updated.filter((id) => id !== p.id);
                                    }
                                    setForm({ ...form, featured_product_ids: updated });
                                  }}
                                />
                                <label className="form-check-label small text-truncate d-block" htmlFor={`feat-p-${p.id}`} title={p.name}>
                                  {p.name} (₹{p.price})
                                </label>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="bAct"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="bAct">
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
        <AdminEmptyState icon="▤" title="No banners" message="Upload a hero image to promote collections on the homepage." />
      ) : (
        <div className="row g-3">
          {rows.map((b) => (
            <div className="col-sm-6 col-lg-4" key={b.id}>
              <div className="admin-card admin-banner-card h-100 overflow-hidden d-flex flex-column justify-content-between" style={{ borderRadius: "12px" }}>
                <div>
                  <div 
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      background: "#f8fafc",
                      borderBottom: "1px solid var(--admin-border)"
                    }}
                  >
                    <img 
                      src={mediaUrl(b.image)} 
                      alt={b.title || "Banner"} 
                      style={{ 
                        width: "100%", 
                        height: "auto", 
                        maxHeight: "220px", 
                        objectFit: "contain", 
                        objectPosition: "center",
                        display: "block"
                      }} 
                    />
                  </div>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <h4 className="h6 fw-bold mb-0">{b.title || "Untitled banner"}</h4>
                      <AdminStatusBadge status={b.is_active ? "Active" : "Hidden"} variant={b.is_active ? "success" : "secondary"} />
                    </div>
                    <p className="small mb-1 text-info text-capitalize">
                      <strong>Type:</strong> {b.banner_type ? b.banner_type.replace('_', ' ') : "premium"}
                    </p>
                    {b.subtitle && <p className="small text-muted mb-1 text-truncate"><em>{b.subtitle}</em></p>}
                    {b.description && <p className="small text-muted mb-1 text-truncate" title={b.description}><strong>Desc:</strong> {b.description}</p>}
                    {b.product && (
                      <p className="small mb-1 text-primary text-truncate">
                        <strong>Product:</strong> {b.product.name} (₹{b.product.price})
                      </p>
                    )}
                    {b.linked_category && (
                      <p className="small mb-1 text-success text-truncate">
                        <strong>Category:</strong> {b.linked_category.name}
                      </p>
                    )}
                    {b.featured_products && b.featured_products.length > 0 && (
                      <p className="small mb-1 text-warning text-truncate" title={b.featured_products.map(p => p.name).join(", ")}>
                        <strong>Featured Products ({b.featured_products.length}):</strong> {b.featured_products.map(p => p.name).join(", ")}
                      </p>
                    )}
                    {b.offer_percent && <p className="small mb-1 text-danger"><strong>Offer:</strong> {b.offer_percent}% Off</p>}
                    {b.cashback_text && <p className="small mb-1 text-success"><strong>Cashback:</strong> {b.cashback_text}</p>}
                    {b.link_url && (
                      <p className="small text-muted text-truncate mb-1">Link: {b.link_url}</p>
                    )}
                    <p className="small text-muted mb-1">Button: {b.button_text || "Shop Now"}</p>
                    <p className="small text-muted mb-3">Order: {b.sort_order}</p>
                  </div>
                </div>
                <div className="p-3 pt-0">
                  <div className="admin-btn-group-actions d-flex gap-2">
                    <button type="button" className="btn btn-outline-primary w-50 btn-sm" onClick={() => startEdit(b)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-outline-danger w-50 btn-sm" onClick={() => del(b.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
