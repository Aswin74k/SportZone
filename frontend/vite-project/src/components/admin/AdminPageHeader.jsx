export default function AdminPageHeader({ title, subtitle, children }) {
  return (
    <div className="admin-page-header d-flex flex-wrap align-items-start justify-content-between gap-3">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2 align-items-center">{children}</div>}
    </div>
  );
}
