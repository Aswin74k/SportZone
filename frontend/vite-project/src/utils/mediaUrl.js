const API_ORIGIN = "http://127.0.0.1:8000";

/** Resolve relative media paths from the Django API to absolute URLs. */
export function mediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}
