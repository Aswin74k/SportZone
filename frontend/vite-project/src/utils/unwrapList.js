/** Normalize list endpoints that return either an array or paginated `{ results }`. */
export function unwrapList(data) {
  return Array.isArray(data) ? data : data?.results ?? [];
}
