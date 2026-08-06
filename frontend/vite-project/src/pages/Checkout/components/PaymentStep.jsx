import React from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaShieldAlt, FaSpinner } from "react-icons/fa";
import { UPI_UNAVAILABLE } from "../utils/checkoutHelpers";
import {
  UPILogo,
  GPayLogo,
  PhonePeLogo,
  PaytmLogo,
  VisaLogo,
  MastercardLogo,
  RuPayLogo,
  SbiLogo,
  HdfcLogo,
  IciciLogo,
  CODLogo,
} from "./PaymentBrandLogos";

export default function PaymentStep({
  activeStep,
  paymentMethod,
  setPaymentMethod,
  razorpayReady,
  codCaptcha,
  setCodCaptcha,
  codCaptchaInput,
  setCodCaptchaInput,
  handleStepClick,
}) {
  return (
    <div className={`sz-co-step-card ${activeStep === "payment" ? "active" : "pending"}`}>
      {activeStep === "payment" ? (
        <>
          <header className="sz-co-step-header active" onClick={() => handleStepClick("payment")}>
            <div className="sz-co-step-title-block">
              <div className="sz-co-step-badge-num active">3</div>
              <div>
                <h2>Secure Payment</h2>
                <p>Select your payment method</p>
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
            <div className="sz-co-pay-options-list">
              {/* Option 1: UPI */}
              <div
                className={`sz-co-pay-tile ${paymentMethod === "UPI" ? "active" : ""}`}
                onClick={() => setPaymentMethod("UPI")}
              >
                <div className="sz-co-pay-tile-left">
                  <span className="sz-co-pay-tile-radio" />
                  <div className="sz-co-pay-tile-info">
                    <strong className="sz-co-pay-tile-title">UPI</strong>
                    <span className="sz-co-pay-tile-desc">Google Pay, PhonePe, Paytm</span>
                  </div>
                </div>
                <div className="sz-co-pay-tile-logos">
                  <UPILogo />
                </div>
              </div>

              {paymentMethod === "UPI" && (
                <div className="sz-co-upi-apps-row">
                  <div className="sz-co-upi-logos-container">
                    <GPayLogo />
                    <PhonePeLogo />
                    <PaytmLogo />
                  </div>
                  {UPI_UNAVAILABLE && (
                    <div className="sz-co-upi-disabled-banner">UPI currently unavailable</div>
                  )}
                </div>
              )}

              {/* Option 2: Card */}
              <div
                className={`sz-co-pay-tile ${paymentMethod === "Card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Card")}
              >
                <div className="sz-co-pay-tile-left">
                  <span className="sz-co-pay-tile-radio" />
                  <div className="sz-co-pay-tile-info">
                    <strong className="sz-co-pay-tile-title">Credit / Debit Card</strong>
                    <span className="sz-co-pay-tile-desc">Visa, Mastercard, RuPay accepted</span>
                  </div>
                </div>
                <div className="sz-co-pay-tile-logos">
                  <VisaLogo />
                  <MastercardLogo />
                  <RuPayLogo />
                </div>
              </div>

              {paymentMethod === "Card" && (
                <div className="sz-co-secure-redirect-card">
                  <FaShieldAlt className="sz-co-redirect-shield-icon" />
                  <p className="sz-co-redirect-text">
                    Card details are secured and processed externally by Razorpay.
                  </p>
                </div>
              )}

              {/* Option 3: NetBanking */}
              <div
                className={`sz-co-pay-tile ${paymentMethod === "NetBanking" ? "active" : ""}`}
                onClick={() => setPaymentMethod("NetBanking")}
              >
                <div className="sz-co-pay-tile-left">
                  <span className="sz-co-pay-tile-radio" />
                  <div className="sz-co-pay-tile-info">
                    <strong className="sz-co-pay-tile-title">Net Banking</strong>
                    <span className="sz-co-pay-tile-desc">SBI, HDFC, ICICI & major banks</span>
                  </div>
                </div>
                <div className="sz-co-pay-tile-logos">
                  <SbiLogo />
                  <HdfcLogo />
                  <IciciLogo />
                </div>
              </div>

              {paymentMethod === "NetBanking" && (
                <div className="sz-co-secure-redirect-card">
                  <FaShieldAlt className="sz-co-redirect-shield-icon" />
                  <p className="sz-co-redirect-text">
                    You will be redirected to Razorpay to select your bank account.
                  </p>
                </div>
              )}

              {/* Option 4: COD */}
              <div
                className={`sz-co-pay-tile ${paymentMethod === "COD" ? "active" : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <div className="sz-co-pay-tile-left">
                  <span className="sz-co-pay-tile-radio" />
                  <div className="sz-co-pay-tile-info">
                    <strong className="sz-co-pay-tile-title">Cash on Delivery</strong>
                    <span className="sz-co-pay-tile-desc">Pay cash or scan QR when package arrives</span>
                  </div>
                </div>
                <div className="sz-co-pay-tile-logos">
                  <CODLogo />
                </div>
              </div>

              {paymentMethod === "COD" && (
                <div className="sz-co-cod-captcha-panel">
                  <div className="sz-co-captcha-flex">
                    <div
                      className="sz-co-captcha-image-box"
                      title="Click to refresh CAPTCHA"
                      onClick={() => setCodCaptcha(Math.floor(100 + Math.random() * 900))}
                    >
                      {codCaptcha}
                    </div>
                    <div className="sz-co-captcha-input-field">
                      <label htmlFor="codCaptcha">Verification Code</label>
                      <input
                        id="codCaptcha"
                        type="text"
                        maxLength={3}
                        placeholder="Code"
                        value={codCaptchaInput}
                        onChange={(e) => setCodCaptchaInput(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!razorpayReady && (
              <p className="sz-co-gateway-load">
                <FaSpinner className="spin-icon" /> Loading payment gateway...
              </p>
            )}

            {/* Razorpay secured message */}
            <div className="sz-co-secure-footer-card">
              <FaShieldAlt />
              <span>Payments are secured by Razorpay</span>
            </div>
          </motion.div>
        </>
      ) : (
        <header className="sz-co-step-header disabled">
          <div className="sz-co-step-title-block">
            <div className="sz-co-step-badge-num">3</div>
            <div>
              <h2>Secure Payment</h2>
              <p>Select your payment method</p>
            </div>
          </div>
        </header>
      )}
    </div>
  );
}
