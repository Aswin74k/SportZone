export default function AdminTableCard({ children, isEmpty, empty }) {
  if (isEmpty && empty) {
    return empty;
  }

  return (
    <div className="admin-card admin-table-wrap">
      <div className="table-responsive">{children}</div>
    </div>
  );
}
