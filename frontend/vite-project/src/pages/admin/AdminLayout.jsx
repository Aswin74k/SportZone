import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "../../styles/admin.css";

const links = [
  { to: "/admin", label: "Overview", end: true, icon: "◉" },
  { to: "/admin/products", label: "Products", icon: "▣" },
  { to: "/admin/categories", label: "Categories", icon: "☰" },
  { to: "/admin/brands", label: "Brands", icon: "▧" },
  { to: "/admin/orders", label: "Orders", icon: "◎" },
  { to: "/admin/users", label: "Users", icon: "◇" },
  { to: "/admin/banners", label: "Banners", icon: "▤" },
  { to: "/admin/offers", label: "Offers", icon: "％" },
  { to: "/admin/reviews", label: "Reviews", icon: "★" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <h1 className="text-primary">SportZone</h1>
          <p>Seller dashboard</p>
        </div>
        <nav className="admin-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                {l.icon}
              </span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => navigate("/")}>
            ← Back to store
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm admin-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰ Menu
          </button>
          <span className="fw-bold small text-primary">SportZone Admin</span>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
