import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiCopy, FiEye } from "react-icons/fi";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminFormCard from "../../components/admin/AdminFormCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import AdminTableCard from "../../components/admin/AdminTableCard";
import ImageDropzone from "../../components/admin/ImageDropzone";
import { mediaUrl } from "../../utils/mediaUrl";
import { unwrapList } from "../../utils/unwrapList";
import BannerRenderer from "../../components/banners/BannerRenderer";
import "../../components/banners/Banners.css";

const emptyForm = {
  title: "",
  subtitle: "",
  discount_percentage: "",
  offer_text: "",
  banner_type: "flash_sale",
  category_id: "",
  product_id: "",
  button_text: "",
  button_link: "",
  background_color: "",
  priority: 0,
  display_order: 0,
  start_date: "",
  end_date: "",
  is_active: true,
};

export default function AdminBanners() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  
  // File uploads unified state
  const [images, setImages] = useState({
    bg: { file: null, preview: null, cleared: false },
    prod: { file: null, preview: null, cleared: false },
    coll: { file: null, preview: null, cleared: false },
  });
  
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop"); // 'desktop' or 'mobile'

  const load = (showLoader = false) => {
    if (showLoader) setLoading(true);
    Promise.all([API.get("banners/"), API.get("categories/"), API.get("products/")])
      .then(([bRes, cRes, pRes]) => {
        setRows(unwrapList(bRes.data));
        setCategories(unwrapList(cRes.data));
        setProducts(unwrapList(pRes.data));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load banners, categories and products");
      })
      .finally(() => {
        if (showLoader) setLoading(false);
      });
  };

  useEffect(() => {
    load(true);
  }, []);

  const handleImageFile = (type, files) => {
    const f = files[0];
    if (!f) return;
    setImages((prev) => {
      if (prev[type].preview) URL.revokeObjectURL(prev[type].preview);
      return {
        ...prev,
        [type]: { file: f, preview: URL.createObjectURL(f), cleared: false },
      };
    });
  };

  const removeImage = (type) => {
    setImages((prev) => {
      if (prev[type].preview) URL.revokeObjectURL(prev[type].preview);
      return {
        ...prev,
        [type]: { file: null, preview: null, cleared: true },
      };
    });
  };

  // Pre-fill form for edit
  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      discount_percentage: b.discount_percentage !== null ? String(b.discount_percentage) : "",
      offer_text: b.offer_text || "",
      banner_type: b.banner_type || "flash_sale",
      category_id: b.category?.id || b.category_id || "",
      product_id: b.product?.id || b.product_id || "",
      button_text: b.button_text || "",
      button_link: b.button_link || "",
      background_color: b.background_color || "",
      priority: b.priority || 0,
      display_order: b.display_order || 0,
      start_date: b.start_date ? b.start_date.substring(0, 16) : "",
      end_date: b.end_date ? b.end_date.substring(0, 16) : "",
      is_active: b.is_active,
    });
    
    // Reset file states
    setImages({
      bg: { file: null, preview: null, cleared: false },
      prod: { file: null, preview: null, cleared: false },
      coll: { file: null, preview: null, cleared: false },
    });
    
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => {
    Object.values(images).forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    
    setEditingId(null);
    setForm(emptyForm);
    setImages({
      bg: { file: null, preview: null, cleared: false },
      prod: { file: null, preview: null, cleared: false },
      coll: { file: null, preview: null, cleared: false },
    });
  };

  const save = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    const directKeys = ["title", "subtitle", "offer_text", "banner_type", "background_color", "button_text", "button_link"];
    directKeys.forEach((k) => fd.append(k, form[k] || ""));

    fd.append("discount_percentage", form.discount_percentage !== "" ? String(form.discount_percentage) : "");
    fd.append("category_id", form.category_id ? String(form.category_id) : "");
    fd.append("product_id", form.product_id ? String(form.product_id) : "");
    fd.append("priority", String(form.priority || 0));
    fd.append("display_order", String(form.display_order || 0));
    fd.append("start_date", form.start_date ? new Date(form.start_date).toISOString() : "");
    fd.append("end_date", form.end_date ? new Date(form.end_date).toISOString() : "");
    fd.append("is_active", form.is_active ? "true" : "false");

    const imageKeys = { bg: "background_image", prod: "product_image", coll: "collection_image" };
    Object.entries(imageKeys).forEach(([stateKey, apiKey]) => {
      const img = images[stateKey];
      if (img.file) fd.append(apiKey, img.file);
      else if (img.cleared) fd.append(apiKey, "");
    });

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingId) {
        await API.patch(`banners/${editingId}/`, fd, config);
        toast.success("Banner updated successfully");
      } else {
        await API.post("banners/", fd, config);
        toast.success("Banner created successfully");
      }
      cancel();
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save banner");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await API.delete(`banners/${id}/`);
      toast.success("Banner deleted");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // Immediate Toggle Enable/Disable via PATCH
  const toggleActive = async (b) => {
    try {
      await API.patch(`banners/${b.id}/`, { is_active: !b.is_active });
      toast.success(`Banner ${b.is_active ? "disabled" : "enabled"}`);
      load();
    } catch (err) {
      console.error(err);
      toast.error("Status toggle failed");
    }
  };

  // Duplicate Banner
  const duplicateBanner = async (b) => {
    try {
      toast.info("Cloning banner...");
      const fd = new FormData();
      const directKeys = ["subtitle", "offer_text", "banner_type", "background_color", "button_text", "button_link", "start_date", "end_date"];
      directKeys.forEach((k) => fd.append(k, b[k] || ""));
      fd.append("title", `${b.title} (Copy)`);
      fd.append("discount_percentage", b.discount_percentage !== null ? String(b.discount_percentage) : "");
      fd.append("category_id", b.category?.id ? String(b.category.id) : "");
      fd.append("product_id", b.product?.id ? String(b.product.id) : "");
      fd.append("priority", String(b.priority || 0));
      fd.append("display_order", String(b.display_order || 0));
      fd.append("is_active", String(b.is_active));

      const fetchAndAppend = async (field, path, filename) => {
        if (path) {
          const blob = await fetch(mediaUrl(path)).then((r) => r.blob());
          fd.append(field, blob, filename);
        }
      };
      await fetchAndAppend("background_image", b.background_image, "background.png");
      await fetchAndAppend("product_image", b.product_image, "product.png");
      await fetchAndAppend("collection_image", b.collection_image, "collection.png");

      await API.post("banners/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Banner duplicated successfully");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Duplication failed");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };


  if (loading) return <AdminLoading message="Loading banners..." />;

  const filteredProducts = form.category_id
    ? products.filter(p => String(p.category_id) === String(form.category_id))
    : products;

  const currentEditingBanner = editingId ? rows.find((b) => b.id === editingId) : null;

  return (
    <div className="container-fluid py-2">
      <AdminPageHeader title="Banner Management" subtitle="Manage dynamic promotional campaigns, limited offers, and sport collections." />

      {/* CREATE & EDIT FORM */}
      <AdminFormCard title={editingId ? `Edit Banner: ${currentEditingBanner?.title || editingId}` : "Create Premium Banner"}>
        <form onSubmit={save}>
          <div className="row g-4">
            
            <div className="col-12">
              
              {/* SECTION 1: MEDIA ASSETS */}
              <h5 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">1. Media & Images</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <ImageDropzone label="Background Image" hint="Used as background cover." onFiles={(files) => handleImageFile("bg", files)} />
                  {(images.bg.preview || (currentEditingBanner?.background_image && !images.bg.cleared)) && (
                    <div className="mt-3 border rounded overflow-hidden position-relative bg-light" style={{ height: "130px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={images.bg.preview || mediaUrl(currentEditingBanner.background_image)} alt="Background Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" style={{ borderRadius: "8px", fontSize: "0.72rem", padding: "4px 8px", boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }} onClick={() => removeImage("bg")}>✕ Clear</button>
                    </div>
                  )}
                </div>

                {(form.banner_type === "flash_sale" || form.banner_type === "limited_offer") && (
                  <div className="col-md-4">
                    <ImageDropzone label="Product Image" hint="Transparent PNG product model." onFiles={(files) => handleImageFile("prod", files)} />
                    {(images.prod.preview || (currentEditingBanner?.product_image && !images.prod.cleared)) && (
                      <div className="mt-3 border rounded overflow-hidden position-relative sz-checkerboard-bg" style={{ height: "130px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={images.prod.preview || mediaUrl(currentEditingBanner.product_image)} alt="Product Preview" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.12))" }} />
                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" style={{ borderRadius: "8px", fontSize: "0.72rem", padding: "4px 8px", boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }} onClick={() => removeImage("prod")}>✕ Clear</button>
                      </div>
                    )}
                  </div>
                )}

                {form.banner_type === "collection" && (
                  <div className="col-md-4">
                    <ImageDropzone label="Collection Image" hint="Transparent PNG athlete model." onFiles={(files) => handleImageFile("coll", files)} />
                    {(images.coll.preview || (currentEditingBanner?.collection_image && !images.coll.cleared)) && (
                      <div className="mt-3 border rounded overflow-hidden position-relative sz-checkerboard-bg" style={{ height: "130px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={images.coll.preview || mediaUrl(currentEditingBanner.collection_image)} alt="Collection Preview" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.12))" }} />
                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" style={{ borderRadius: "8px", fontSize: "0.72rem", padding: "4px 8px", boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }} onClick={() => removeImage("coll")}>✕ Clear</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: TEXT DETAILS */}
              <h5 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">2. Offer Details & Content</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Banner Type *</label>
                  <select className="form-select" value={form.banner_type} onChange={(e) => setForm({ ...form, banner_type: e.target.value })}>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="limited_offer">Limited Offer</option>
                    <option value="collection">Collection Banner</option>
                  </select>
                </div>

                <div className="col-md-5">
                  <label className="form-label fw-semibold">Background Color</label>
                  <input type="text" className="form-control" value={form.background_color} onChange={(e) => setForm({ ...form, background_color: e.target.value })} placeholder="e.g. #090d16 or rgba(15,23,42,0.7)" />
                  <div className="d-flex gap-1 mt-2 flex-wrap">
                    {[
                      { name: "Black", color: "#000000" },
                      { name: "Blue Grey", color: "#7393B3" },
                      { name: "Gray", color: "#808080" },
                      { name: "Light Grey", color: "#f3f4f6" },
                      { name: "Charcoal", color: "#36454F" },
                    ].map((p) => {
                      const isPresetLight = p.color === "#f3f4f6";
                      return (
                        <button key={p.color} type="button" className="btn btn-xs d-flex align-items-center gap-1 border-0 shadow-sm" style={{ borderRadius: "12px", padding: "3px 8px", fontSize: "0.68rem", background: isPresetLight ? "#ffffff" : p.color, color: isPresetLight ? "#1e293b" : "#ffffff", border: isPresetLight ? "1px solid #cbd5e1" : "none" }} onClick={() => setForm({ ...form, background_color: p.color })}>
                          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: p.color, border: "1px solid rgba(0,0,0,0.1)" }} />
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Banner Title</label>
                  <input type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. SUMMER KICKOFF SALE" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Subtitle</label>
                  <input type="text" className="form-control" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Up to 50% Off Premium Gear" />
                </div>

                {form.banner_type === "flash_sale" && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-danger">Discount Percentage (%)</label>
                      <input type="number" className="form-control border-danger" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })} placeholder="e.g. 50" min="1" max="100" />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-primary">Price Tag / Offer Text</label>
                      <input type="text" className="form-control border-primary" value={form.offer_text} onChange={(e) => setForm({ ...form, offer_text: e.target.value })} placeholder="e.g. ₹1599 onwards or Upto 50% OFF" />
                    </div>
                  </>
                )}

                {form.banner_type === "limited_offer" && (
                  <div className="col-12">
                    <label className="form-label fw-semibold text-primary">Offer Text / Bank Discount</label>
                    <textarea className="form-control border-primary" value={form.offer_text} onChange={(e) => setForm({ ...form, offer_text: e.target.value })} placeholder="Describe promo details, coupon rules, e.g. HDFC 10% Instant Discount on credit cards" rows="2" />
                  </div>
                )}
              </div>

              {/* SECTION 3: NAVIGATION LINKS */}
              <h5 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">3. Action & Linking</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-primary">Category Link (Optional)</label>
                  <select className="form-select border-primary" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, product_id: "" })}>
                    <option value="">None (Custom Link)</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-primary">Product Link (Optional)</label>
                  <select className="form-select border-primary" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                    <option value="">None (Custom Link)</option>
                    {filteredProducts.map((p) => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Button Text</label>
                  <input type="text" className="form-control" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} placeholder="e.g. Shop Now, Grab Deal, Explore" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Button Link (Custom URL)</label>
                  <input type="text" className="form-control" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} placeholder="e.g. /shop or custom URL" />
                </div>
              </div>

              {/* SECTION 4: SETTINGS */}
              <h5 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">4. Campaign Scheduling</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Priority</label>
                  <input type="number" className="form-control" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) || 0 })} />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Display Order</label>
                  <input type="number" className="form-control" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })} />
                </div>

                <div className="col-md-6">
                  <div className="form-check mt-4 pt-2">
                    <input type="checkbox" className="form-check-input" id="bAct" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    <label className="form-check-label fw-bold" htmlFor="bAct">Enable / Activate Banner</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Start Date</label>
                  <input type="datetime-local" className="form-control" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">End Date</label>
                  <input type="datetime-local" className="form-control" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary px-4">{editingId ? "Save Changes" : "Create Banner"}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={cancel}>Clear / Cancel</button>
              </div>
            </div>

          </div>
        </form>
      </AdminFormCard>

      {/* BANNER LISTING TABLE */}
      <h3 className="h5 fw-bold my-4">Active and Scheduled Banners</h3>
      <AdminTableCard
        isEmpty={rows.length === 0}
        empty={<AdminEmptyState icon="▤" title="No banners found" message="Add sport graphics to display on the storefront homepage." />}
      >
        <table className="table admin-table mb-0">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Image</th>
              <th>Name / Title</th>
              <th className="text-center">Type</th>
              <th className="text-center">Priority</th>
              <th className="text-center">Order</th>
              <th className="text-center">Start Date</th>
              <th className="text-center">End Date</th>
              <th className="text-center">Status</th>
              <th className="text-end" style={{ width: "260px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const typeBadgeClass = {
                flash_sale: "bg-danger-subtle text-danger border-danger-subtle",
                limited_offer: "bg-primary-subtle text-primary border-primary-subtle",
                collection: "bg-purple-subtle text-purple border-purple-subtle"
              }[b.banner_type] || "bg-purple-subtle text-purple border-purple-subtle";

              const typeLabel = {
                flash_sale: "Flash Sale",
                limited_offer: "Limited Offer",
                collection: "Collection"
              }[b.banner_type] || "Collection";

              const listImage = b.product_image || b.collection_image || b.background_image || b.desktop_image;

              return (
                <tr key={b.id}>
                  <td>
                    <div className="rounded border bg-light overflow-hidden" style={{ width: "70px", height: "45px" }}>
                      {listImage ? <img src={mediaUrl(listImage)} alt="Banner thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small">No Img</div>}
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{b.title || "Untitled Banner"}</div>
                    {b.subtitle && <span className="small text-muted">{b.subtitle}</span>}
                  </td>
                  <td className="text-center">
                    <span className={`badge border px-2.5 py-1 ${typeBadgeClass}`}>{typeLabel}</span>
                  </td>
                  <td className="text-center"><span className="fw-semibold">{b.priority}</span></td>
                  <td className="text-center">{b.display_order}</td>
                  <td className="text-center small">{formatDate(b.start_date)}</td>
                  <td className="text-center small">{formatDate(b.end_date)}</td>
                  <td className="text-center">
                    <button type="button" onClick={() => toggleActive(b)} className="btn p-0 border-0 bg-transparent" title="Click to toggle status">
                      <AdminStatusBadge status={b.is_active ? "Active" : "Disabled"} variant={b.is_active ? "success" : "secondary"} />
                    </button>
                  </td>
                  <td className="text-end text-nowrap">
                    <div className="admin-btn-group-actions">
                      <button type="button" className="btn btn-outline-info btn-sm d-flex align-items-center gap-1" onClick={() => setPreviewBanner(b)} title="Interactive storefront preview"><FiEye /> Preview</button>
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => startEdit(b)} title="Edit banner settings"><FiEdit /></button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => duplicateBanner(b)} title="Duplicate / Clone"><FiCopy /></button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => del(b.id)} title="Delete permanently"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableCard>

      {/* PREMIUM SIMULATION MODAL */}
      {previewBanner && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: "20px" }}>
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Storefront Banner Preview</h5>
                <div className="d-flex gap-2 ms-auto me-3">
                  <button type="button" className={`btn btn-sm btn-outline-light ${previewMode === "desktop" ? "active bg-light text-dark" : ""}`} onClick={() => setPreviewMode("desktop")}>💻 Desktop View</button>
                  <button type="button" className={`btn btn-sm btn-outline-light ${previewMode === "mobile" ? "active bg-light text-dark" : ""}`} onClick={() => setPreviewMode("mobile")}>📱 Mobile View</button>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewBanner(null)} aria-label="Close" />
              </div>
              <div className="modal-body p-4 bg-light text-center">
                <div className={`mx-auto overflow-hidden shadow border ${previewMode === "mobile" ? "preview-mobile" : ""}`} style={{ width: previewMode === "desktop" ? "100%" : "375px", transition: "all 0.4s ease", borderRadius: "16px", background: "#ffffff" }}>
                  <div className="sz-hero-banner-container" style={{ padding: 0 }}>
                    <div className="sz-hero-banner-wrapper" style={{ borderRadius: 0, boxShadow: "none", height: "auto" }}>
                      <BannerRenderer banner={previewBanner} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 bg-light py-2">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setPreviewBanner(null)}>Close Preview</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
