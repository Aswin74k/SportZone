import React from "react";
import { motion } from "framer-motion";
import {
  FaChevronDown,
  FaHome,
  FaBriefcase,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

export default function AddressStep({
  activeStep,
  setActiveStep,
  addressComplete,
  fullName,
  city,
  state,
  pincode,
  phone,
  addresses,
  selectedAddressId,
  addressEditing,
  setAddressEditing,
  saveToProfile,
  setSaveToProfile,
  handleSelectSavedAddress,
  handleAddressSubmit,
  handleCancelAddressEdit,
  handleStepClick,
  register,
  setValue,
  errors,
  reset,
  addressType,
  loading,
}) {
  return (
    <div
      className={`sz-co-step-card ${activeStep === "address" ? "active" : ""} ${
        addressComplete ? "completed" : "pending"
      }`}
    >
      {activeStep === "address" ? (
        <>
          <header className="sz-co-step-header active" onClick={() => handleStepClick("address")}>
            <div className="sz-co-step-title-block">
              <div className="sz-co-step-badge-num active">1</div>
              <div>
                <h2>Delivery Address</h2>
                <p>Where should we deliver your order?</p>
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
            {/* Saved Addresses List */}
            {addresses.length > 0 && !addressEditing && (
              <div className="sz-co-address-grid">
                {addresses.map((addr) => {
                  const isHome = addr.address_type?.toUpperCase() === "HOME" || !addr.address_type;
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      key={addr.id}
                      className={`sz-co-addr-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectSavedAddress(addr)}
                    >
                      <div className="sz-co-addr-card-header">
                        <span className="sz-co-addr-type">
                          {isHome ? (
                            <>
                              <FaHome className="me-1" /> Home
                            </>
                          ) : (
                            <>
                              <FaBriefcase className="me-1" /> Work
                            </>
                          )}
                        </span>
                        {isSelected ? (
                          <span className="sz-co-addr-selected-badge">
                            <FaCheckCircle />
                          </span>
                        ) : (
                          <span className="sz-co-addr-select-dot" />
                        )}
                      </div>
                      <h4 className="sz-co-addr-name">{addr.full_name}</h4>
                      <p className="sz-co-addr-text">
                        {addr.house_name ? `${addr.house_name}, ` : ""}
                        {addr.area ? `${addr.area}, ` : ""}
                        {addr.landmark ? `(${addr.landmark}), ` : ""}
                        {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                      </p>
                      <div className="sz-co-addr-phone-line">Phone: +91 {addr.phone}</div>
                    </motion.div>
                  );
                })}

                {/* Add New Address Clickable Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="sz-co-addr-card add-new-card"
                  onClick={() => {
                    reset({
                      fullName: "",
                      phone: "",
                      houseName: "",
                      area: "",
                      landmark: "",
                      city: "",
                      district: "",
                      state: "",
                      pincode: "",
                      addressType: "HOME",
                    });
                    setSaveToProfile(true);
                    setAddressEditing(true);
                  }}
                >
                  <div className="add-new-card-content">
                    <span className="add-new-plus">+</span>
                    <span className="add-new-text">Add New Address</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Manual Address Form */}
            {addressEditing && (
              <div className="sz-co-new-addr-box">
                <h3 className="sz-co-new-addr-title">Add New Address</h3>
                <div className="sz-co-form-grid">
                  {/* Full Name & Mobile */}
                  <div className="sz-co-form-row two-col">
                    <div className="sz-co-input-group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Full name"
                        className={errors.fullName ? "invalid" : ""}
                        {...register("fullName", { required: "Required" })}
                      />
                      {errors.fullName && <span className="sz-co-field-error">{errors.fullName.message}</span>}
                    </div>

                    <div className="sz-co-input-group">
                      <label htmlFor="phone">Mobile Number</label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="10-digit number"
                        className={errors.phone ? "invalid" : ""}
                        {...register("phone", {
                          required: "Required",
                          pattern: { value: /^\d{10}$/, message: "10 digits required" },
                        })}
                      />
                      {errors.phone && <span className="sz-co-field-error">{errors.phone.message}</span>}
                    </div>
                  </div>

                  {/* House details & Area details */}
                  <div className="sz-co-form-row two-col">
                    <div className="sz-co-input-group">
                      <label htmlFor="houseName">Flat / House Name / Building</label>
                      <input
                        id="houseName"
                        type="text"
                        placeholder="Flat, house no. details"
                        className={errors.houseName ? "invalid" : ""}
                        {...register("houseName", { required: "Required" })}
                      />
                      {errors.houseName && (
                        <span className="sz-co-field-error">{errors.houseName.message}</span>
                      )}
                    </div>

                    <div className="sz-co-input-group">
                      <label htmlFor="area">Colony / Street / Area</label>
                      <input
                        id="area"
                        type="text"
                        placeholder="Area, street name"
                        className={errors.area ? "invalid" : ""}
                        {...register("area", { required: "Required" })}
                      />
                      {errors.area && <span className="sz-co-field-error">{errors.area.message}</span>}
                    </div>
                  </div>

                  {/* Landmark & City */}
                  <div className="sz-co-form-row two-col">
                    <div className="sz-co-input-group">
                      <label htmlFor="landmark">Landmark (Optional)</label>
                      <input id="landmark" type="text" placeholder="E.g., near park" {...register("landmark")} />
                    </div>

                    <div className="sz-co-input-group">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        placeholder="City"
                        className={errors.city ? "invalid" : ""}
                        {...register("city", { required: "Required" })}
                      />
                      {errors.city && <span className="sz-co-field-error">{errors.city.message}</span>}
                    </div>
                  </div>

                  {/* District, State, Pincode */}
                  <div className="sz-co-form-row three-col">
                    <div className="sz-co-input-group">
                      <label htmlFor="district">District</label>
                      <input
                        id="district"
                        type="text"
                        placeholder="District"
                        className={errors.district ? "invalid" : ""}
                        {...register("district", { required: "Required" })}
                      />
                      {errors.district && (
                        <span className="sz-co-field-error">{errors.district.message}</span>
                      )}
                    </div>

                    <div className="sz-co-input-group">
                      <label htmlFor="state">State</label>
                      <input
                        id="state"
                        type="text"
                        placeholder="State"
                        className={errors.state ? "invalid" : ""}
                        {...register("state", { required: "Required" })}
                      />
                      {errors.state && <span className="sz-co-field-error">{errors.state.message}</span>}
                    </div>

                    <div className="sz-co-input-group">
                      <label htmlFor="pincode">Pincode</label>
                      <input
                        id="pincode"
                        type="text"
                        maxLength={6}
                        placeholder="6 digits"
                        className={errors.pincode ? "invalid" : ""}
                        {...register("pincode", {
                          required: "Required",
                          pattern: { value: /^\d{6}$/, message: "6 digits required" },
                        })}
                      />
                      {errors.pincode && <span className="sz-co-field-error">{errors.pincode.message}</span>}
                    </div>
                  </div>

                  {/* Form options */}
                  <div className="sz-co-form-actions-row">
                    <div className="sz-co-addr-type-selector">
                      <span className="sz-co-type-lbl">Address Type:</span>
                      <button
                        type="button"
                        className={`sz-co-type-btn ${addressType === "HOME" ? "active" : ""}`}
                        onClick={() => setValue("addressType", "HOME", { shouldDirty: true })}
                      >
                        Home
                      </button>
                      <button
                        type="button"
                        className={`sz-co-type-btn ${addressType === "WORK" ? "active" : ""}`}
                        onClick={() => setValue("addressType", "WORK", { shouldDirty: true })}
                      >
                        Work
                      </button>
                    </div>

                    <label className="sz-co-checkbox-label">
                      <input
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                      />
                      <span>Save address to profile</span>
                    </label>
                  </div>

                  <div className="sz-co-step-action-bar">
                    {addresses.length > 0 && (
                      <button type="button" className="sz-co-cancel-btn" onClick={handleCancelAddressEdit}>
                        Cancel
                      </button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="sz-co-primary-btn"
                      onClick={handleAddressSubmit}
                      disabled={loading}
                    >
                      {loading ? <FaSpinner className="spin-icon" /> : "Save & Continue"}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      ) : addressComplete ? (
        <div className="sz-co-step-collapsed" onClick={() => handleStepClick("address")}>
          <div className="sz-co-collapsed-left">
            <FaCheckCircle className="sz-co-success-icon" />
            <div className="sz-co-collapsed-info">
              <h3>Delivery Address</h3>
              <p>
                {fullName} · {city}, {state} {pincode} · +91 {phone}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="sz-co-change-btn"
            onClick={(e) => {
              e.stopPropagation();
              setActiveStep("address");
              setAddressEditing(addresses.length === 0);
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <header className="sz-co-step-header disabled">
          <div className="sz-co-step-title-block">
            <div className="sz-co-step-badge-num">1</div>
            <div>
              <h2>Delivery Address</h2>
              <p>Where should we deliver your order?</p>
            </div>
          </div>
        </header>
      )}
    </div>
  );
}
