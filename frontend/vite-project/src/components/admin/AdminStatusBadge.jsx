const STATUS_MAP = {
  pending: "warning",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  active: "success",
  inactive: "secondary",
  blocked: "danger",
  approved: "success",
  unapproved: "warning",
  yes: "success",
  no: "secondary",
};

export default function AdminStatusBadge({ status, variant }) {
  const key = String(status ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const tone = variant || STATUS_MAP[key] || "secondary";
  const label = status ?? "—";

  return <span className={`admin-badge admin-badge--${tone}`}>{label}</span>;
}
