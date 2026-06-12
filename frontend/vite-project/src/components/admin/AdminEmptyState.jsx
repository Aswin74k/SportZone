export default function AdminEmptyState({ icon = "📭", title = "Nothing here yet", message, action }) {
  return (
    <div className="admin-empty admin-card">
      <div className="admin-empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      {message && <p className="small mb-3">{message}</p>}
      {action}
    </div>
  );
}
