export default function AdminFormCard({ title, children, footer }) {
  return (
    <div className="admin-card admin-form-card mb-4">
      {title && <div className="admin-card-header">{title}</div>}
      <div className="admin-card-body">{children}</div>
      {footer && <div className="admin-card-body pt-0 border-top">{footer}</div>}
    </div>
  );
}
