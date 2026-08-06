import React from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaTruck, FaCheckCircle } from "react-icons/fa";
import { mediaUrl } from "../../../utils/mediaUrl";
import { calcItemMrp } from "../utils/pricingHelpers";

export default function ReviewStep({
  activeStep,
  setActiveStep,
  items,
  estimatedDeliveryDate,
  handleStepClick,
}) {
  return (
    <div
      className={`sz-co-step-card ${activeStep === "review" ? "active" : ""} ${
        activeStep === "payment" ? "completed" : "pending"
      }`}
    >
      {activeStep === "review" ? (
        <>
          <header className="sz-co-step-header active" onClick={() => handleStepClick("review")}>
            <div className="sz-co-step-title-block">
              <div className="sz-co-step-badge-num active">2</div>
              <div>
                <h2>Order Review</h2>
                <p>Verify your items & quantities</p>
              </div>
            </div>
            <FaChevronDown className="sz-co-step-arrow" />
          </header>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="sz-co-step-content"
          >
            <div className="sz-co-review-items">
              {items.map((item) => {
                const itemPrice = Number(item.product.price || 0);
                const itemMrp = calcItemMrp(item.product);
                return (
                  <div key={item.id} className="sz-co-review-item-card">
                    <div className="sz-co-review-img">
                      <img src={mediaUrl(item.product.image) || "/no-image.png"} alt={item.product.name} />
                    </div>
                    <div className="sz-co-review-details">
                      <h3 className="sz-co-review-name">{item.product.name}</h3>
                      <div className="sz-co-review-meta">
                        {item.size && item.size !== "N/A" && item.size !== "n/a" && (
                          <span className="sz-co-meta-pill">Size: {item.size}</span>
                        )}
                        <span className="sz-co-meta-pill">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="sz-co-review-price-box">
                      <strong className="sz-co-review-price">
                        ₹{(itemPrice * item.quantity).toLocaleString("en-IN")}
                      </strong>
                      {itemMrp > itemPrice && (
                        <span className="sz-co-review-mrp">
                          ₹{(itemMrp * item.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Date Guarantee */}
            <div className="sz-co-delivery-estimate-card">
              <FaTruck className="sz-co-delivery-icon" />
              <p className="sz-co-delivery-text">
                SportZone Delivery. Estimated Delivery:{" "}
                <strong>
                  {estimatedDeliveryDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </p>
            </div>

            <div className="sz-co-step-action-bar">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="sz-co-primary-btn"
                onClick={() => setActiveStep("payment")}
              >
                Select Payment Method
              </motion.button>
            </div>
          </motion.div>
        </>
      ) : activeStep === "payment" ? (
        <div className="sz-co-step-collapsed" onClick={() => handleStepClick("review")}>
          <div className="sz-co-collapsed-left">
            <FaCheckCircle className="sz-co-success-icon" />
            <div className="sz-co-collapsed-info">
              <h3>Order Review</h3>
              <p>
                {items.length} item{items.length !== 1 ? "s" : ""} selected for delivery · Est. Delivery:{" "}
                {estimatedDeliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sz-co-change-btn"
            onClick={(e) => {
              e.stopPropagation();
              setActiveStep("review");
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <header className="sz-co-step-header disabled">
          <div className="sz-co-step-title-block">
            <div className="sz-co-step-badge-num">2</div>
            <div>
              <h2>Order Review</h2>
              <p>Verify your items & quantities</p>
            </div>
          </div>
        </header>
      )}
    </div>
  );
}
