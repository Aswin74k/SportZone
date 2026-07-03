import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaTruck,
  FaTag,
  FaEdit,
  FaShoppingCart,
  FaCreditCard,
  FaUniversity,
  FaMoneyBillWave,
  FaChevronRight,
  FaChevronDown,
  FaPhone,
  FaUser,
  FaHome,
  FaBriefcase,
  FaCheck,
  FaRegCheckCircle,
  FaCalendarAlt,
  FaUndo,
} from "react-icons/fa";
import API from "../api";
import { useCart } from "../context/CartContext.jsx";
import { mediaUrl } from "../utils/mediaUrl";
import StoreShell from "../components/StoreShell";
import {
  GPayLogo,
  PhonePeLogo,
  PaytmLogo,
  UPILogo,
  VisaLogo,
  MastercardLogo,
  RuPayLogo,
  SbiLogo,
  HdfcLogo,
  IciciLogo,
  CODLogo,
} from "../components/checkout/PaymentBrandLogos";
import "./Checkout.css";

const UPI_UNAVAILABLE = true;

const RAZORPAY_METHOD_MAP = {
  Card: { upi: false, card: true, netbanking: false, wallet: false, paylater: false },
  NetBanking: { upi: false, card: false, netbanking: true, wallet: false, paylater: false },
};

