import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminFormCard from "../../components/admin/AdminFormCard";
import AdminTableCard from "../../components/admin/AdminTableCard";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import ProductImageManager from "../../components/admin/ProductImageManager";
import { mediaUrl } from "../../utils/mediaUrl";
import { unwrapList } from "../../utils/unwrapList";

const empty = {
  name: "",
  price: "",
  original_price: "",
  description: "",
  category_id: "",
  brand_id: "",
  stock: 0,
  sizes_json: "[]",
  is_trending: false,
  is_best_seller: false,
  is_premium: false,
  is_in_demand: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [primaryPendingKey, setPrimaryPendingKey] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [pageSize, setPageSize] = useState(null);

  const totalPages = pageSize ? Math.max(1, Math.ceil(count / pageSize)) : 1;

  const buildProductsQuery = (pageNum, search, category) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    return `products/?${params.toString()}`;
  };

  const loadProducts = (pageNum = 1, search = searchTerm, category = categoryFilter) => {
    return API.get(buildProductsQuery(pageNum, search, category)).then((pRes) => {
      const data = pRes.data;
      const results = data?.results ?? unwrapList(data);
      setProducts(results);
      setCount(data?.count ?? results.length);
      setNext(data?.next ?? null);
      setPrevious(data?.previous ?? null);
      setPageSize((prev) => prev ?? (results.length || null));
      setPage(pageNum);
    });
  };

  const loadAll = (pageNum = 1) => {
    setLoading(true);
    Promise.all([loadProducts(pageNum), API.get("categories/"), API.get("brands/")])
      .then(([, cRes, bRes]) => {
        setCategories(unwrapList(cRes.data));
        setBrands(unwrapList(bRes.data));
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever search text or category filter changes, reset to page 1 and reload.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTableLoading(true);
      loadProducts(1, searchTerm, categoryFilter)
        .catch(() => toast.error("Failed to load products"))
        .finally(() => setTableLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter]);

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === page) return;
    setTableLoading(true);
    loadProducts(pageNum, searchTerm, categoryFilter)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setTableLoading(false));
  };

  const refreshEditingProduct = async () => {
    if (!editingId) return;
    try {
      const res = await API.get(`products/${editingId}/`);
      setEditingProduct(res.data);
    } catch {
      loadProducts(page, searchTerm, categoryFilter);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditingProduct(p);
    setForm({
      name: p.name,
      price: p.price,
      original_price: p.original_price || "",
      description: p.description || "",
      category_id: p.category_id,
      brand_id: p.brand_id || "",
      stock: p.stock ?? 0,
      sizes_json: JSON.stringify(
        (p.sizes || []).map((s) => ({ size: s.size, stock: s.stock })),
        null,
        2,
      ),
      is_trending: p.is_trending || false,
      is_best_seller: p.is_best_seller || false,
      is_premium: p.is_premium || false,
      is_in_demand: p.is_in_demand || false,
    });
    setPendingFiles([]);
    setPrimaryPendingKey(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => {
    pendingFiles.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
    setEditingId(null);
    setEditingProduct(null);
    setForm(empty);
    setPendingFiles([]);
    setPrimaryPendingKey(null);
  };

  const getPrimaryFile = () => {
    if (primaryPendingKey) {
      return pendingFiles.find((p) => p.key === primaryPendingKey)?.file;
    }
    return pendingFiles[0]?.file ?? null;
  };

  const uploadGalleryBatch = async (productId, files) => {
    for (const file of files) {
      const fd = new FormData();
      fd.append("image", file);
      await API.post(`products/${productId}/add_image/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const primaryFile = getPrimaryFile();
    const extraPending = pendingFiles.filter((p) => p.file !== primaryFile).map((p) => p.file);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", String(form.price));
    if (form.original_price) fd.append("original_price", String(form.original_price));
    fd.append("description", form.description);
    fd.append("category_id", String(form.category_id));
    if (form.brand_id) fd.append("brand_id", String(form.brand_id));
    fd.append("stock", String(form.stock || 0));
    fd.append("sizes_json", form.sizes_json || "[]");
    fd.append("is_trending", form.is_trending ? "true" : "false");
    fd.append("is_best_seller", form.is_best_seller ? "true" : "false");
    fd.append("is_premium", form.is_premium ? "true" : "false");
    fd.append("is_in_demand", form.is_in_demand ? "true" : "false");
    if (primaryFile) fd.append("image", primaryFile);

    try {
      if (editingId) {
        if (primaryFile) {
          await API.patch(`products/${editingId}/`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await API.patch(`products/${editingId}/`, {
            name: form.name,
            price: form.price,
            original_price: form.original_price || null,
            description: form.description,
            category_id: form.category_id,
            brand_id: form.brand_id || null,
            stock: form.stock,
            sizes_json: form.sizes_json || "[]",
            is_trending: form.is_trending,
            is_best_seller: form.is_best_seller,
            is_premium: form.is_premium,
            is_in_demand: form.is_in_demand,
          });
        }
        if (extraPending.length) await uploadGalleryBatch(editingId, extraPending);
        toast.success("Product updated");
      } else {
        if (!primaryFile) {
          toast.error("Add at least one image and set a primary before creating");
          setSaving(false);
          return;
        }
        const res = await API.post("products/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newId = res.data?.id;
        if (newId && extraPending.length) await uploadGalleryBatch(newId, extraPending);
        toast.success("Product created");
      }
      cancel();
      loadProducts(page, searchTerm, categoryFilter);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryDisplayName = (p) => {
    if (p.category_name) return p.category_name;
    const match = categories.find(
      (c) => c.slug === p.category || c.id === p.category || c.name === p.category,
    );
    return match ? match.name : p.category;
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`products/${id}/`);
      toast.success("Deleted");
      if (editingId === id) cancel();
      loadProducts(page, searchTerm, categoryFilter);
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <AdminLoading message="Loading products…" />;

  return (
    <div>
      <AdminPageHeader title="Products" subtitle="Manage catalogue, inventory, and product images.">
        {editingId && (
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancel}>
            Cancel edit
          </button>
        )}
      </AdminPageHeader>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <AdminFormCard title={editingId ? `Edit product #${editingId}` : "Add new product"}>
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Product name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Running shoes"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    placeholder="e.g. 1200"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : "" })
                    }
                    required
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Brand</label>
                  <select
                    className="form-select"
                    value={form.brand_id}
                    onChange={(e) =>
                      setForm({ ...form, brand_id: e.target.value ? Number(e.target.value) : "" })
                    }
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label d-block fw-bold small text-muted text-uppercase mb-2">Homepage sections</label>
                  <div className="d-flex flex-wrap gap-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isTrending"
                        checked={form.is_trending}
                        onChange={(e) => setForm({ ...form, is_trending: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isTrending">
                        Trending
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isBestSeller"
                        checked={form.is_best_seller}
                        onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isBestSeller">
                        Best Seller
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isPremium"
                        checked={form.is_premium}
                        onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isPremium">
                        Premium Edit
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isInDemand"
                        checked={form.is_in_demand}
                        onChange={(e) => setForm({ ...form, is_in_demand: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isInDemand">
                        In Demand
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short product description for the storefront"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Sizes (JSON)</label>
                  <textarea
                    className="form-control font-monospace small"
                    rows={4}
                    value={form.sizes_json}
                    onChange={(e) => setForm({ ...form, sizes_json: e.target.value })}
                    placeholder='[{"size":"M","stock":10}]'
                  />
                  <div className="form-text">Array of objects with size and stock keys.</div>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create product"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-secondary" onClick={cancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </AdminFormCard>
        </div>
        <div className="col-lg-5">
          <AdminFormCard title="Images">
            <ProductImageManager
              productId={editingId}
              primaryUrl={editingProduct?.image}
              gallery={editingProduct?.images ?? []}
              pendingFiles={pendingFiles}
              primaryPendingKey={primaryPendingKey}
              onPendingChange={setPendingFiles}
              onPrimaryPendingKey={setPrimaryPendingKey}
              onRefresh={() => {
                refreshEditingProduct();
                loadProducts(page, searchTerm, categoryFilter);
              }}
            />
          </AdminFormCard>
        </div>
      </div>

      <div className="row g-2 align-items-center mb-3">
        <div className="col-12 col-md-4">
          <h3 className="h6 fw-bold mb-0">All products ({count})</h3>
        </div>
        <div className="col-6 col-md-4">
          <input
            id="productSearchInput"
            type="search"
            className="form-control w-100"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-4">
          <select
            id="categoryFilterSelect"
            className="form-select w-100"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AdminTableCard
        isEmpty={products.length === 0}
        empty={
          <AdminEmptyState
            icon="▣"
            title="No products found"
            message="Try adjusting your search or category filter."
          />
        }
      >
        <table className="table admin-table mb-0" style={{ opacity: tableLoading ? 0.5 : 1 }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Flags</th>
              <th className="text-center">Stock</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = (p.stock ?? 0) < 5;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img src={mediaUrl(p.image)} alt="" className="admin-thumb" />
                      <div>
                        <div className="fw-semibold">{p.name}</div>
                        <div className="text-muted small">ID #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="small">{getCategoryDisplayName(p)}</code>
                  </td>
                  <td>
                    {p.brand ? <span className="small fw-semibold text-secondary">{p.brand?.name}</span> : <span className="text-muted small">—</span>}
                  </td>
                  <td className="fw-semibold">
                    <div>₹{p.price}</div>
                    {p.original_price && <div className="text-muted small text-decoration-line-through">₹{p.original_price}</div>}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {p.is_trending && <span className="badge bg-primary text-white" style={{ fontSize: "0.65rem" }}>Trending</span>}
                      {p.is_best_seller && <span className="badge bg-success text-white" style={{ fontSize: "0.65rem" }}>Best Seller</span>}
                      {p.is_premium && <span className="badge bg-warning text-dark" style={{ fontSize: "0.65rem" }}>Premium</span>}
                      {p.is_in_demand && <span className="badge bg-danger text-white" style={{ fontSize: "0.65rem" }}>In Demand</span>}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex flex-column align-items-center gap-1">
                      <AdminStatusBadge status={low ? "Low stock" : "In stock"} variant={low ? "warning" : "success"} />
                      <span className="text-muted small fw-semibold">{p.stock}</span>
                    </div>
                  </td>
                  <td className="text-end text-nowrap">
                    <div className="admin-btn-group-actions">
                      <button type="button" className="btn btn-outline-primary" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-outline-danger" onClick={() => del(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTableCard>

      {totalPages > 1 && (
        <nav aria-label="Products pagination" className="mt-3">
          <ul className="pagination justify-content-center mb-0">
            <li className={`page-item ${!previous ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => goToPage(page - 1)}
                disabled={!previous}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li key={num} className={`page-item ${num === page ? "active" : ""}`}>
                <button type="button" className="page-link" onClick={() => goToPage(num)}>
                  {num}
                </button>
              </li>
            ))}
            <li className={`page-item ${!next ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => goToPage(page + 1)}
                disabled={!next}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}