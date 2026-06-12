export default function AdminLoading({ message = "Loading data…" }) {
  return (
    <div className="admin-loading">
      <div className="spinner-border" role="status" aria-hidden="true" />
      <p className="mt-3 mb-0 small">{message}</p>
    </div>
  );
}
