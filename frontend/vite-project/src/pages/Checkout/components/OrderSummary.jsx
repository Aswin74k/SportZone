import React from "react";
import { motion } from "framer-motion";
import { FaTag, FaTruck, FaUndo, FaShieldAlt, FaSpinner } from "react-icons/fa";
import { mediaUrl } from "../../../utils/mediaUrl";

export default function OrderSummary({
  items,
  pricing,
  subtotal,
  discount,
  finalTotal,
  paymentMethod,
  loading,
  payDisabled,
  estimatedDeliveryDate,
  handleSubmitOrder,
}) {
  return (
    <aside className="sz-co-summary-sidebar">
      <div className="sz-co-summary-card">
        <header className="sz-co-summary-header">
          <h3>Order Summary</h3>
          <span className="sz-co-items-count-badge">
            {items.length} Item{items.length !== 1 ? "s" : ""}
          </span>
        </header>

        {/* Pricing savings summary (styled as premium tag banner) */}
        {pricing.totalSavings > 0 && (
          <div className="sz-co-savings-banner">
            <FaTag className="sz-co-savings-icon" />
            <span>
              You are saving <strong>₹{pricing.totalSavings.toLocaleString("en-IN")}</strong> on this order!
            </span>
          </div>
        )}

        {/* Products summary list */}
        <ul className="sz-co-sidebar-items-list">
          {items.map((item) => {
            const price = Number(item.product.price || 0);
            return (
              <li key={item.id} className="sz-co-sidebar-item">
                <div className="sz-co-sidebar-img">
                  <img src={mediaUrl(item.product.image) || "/no-image.png"} alt={item.product.name} />
                </div>
                <div className="sz-co-sidebar-info">
                  <p>{item.product.name}</p>
                  <span>
                    Qty {item.quantity}
                    {item.size && item.size !== "N/A" && item.size !== "n/a" && ` · Size ${item.size}`}
                  </span>
                </div>
                <strong className="sz-co-sidebar-item-price">
                  ₹{(price * item.quantity).toLocaleString("en-IN")}
                </strong>
              </li>
            );
          })}
        </ul>

        {/* Pricing Breakdown Table */}
        <div className="sz-co-breakdown-details">
          <div className="sz-co-row-stat">
            <span>Total Price ({items.length} items)</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {pricing.productSavings > 0 && (
            <div className="sz-co-row-stat discount">
              <span>Product Discount</span>
              <span>- ₹{pricing.productSavings.toLocaleString("en-IN")}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="sz-co-row-stat discount">
              <span>Coupon Savings</span>
              <span>- ₹{discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="sz-co-row-stat">
            <span>Delivery Shipping</span>
            <span className="sz-co-free-shipping-text">
              <s>₹{pricing.deliverySavings}</s> FREE
            </span>
          </div>
          <div className="sz-co-row-stat grand-payable">
            <span>Total Payable</span>
            <span>₹{finalTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Secure checkout button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className="sz-co-submit-pay-btn"
          onClick={handleSubmitOrder}
          disabled={payDisabled}
        >
          {loading ? (
            <>
              <FaSpinner className="spin-icon" /> Securing Order...
            </>
          ) : paymentMethod === "COD" ? (
            <>Confirm Order · ₹{finalTotal.toLocaleString("en-IN")}</>
          ) : (
            <>Proceed to Pay ₹{finalTotal.toLocaleString("en-IN")}</>
          )}
        </motion.button>

        <div className="sz-co-delivery-estimate-sidebar">
          <FaTruck />
          <span>
            Est. Delivery:{" "}
            <strong>
              {estimatedDeliveryDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </strong>
          </span>
        </div>

        {/* Trust Badges */}
        <div className="sz-co-trust-badges-row">
          <div className="sz-co-trust-badge">
            <FaTruck />
            <span>Fast Delivery</span>
          </div>
          <div className="sz-co-trust-badge">
            <FaUndo />
            <span>Easy Returns</span>
          </div>
          <div className="sz-co-trust-badge">
            <FaShieldAlt />
            <span>Razorpay Secure</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
