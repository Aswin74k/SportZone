import StoreShell from "../components/StoreShell";

function Terms() {
  return (
    <StoreShell>
      <div className="container-fluid container-xl" style={{ maxWidth: 720 }}>
        <div className="sz-section">
          <p className="sz-kicker mb-1">Legal</p>
          <h1 className="h3 fw-bold mb-3">Terms & conditions</h1>
          <p className="text-muted mb-2">
            By using SportZone, you agree to our terms regarding account usage, product purchases,
            shipping policies, and returns.
          </p>
          <p className="text-muted mb-0">Contact support@sportzone.com for any clarification.</p>
        </div>
      </div>
    </StoreShell>
  );
}

export default Terms;
