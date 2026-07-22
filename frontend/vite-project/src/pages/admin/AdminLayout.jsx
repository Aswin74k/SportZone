import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

const links = [
  { to: "/admin", label: "Dashboard", end: true, iconKey: "dashboard" },
  { to: "/admin/products", label: "Products", iconKey: "products" },
  { to: "/admin/categories", label: "Categories", iconKey: "categories" },
  { to: "/admin/brands", label: "Brands", iconKey: "brands" },
  { to: "/admin/banners", label: "Banners", iconKey: "banners" },
  { to: "/admin/offers", label: "Offers", iconKey: "offers" },
  { to: "/admin/orders", label: "Orders", iconKey: "orders" },
  { to: "/admin/users", label: "Users", iconKey: "users" },
  { to: "/admin/reviews", label: "Reviews", iconKey: "reviews" },
];

function AdminIcon({ name }) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "products":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "brands":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "banners":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case "offers":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "reviews":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "store":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Generate page heading breadcrumbs based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard Overview";
    const segment = path.split("/").pop() || "";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const userInitials = user?.name ? user.name.slice(0, 2) : (user?.username ? user.username.slice(0, 2) : "SU");
  const userName = user?.name || user?.username || "Staff User";
  const userRole = user?.is_superuser ? "Super Admin" : "Staff Member";

  return (
    <div className="admin-shell">
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <h1>
            <svg viewBox="0 0 160 38" width="140" height="32" xmlns="http://www.w3.org/2000/svg">
              <text
                x="0"
                y="26"
                style={{
                  fontFamily: '"Inter", "Arial Black", sans-serif',
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontSize: "23px",
                  letterSpacing: "-0.04em"
                }}
              >
                <tspan fill="#ffffff">SPORT</tspan>
                <tspan fill="#38BDF8">ZONE</tspan>
              </text>
              <path
                d="M 42 29 Q 95 38 145 30 Q 95 34 42 29"
                fill="#38BDF8"
              />
            </svg>
          </h1>
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
                <AdminIcon name={l.iconKey} />
              </span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-avatar">
              {userInitials}
            </div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">{userName}</div>
              <div className="admin-sidebar-user-role">{userRole}</div>
            </div>
            <button
              type="button"
              className="btn p-1 border-0 bg-transparent text-muted text-hover-white"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <span style={{ width: 18, height: 18, display: "inline-block" }}>
                <AdminIcon name="logout" />
              </span>
            </button>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => navigate("/")} style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
            <span style={{ width: 14, height: 14, display: "inline-block" }}>
              <AdminIcon name="store" />
            </span>
            Back to store
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm admin-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰ Menu
            </button>
            <span className="fw-semibold text-muted d-none d-md-inline small">SportZone Admin</span>
            <span className="text-muted d-none d-md-inline">/</span>
            <span className="fw-bold text-primary">{getPageTitle()}</span>
          </div>
          <div className="admin-topbar-right">
          
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