function calcItemMrp(product) {
  const price = Number(product?.price || 0);
  if (product?.original_price) return Number(product.original_price);
  return Math.round(price * 1.25);
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();

  const buyNowItem = location.state?.product ? location.state : null;

  // Active step: "address" | "review" | "payment"
  const [activeStep, setActiveStep] = useState("address");

  // Address fields mapping 1:1 with backend serializer
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseName, setHouseName] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState("HOME"); // "HOME" | "WORK"
  const [saveToProfile, setSaveToProfile] = useState(true);

  const [errors, setErrors] = useState({});
  const [addressEditing, setAddressEditing] = useState(true);

  // Selected payment sub-method: "Card" | "NetBanking" | "UPI" | "COD"
  const [paymentMethod, setPaymentMethod] = useState("Card");
  
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Cash on Delivery CAPTCHA validation
  const [codCaptcha, setCodCaptcha] = useState(() => Math.floor(100 + Math.random() * 900));
  const [codCaptchaInput, setCodCaptchaInput] = useState("");

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return undefined;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => toast.error("Failed to load payment gateway. Please refresh.");
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await API.get("addresses/");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAddresses(res.data);
          const defaultAddress = res.data.find((a) => a.is_default) || res.data[0];
          if (defaultAddress) {
            applyAddress(defaultAddress);
            setSelectedAddressId(defaultAddress.id);
            setAddressEditing(false);
            setActiveStep("review"); // Auto-progress to review step
          }
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };
    fetchAddresses();
  }, []);

  const items = useMemo(() => {
    return buyNowItem
      ? [{
          id: `buynow-${buyNowItem.product.id}`,
          product: buyNowItem.product,
          quantity: buyNowItem.quantity || 1,
          size: buyNowItem.size || "N/A",
        }]
      : cartItems;
  }, [buyNowItem, cartItems]);

  const subtotal = useMemo(() => {
    return buyNowItem
      ? Number(buyNowItem.product.price || 0) * (buyNowItem.quantity || 1)
      : cartTotal;
  }, [buyNowItem, cartTotal]);

  const discount = 0;
  const shipping = 0;
  const finalTotal = Math.max(0, subtotal - discount + shipping);
  const isOnlinePayment = paymentMethod !== "COD";

  const pricing = useMemo(() => {
    let mrpTotal = 0;
    items.forEach((item) => {
      const mrp = calcItemMrp(item.product);
      mrpTotal += mrp * item.quantity;
    });
    const productSavings = Math.max(0, mrpTotal - subtotal);
    const deliverySavings = 99;
    return {
      mrpTotal,
      productSavings,
      deliverySavings,
      totalSavings: productSavings + deliverySavings + discount,
    };
  }, [items, subtotal, discount]);

  const getLine1 = useCallback(() => {
    let constructed = houseName.trim();
    if (area.trim()) constructed += `, ${area.trim()}`;
    if (landmark.trim()) constructed += ` (${landmark.trim()})`;
    return constructed;
  }, [houseName, area, landmark]);

  const addressComplete = useMemo(() => {
    return fullName.trim() && phone.trim() && houseName.trim() && area.trim() && city.trim() && district.trim() && state.trim() && pincode.trim();
  }, [fullName, phone, houseName, area, city, district, state, pincode]);

  function applyAddress(addr) {
    setFullName(addr.full_name || "");
    setPhone(addr.phone || "");
    setHouseName(addr.house_name || "");
    setArea(addr.area || "");
    setLandmark(addr.landmark || "");
    setCity(addr.city || "");
    setDistrict(addr.district || "");
    setState(addr.state || "");
    setPincode(addr.pincode || "");
    setAddressType(addr.address_type || "HOME");
  }

  const validateAddressFields = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    else if (!/^\d{10}$/.test(phone.trim().replace(/\D/g, ""))) newErrors.phone = "10 digits required";
    if (!houseName.trim()) newErrors.houseName = "Required";
    if (!area.trim()) newErrors.area = "Required";
    if (!city.trim()) newErrors.city = "Required";
    if (!district.trim()) newErrors.district = "Required";
    if (!state.trim()) newErrors.state = "Required";
    if (!pincode.trim()) newErrors.pincode = "Required";
    else if (!/^\d{6}$/.test(pincode.trim())) newErrors.pincode = "6 digits required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const isAddressValid = validateAddressFields();
    if (!isAddressValid) {
      toast.error("Please fill required address details.");
      setActiveStep("address");
      setAddressEditing(true);
      return false;
    }

    if (paymentMethod === "COD") {
      if (!codCaptchaInput.trim()) {
        toast.error("Please enter the COD verification code.");
        return false;
      }
      if (codCaptchaInput.trim() !== String(codCaptcha)) {
        toast.error("Incorrect verification code.");
        return false;
      }
    }

    if (paymentMethod === "UPI") {
      toast.error("Direct UPI is unavailable. Please select Card or Net Banking.");
      return false;
    }

    return true;
  };

  const handleFieldChange = (field, val) => {
    const map = {
      fullName: setFullName,
      phone: setPhone,
      houseName: setHouseName,
      area: setArea,
      landmark: setLandmark,
      city: setCity,
      district: setDistrict,
      state: setState,
      pincode: setPincode
    };
    map[field]?.(val);
    setSelectedAddressId(null);
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const handleSelectSavedAddress = (addr) => {
    applyAddress(addr);
    setSelectedAddressId(addr.id);
    setAddressEditing(false);
    setErrors({});
    toast.success("Address selected");
    setActiveStep("review"); // Go to step 2
  };

  const saveAddressToProfile = async () => {
    try {
      const addrData = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        house_name: houseName.trim(),
        area: area.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        address_type: addressType,
        is_default: addresses.length === 0,
      };
      const res = await API.post("addresses/", addrData);
      setAddresses((prev) => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
      return res.data;
    } catch (err) {
      console.error("Failed to save address to profile", err);
      toast.error("Failed to save address to profile, but proceeding with checkout.");
      return null;
    }
  };

  const handleAddressSubmit = async () => {
    if (!validateAddressFields()) {
      toast.error("Please fill required address details.");
      return;
    }

    setLoading(true);
    let savedAddr = null;
    if (saveToProfile) {
      savedAddr = await saveAddressToProfile();
    }
    setAddressEditing(false);
    setActiveStep("review");
    setLoading(false);
    if (savedAddr) {
      toast.success("Address saved to profile!");
    } else {
      toast.success("Address applied!");
    }
  };

  const handleCancelAddressEdit = () => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
      applyAddress(defaultAddress);
      setSelectedAddressId(defaultAddress.id);
      setAddressEditing(false);
      setErrors({});
    } else {
      toast.warning("Please fill in your delivery address to continue.");
    }
  };

  const buildPayload = () => {
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      line1: getLine1(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      discount,
    };
    if (buyNowItem) {
      payload.buy_now_product_id = buyNowItem.product.id;
      payload.buy_now_size = buyNowItem.size;
      payload.buy_now_qty = buyNowItem.quantity;
    }
    return payload;
  };

  const openRazorpayCheckout = useCallback(
    async (payload) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway not ready.");
        return;
      }
      const orderRes = await API.post("orders/create_razorpay_order/", payload);
      const { razorpay_order_id, amount, currency, key_id } = orderRes.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: "SportZone",
        description: buyNowItem ? `Buy Now: ${buyNowItem.product.name}` : "SportZone Order",
        order_id: razorpay_order_id,
        prefill: { name: fullName.trim(), contact: phone.trim() },
        method: RAZORPAY_METHOD_MAP[paymentMethod] || RAZORPAY_METHOD_MAP.Card,
        theme: { color: "#003366" },
        handler: async (response) => {
          try {
            setLoading(true);
            await API.post("orders/verify_payment/", {
              razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful!");
            if (!buyNowItem) clearCart();
            navigate("/orders", { replace: true });
          } catch (err) {
            toast.error(err?.response?.data?.error || "Verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => { toast.info("Payment cancelled."); setLoading(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        toast.error(r.error?.description || "Payment failed.");
        setLoading(false);
      });
      rzp.open();
    },
    [buyNowItem, clearCart, fullName, navigate, paymentMethod, phone]
  );

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const payload = buildPayload();
    try {
      if (paymentMethod === "COD") {
        await API.post("orders/checkout/", payload);
        toast.success("Order placed!");
        if (!buyNowItem) clearCart();
        navigate("/orders", { replace: true });
      } else {
        await openRazorpayCheckout(payload);
        setLoading(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not process order.");
      setLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId === "address") {
      setActiveStep("address");
    } else if (stepId === "review" && addressComplete) {
      setActiveStep("review");
    } else if (stepId === "payment" && addressComplete) {
      setActiveStep("payment");
    }
  };

  if (items.length === 0) {
    return (
      <StoreShell>
        <div className="sz-co-wrap">
          <div className="sz-co-empty-wrapper">
            <FaExclamationTriangle size={40} />
            <h3>Your Checkout is Empty</h3>
            <p>You haven't added any products to your cart yet.</p>
            <button
              type="button"
              className="sz-co-shop-redirect-btn"
              onClick={() => navigate("/shop")}
            >
              Browse Shop
            </button>
          </div>
        </div>
      </StoreShell>
    );
  }

  const payDisabled = loading || (isOnlinePayment && paymentMethod !== "UPI" && !razorpayReady) || (paymentMethod === "UPI");

  return (
    <StoreShell>
      <div className="sz-co-page">
        <div className="sz-co-wrap">
          


          <div className="sz-co-grid-container">
            
            {/* Left Column — 70% width on desktop */}
            <div className="sz-co-left-col">
              
              {/* STEP 1: Delivery Address */}
              <div className={`sz-co-step-card ${activeStep === "address" ? "active" : ""} ${addressComplete ? "completed" : "pending"}`}>
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
                                    {isHome ? <><FaHome className="me-1" /> Home</> : <><FaBriefcase className="me-1" /> Work</>}
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
                                <div className="sz-co-addr-phone-line">
                                  Phone: +91 {addr.phone}
                                </div>
                              </motion.div>
                            );
                          })}

                          {/* Add New Address Clickable Card */}
                          <motion.div
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            className="sz-co-addr-card add-new-card"
                            onClick={() => {
                              setFullName("");
                              setPhone("");
                              setHouseName("");
                              setArea("");
                              setLandmark("");
                              setCity("");
                              setDistrict("");
                              setState("");
                              setPincode("");
                              setAddressType("HOME");
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
                                  value={fullName}
                                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                                />
                                {errors.fullName && (
                                  <span className="sz-co-field-error">{errors.fullName}</span>
                                )}
                              </div>

                              <div className="sz-co-input-group">
                                <label htmlFor="phone">Mobile Number</label>
                                <input
                                  id="phone"
                                  type="tel"
                                  placeholder="10-digit number"
                                  className={errors.phone ? "invalid" : ""}
                                  value={phone}
                                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                                />
                                {errors.phone && (
                                  <span className="sz-co-field-error">{errors.phone}</span>
                                )}
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
                                  value={houseName}
                                  onChange={(e) => handleFieldChange("houseName", e.target.value)}
                                />
                                {errors.houseName && (
                                  <span className="sz-co-field-error">{errors.houseName}</span>
                                )}
                              </div>

                              <div className="sz-co-input-group">
                                <label htmlFor="area">Colony / Street / Area</label>
                                <input
                                  id="area"
                                  type="text"
                                  placeholder="Area, street name"
                                  className={errors.area ? "invalid" : ""}
                                  value={area}
                                  onChange={(e) => handleFieldChange("area", e.target.value)}
                                />
                                {errors.area && (
                                  <span className="sz-co-field-error">{errors.area}</span>
                                )}
                              </div>
                            </div>

                            {/* Landmark & City */}
                            <div className="sz-co-form-row two-col">
                              <div className="sz-co-input-group">
                                <label htmlFor="landmark">Landmark (Optional)</label>
                                <input
                                  id="landmark"
                                  type="text"
                                  placeholder="E.g., near park"
                                  value={landmark}
                                  onChange={(e) => handleFieldChange("landmark", e.target.value)}
                                />
                              </div>

                              <div className="sz-co-input-group">
                                <label htmlFor="city">City</label>
                                <input
                                  id="city"
                                  type="text"
                                  placeholder="City"
                                  className={errors.city ? "invalid" : ""}
                                  value={city}
                                  onChange={(e) => handleFieldChange("city", e.target.value)}
                                />
                                {errors.city && (
                                  <span className="sz-co-field-error">{errors.city}</span>
                                )}
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
                                  value={district}
                                  onChange={(e) => handleFieldChange("district", e.target.value)}
                                />
                                {errors.district && (
                                  <span className="sz-co-field-error">{errors.district}</span>
                                )}
                              </div>

                              <div className="sz-co-input-group">
                                <label htmlFor="state">State</label>
                                <input
                                  id="state"
                                  type="text"
                                  placeholder="State"
                                  className={errors.state ? "invalid" : ""}
                                  value={state}
                                  onChange={(e) => handleFieldChange("state", e.target.value)}
                                />
                                {errors.state && (
                                  <span className="sz-co-field-error">{errors.state}</span>
                                )}
                              </div>

                              <div className="sz-co-input-group">
                                <label htmlFor="pincode">Pincode</label>
                                <input
                                  id="pincode"
                                  type="text"
                                  maxLength={6}
                                  placeholder="6 digits"
                                  className={errors.pincode ? "invalid" : ""}
                                  value={pincode}
                                  onChange={(e) => handleFieldChange("pincode", e.target.value)}
                                />
                                {errors.pincode && (
                                  <span className="sz-co-field-error">{errors.pincode}</span>
                                )}
                              </div>
                            </div>

                            {/* Form options */}
                            <div className="sz-co-form-actions-row">
                              <div className="sz-co-addr-type-selector">
                                <span className="sz-co-type-lbl">Address Type:</span>
                                <button
                                  type="button"
                                  className={`sz-co-type-btn ${addressType === "HOME" ? "active" : ""}`}
                                  onClick={() => setAddressType("HOME")}
                                >
                                  Home
                                </button>
                                <button
                                  type="button"
                                  className={`sz-co-type-btn ${addressType === "WORK" ? "active" : ""}`}
                                  onClick={() => setAddressType("WORK")}
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
                                <button
                                  type="button"
                                  className="sz-co-cancel-btn"
                                  onClick={handleCancelAddressEdit}
                                >
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
                        <p>{fullName} · {city}, {state} {pincode} · +91 {phone}</p>
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

              {/* STEP 2: Order Review & Items */}
              <div className={`sz-co-step-card ${activeStep === "review" ? "active" : ""} ${activeStep === "payment" ? "completed" : "pending"}`}>
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
                                <img
                                  src={mediaUrl(item.product.image) || "/no-image.png"}
                                  alt={item.product.name}
                                />
                              </div>
                              <div className="sz-co-review-details">
                                <h3 className="sz-co-review-name">{item.product.name}</h3>
                                <div className="sz-co-review-meta">
                                  <span className="sz-co-meta-pill">Size: {item.size}</span>
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
                            {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
                              "en-US",
                              { weekday: "long", month: "short", day: "numeric" }
                            )}
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
                          Continue to Payment
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
                          {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
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

              {/* STEP 3: Secure Payment */}
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
                              <div className="sz-co-upi-disabled-banner">
                                UPI currently unavailable
                              </div>
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
                                style={{ cursor: "pointer" }}
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

            </div>

            {/* Right Column — 30% width on desktop */}
            <div className="sz-co-right-col">
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
                            <img
                              src={mediaUrl(item.product.image) || "/no-image.png"}
                              alt={item.product.name}
                            />
                          </div>
                          <div className="sz-co-sidebar-info">
                            <p>{item.product.name}</p>
                            <span>
                              Qty {item.quantity} · Size {item.size}
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

                  {/* Secure checkout button (updated text & animations) */}
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
                      <>
                        Proceed to Pay ₹{finalTotal.toLocaleString("en-IN")}
                      </>
                    )}
                  </motion.button>

                  <div className="sz-co-delivery-estimate-sidebar">
                    <FaTruck />
                    <span>
                      Est. Delivery: <strong>{new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</strong>
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
            </div>

          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="sz-co-mobile-bar d-lg-none">
          <div className="sz-co-mobile-val">
            <small>Total Payable</small>
            <strong>₹{finalTotal.toLocaleString("en-IN")}</strong>
            {pricing.totalSavings > 0 && (
              <span className="sz-co-mobile-savings">
                Save ₹{pricing.totalSavings.toLocaleString("en-IN")}
              </span>
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

      </div>
    </StoreShell>
  );
}
