import React from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export default function MobileCheckoutBar({
  finalTotal,
  pricing,
  paymentMethod,
  loading,
  payDisabled,
  handleSubmitOrder,
}) {
  return (
    <div className="sz-co-mobile-bar d-lg-none">
      <div className="sz-co-mobile-val">
        <small>Total Payable</small>
        <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>
        {pricing.totalSavings > 0 && (
          <span className="sz-co-mobile-savings">Save ₹{pricing.totalSavings.toLocaleString("en-IN")}</span>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        className="sz-co-mobile-pay-btn"
        onClick={handleSubmitOrder}
        disabled={payDisabled}
      >
        {loading ? (
          <FaSpinner className="spin-icon" />
        ) : paymentMethod === "COD" ? (
          "Confirm Order"
        ) : (
          "Proceed to Pay"
        )}
      </motion.button>
    </div>
  );
}
