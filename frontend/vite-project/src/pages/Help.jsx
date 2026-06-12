import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaHeadset } from "react-icons/fa";
import StoreShell from "../components/StoreShell";

function Help() {
  return (
    <StoreShell>
      <div className="container-fluid container-xl" style={{ maxWidth: 720 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="sz-kicker mb-1">Support</p>
          <h1 className="h3 fw-bold mb-2">Help center</h1>
          <p className="text-muted mb-4">We are here for orders, returns, and product questions.</p>
        </motion.div>

        <div className="sz-section">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48, background: "var(--sz-blue-soft)" }}
            >
              <FaHeadset className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="h6 fw-bold mb-0">Contact SportZone</h2>
              <p className="small text-muted mb-0">Typical reply within 24 hours</p>
            </div>
          </div>
          <p className="d-flex align-items-center gap-2 mb-2">
            <FaEnvelope className="text-primary" />
            <span>
              Email: <strong>support@sportzone.com</strong>
            </span>
          </p>
          <p className="d-flex align-items-center gap-2 mb-0">
            <FaPhone className="text-primary" />
            <span>
              Phone: <strong>+91 7736476734</strong>
            </span>
          </p>
        </div>
      </div>
    </StoreShell>
  );
}

export default Help;
