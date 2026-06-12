export default function AdminLoadMore({ hasNext, loading, onLoadMore }) {
  if (!hasNext) return null;

  return (
    <div className="text-center mt-4">
      <button type="button" className="btn btn-outline-primary btn-sm px-4" onClick={onLoadMore} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Loading…
          </>
        ) : (
          "Load more"
        )}
      </button>
    </div>
  );
}
