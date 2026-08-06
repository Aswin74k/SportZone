import Footer from "./Footer";

/** Wraps storefront pages with consistent bottom spacing; footer on all shop pages. */
export default function StoreShell({ children, showFooter = true }) {
  return (
    <div className="sz-page">
      <div className="sz-page-inner">{children}</div>
      {showFooter && <Footer />}
    </div>
  );
}
