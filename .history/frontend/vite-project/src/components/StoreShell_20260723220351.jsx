import Footer from "./Footer";

export default function StoreShell({ children, showFooter = true }) {
  return (
    <div className="sz-page">
      <div className="sz-page-inner">{children}</div>
      {showFooter && <Footer />}
    </div>
  );
}
