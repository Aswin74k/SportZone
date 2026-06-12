import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoading from "../../components/admin/AdminLoading";
import { unwrapList } from "../../utils/unwrapList";

const quickLinks = [
  { to: "/admin/products", title: "Products", text: "Stock, pricing, images, and sizes.", icon: "▣" },
  { to: "/admin/categories", title: "Categories", text: "Organize catalogue and visibility.", icon: "☰" },
  { to: "/admin/brands", title: "Brands", text: "Create and edit brands, upload logos.", icon: "▧" },
  { to: "/admin/orders", title: "Orders", text: "Filter, fulfil, and track shipments.", icon: "◎" },
  { to: "/admin/users", title: "Users", text: "Search, block accounts, view orders.", icon: "◇" },
  { to: "/admin/banners", title: "Banners", text: "Homepage hero images and links.", icon: "▤" },
  { to: "/admin/offers", title: "Offers", text: "Discounts and promo codes.", icon: "％" },
  { to: "/admin/reviews", title: "Reviews", text: "Approve or remove feedback.", icon: "★" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("products/"),
      API.get("categories/"),
      API.get("brands/"),
      API.get("admin/orders/", { params: { page: 1, page_size: 1 } }),
      API.get("admin/users/", { params: { page: 1, page_size: 1 } }),
      API.get("admin/reviews/", { params: { page: 1, page_size: 1, is_approved: "false" } }),
    ])
      .then(([products, categories, brands, orders, users, pendingReviews]) => {
        const productList = unwrapList(products.data);
        const lowStock = productList.filter((p) => (p.stock ?? 0) < 5).length;
        setStats({
          products: productList.length,
          categories: unwrapList(categories.data).length,
          brands: unwrapList(brands.data).length,
          orders: orders.data?.count ?? unwrapList(orders.data).length,
          users: users.data?.count ?? unwrapList(users.data).length,
          pendingReviews: pendingReviews.data?.count ?? unwrapList(pendingReviews.data).length,
          lowStock,
        });
      })
      .catch(() => setStats({ products: 0, categories: 0, brands: 0, orders: 0, users: 0, pendingReviews: 0, lowStock: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Products", value: stats.products, to: "/admin/products", icon: "▣", tone: "blue" },
        { label: "Orders", value: stats.orders, to: "/admin/orders", icon: "◎", tone: "green" },
        { label: "Brands", value: stats.brands, to: "/admin/brands", icon: "▧", tone: "purple" },
        { label: "Customers", value: stats.users, to: "/admin/users", icon: "◇", tone: "teal" },
        { label: "Pending reviews", value: stats.pendingReviews, to: "/admin/reviews", icon: "★", tone: "amber" },
      ]
    : [];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview of your store — catalogue, orders, and moderation at a glance."
      />

      {loading ? (
        <AdminLoading message="Loading dashboard…" />
      ) : (
        <>
          <div className="row g-3 mb-4">
            {statCards.map((s) => (
              <div className="col-6 col-lg-3" key={s.label}>
                <Link to={s.to} className="admin-stat-card">
                  <div className={`stat-icon stat-icon--${s.tone}`} aria-hidden="true">
                    {s.icon}
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </Link>
              </div>
            ))}
          </div>

          {stats?.lowStock > 0 && (
            <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex align-items-center gap-2">
              <span aria-hidden="true">⚠</span>
              <span className="small">
                <strong>{stats.lowStock}</strong> product{stats.lowStock !== 1 ? "s" : ""} have low stock (&lt; 5 units).{" "}
                <Link to="/admin/products" className="alert-link">
                  Review inventory
                </Link>
              </span>
            </div>
          )}

          <h3 className="h6 fw-bold mb-3 text-muted text-uppercase" style={{ letterSpacing: "0.06em", fontSize: "0.7rem" }}>
            Quick actions
          </h3>
          <div className="row g-3">
            {quickLinks.map((c) => (
              <div className="col-md-6 col-lg-4" key={c.to}>
                <Link to={c.to} className="admin-dashboard-link d-block h-100">
                  <div className="admin-card admin-card--hover h-100 p-3">
                    <div className="d-flex align-items-start gap-3">
                      <span
                        className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary"
                        style={{ width: 40, height: 40, fontSize: "1.1rem" }}
                        aria-hidden="true"
                      >
                        {c.icon}
                      </span>
                      <div>
                        <h4 className="h6 fw-bold mb-1">{c.title}</h4>
                        <p className="small text-muted mb-0">{c.text}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
