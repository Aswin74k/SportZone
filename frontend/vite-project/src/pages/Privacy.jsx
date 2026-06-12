import StoreShell from "../components/StoreShell";

function Privacy() {
  return (
    <StoreShell>
      <div className="container-fluid container-xl" style={{ maxWidth: 720 }}>
        <div className="sz-section">
          <p className="sz-kicker mb-1">Legal</p>
          <h1 className="h3 fw-bold mb-3">Privacy policy</h1>
          <p className="text-muted mb-2">
            We value your privacy. SportZone uses your account data only to process orders,
            improve recommendations, and provide customer support.
          </p>
          <p className="text-muted mb-0">We never sell personal information to third parties.</p>
        </div>
      </div>
    </StoreShell>
  );
}

export default Privacy;
