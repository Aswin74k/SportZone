import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaArrowLeft, 
  FaSpinner, 
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaShoppingCart
} from "react-icons/fa";
import API from "../api";
import { useCart } from "../context/CartContext.jsx";
import { mediaUrl } from "../utils/mediaUrl";
import StoreShell from "../components/StoreShell";
import "./Checkout.css";



export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();

  // Determine if it is a single item "Buy Now" flow (passed from Wishlist / Product Detail)
  const buyNowItem = location.state?.product ? location.state : null;

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  // Checkout configuration
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch addresses on mount to autofill if available
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await API.get("addresses/");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAddresses(res.data);
          // Auto-fill default address
          const defaultAddress = res.data.find(addr => addr.is_default) || res.data[0];
          if (defaultAddress) {
            setFullName(defaultAddress.full_name || "");
            setPhone(defaultAddress.phone || "");
            
            // Build line1 from house_name, area, landmark
            let constructedLine1 = defaultAddress.house_name || "";
            if (defaultAddress.area) {
              constructedLine1 += `, ${defaultAddress.area}`;
            }
            if (defaultAddress.landmark) {
              constructedLine1 += ` (Landmark: ${defaultAddress.landmark})`;
            }
            setLine1(constructedLine1);
            setCity(defaultAddress.city || "");
            setState(defaultAddress.state || "");
            setPincode(defaultAddress.pincode || "");
          }
        }
      } catch (err) {
        console.error("Failed to load user addresses", err);
      }
    };

    fetchAddresses();
  }, []);

  // Compute items & pricing summary
  const items = buyNowItem 
    ? [{ 
        id: `buynow-${buyNowItem.product.id}`,
        product: buyNowItem.product, 
        quantity: buyNowItem.quantity || 1, 
        size: buyNowItem.size || "N/A" 
      }]
    : cartItems;

  const subtotal = buyNowItem
    ? Number(buyNowItem.product.price || 0) * (buyNowItem.quantity || 1)
    : cartTotal;

  // Calculate discount based on applied coupon
  const discount = 0;
  const shipping = 0; // Free Shipping
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  // Validate form details
  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.trim().replace(/\D/g, ""))) {
      newErrors.phone = "Provide a valid 10-digit phone number";
    }
    if (!line1.trim()) newErrors.line1 = "Address line is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = "Provide a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Field Input Change Handlers
  const handleFieldChange = (field, val) => {
    if (field === "fullName") setFullName(val);
    if (field === "phone") setPhone(val);
    if (field === "line1") setLine1(val);
    if (field === "city") setCity(val);
    if (field === "state") setState(val);
    if (field === "pincode") setPincode(val);

    // Clear validation error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle selected address change from list
  const handleSelectSavedAddress = (addr) => {
    setFullName(addr.full_name || "");
    setPhone(addr.phone || "");
    let constructedLine1 = addr.house_name || "";
    if (addr.area) {
      constructedLine1 += `, ${addr.area}`;
    }
    if (addr.landmark) {
      constructedLine1 += ` (Landmark: ${addr.landmark})`;
    }
    setLine1(constructedLine1);
    setCity(addr.city || "");
    setState(addr.state || "");
    setPincode(addr.pincode || "");
    setErrors({});
    toast.success("Shipping details populated from saved address!");
  };

  // Main Submit Order Action
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    // Build Payload
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      discount: discount
    };

    if (buyNowItem) {
      payload.buy_now_product_id = buyNowItem.product.id;
      payload.buy_now_size = buyNowItem.size;
      payload.buy_now_qty = buyNowItem.quantity;
    }

    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        // Cash On Delivery Flow
        await API.post("orders/checkout/", payload);
        toast.success("Order placed successfully! Cash on Delivery confirmed.");
        if (!buyNowItem) {
          clearCart();
        }
        navigate("/orders", { replace: true });
      } else {
        // Razorpay Payment Flow
        if (!window.Razorpay) {
          toast.error("Razorpay SDK failed to load. Please refresh the page and try again.");
          setLoading(false);
          return;
        }

        const orderRes = await API.post("orders/create_razorpay_order/", payload);
        const { razorpay_order_id, amount, currency, key_id } = orderRes.data;

        const options = {
          key: key_id,
          amount: amount,
          currency: currency,
          name: "SportZone",
          description: buyNowItem ? `Buy Now: ${buyNowItem.product.name}` : "Checkout Cart Items",
          order_id: razorpay_order_id,
          prefill: {
            name: fullName,
            contact: phone,
          },
          theme: {
            color: "#2563eb", // SportZone premium blue
          },
          handler: async function (response) {
            try {
              setLoading(true);
              await API.post("orders/verify_payment/", {
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success("Payment verified! Order placed successfully.");
              if (!buyNowItem) {
                clearCart();
              }
              navigate("/orders", { replace: true });
            } catch (err) {
              toast.error(err?.response?.data?.error || "Signature verification failed.");
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.warning("Payment cancelled by user.");
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to process order. Please try again.");
      setLoading(false);
    }
  };

  // If checkout has no items (empty cart and no buy now selection), show empty shell
  if (items.length === 0) {
    return (
      <StoreShell showFooter={false}>
        <div className="container py-5 text-center">
          <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: "500px", borderRadius: "16px" }}>
            <div className="text-warning mb-3">
              <FaExclamationTriangle size={50} />
            </div>
            <h3 className="fw-bold mb-2">No Items for Checkout</h3>
            <p className="text-muted mb-4">Your checkout page is currently empty because you have no selected items.</p>
            <button 
              className="btn sz-btn-sport btn-lg px-4" 
              style={{ background: "var(--sz-navy)", color: "white", borderRadius: "99px" }}
              onClick={() => navigate("/shop")}
            >
              Start Shopping
            </button>
          </div>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell showFooter={false}>
      <div className="container-fluid container-xl px-3 px-md-4 py-4">
        
        {/* Navigation Breadcrumb back to shop/cart */}
        <div className="d-flex align-items-center gap-2 mb-4 text-muted cursor-pointer" onClick={() => navigate(buyNowItem ? "/wishlist" : "/cart")}>
          <FaArrowLeft size={14} />
          <span className="small fw-semibold">Back to {buyNowItem ? "Wishlist" : "Cart"}</span>
        </div>

        <div className="sz-checkout-container">
          <div className="row g-4">
            
            {/* Left Column: Forms */}
            <div className="col-lg-7">
              
              {/* Shipping Details Card */}
              <div className="sz-checkout-card">
                <h2 className="sz-checkout-card-title">
                  <FaMapMarkerAlt /> Shipping Details
                </h2>
                
                {/* Saved Address Autofill Helper */}
                {addresses.length > 0 && (
                  <div className="mb-4">
                    <p className="small text-muted fw-bold mb-2">Select from saved addresses:</p>
                    <div className="d-flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          className="btn btn-outline-secondary btn-sm text-start py-2 px-3 flex-shrink-0"
                          style={{ borderRadius: "10px", fontSize: "0.8rem", maxWidth: "200px" }}
                          onClick={() => handleSelectSavedAddress(addr)}
                        >
                          <strong className="d-block text-truncate">{addr.full_name}</strong>
                          <span className="d-block text-truncate text-muted">{addr.house_name}, {addr.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form className="sz-checkout-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="fullName">Full Name *</label>
                      <input
                        type="text"
                        id="fullName"
                        className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      />
                      {errors.fullName && (
                        <div className="sz-checkout-form-error">
                          <FaExclamationTriangle size={10} /> {errors.fullName}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                      />
                      {errors.phone && (
                        <div className="sz-checkout-form-error">
                          <FaExclamationTriangle size={10} /> {errors.phone}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="line1">Address (House/Flat, Street, Area) *</label>
                      <input
                        type="text"
                        id="line1"
                        className={`form-control ${errors.line1 ? "is-invalid" : ""}`}
                        placeholder="Flat 102, Building A, Main Road"
                        value={line1}
                        onChange={(e) => handleFieldChange("line1", e.target.value)}
                      />
                      {errors.line1 && (
                        <div className="sz-checkout-form-error">
                          <FaExclamationTriangle size={10} /> {errors.line1}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        className={`form-control ${errors.city ? "is-invalid" : ""}`}
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                      />
                      {errors.city && (
                        <div className="sz-checkout-form-error">
                          <FaExclamationTriangle size={10} /> {errors.city}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="state">State *</label>
                      <input
                        type="text"
                        id="state"
                        className={`form-control ${errors.state ? "is-invalid" : ""}`}
                        placeholder="Maharashtra"
                        value={state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                      />
                      {errors.state && (
                        <div className="sz-checkout-form-error">
                          <FaExclamationTriangle size={10} /> {errors.state}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="pincode">Pincode *</label>
                      <input
                        type="text"
                        id="pincode"
                        className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                        placeholder="400001"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) => handleFieldChange("pincode", e.target.value)}
                      />
                      {errors.pincode && (
                        <div className="sz-checkout-form-error">
                          <FaExclamationTriangle size={10} /> {errors.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Methods Card */}
              <div className="sz-checkout-card">
                <h2 className="sz-checkout-card-title">
                  <FaCreditCard /> Select Payment Method
                </h2>

                <div className="sz-payment-grid">
                  {/* Razorpay Card option */}
                  <div 
                    className={`sz-payment-option-card ${paymentMethod === "Razorpay" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("Razorpay")}
                  >
                    <div className="sz-payment-option-left">
                      <div className="sz-payment-radio">
                        <div className="sz-payment-radio-inner" />
                      </div>
                      <div className="sz-payment-option-details">
                        <span className="sz-payment-option-title">Razorpay Secure Checkout</span>
                        <span className="sz-payment-option-desc">Cards, NetBanking, Wallets (UPI currently unavailable)</span>
                      </div>
                    </div>
                    <div className="sz-payment-option-icons small text-muted">
                      Online Payment
                    </div>
                  </div>

                  {/* Cash on Delivery option */}
                  <div 
                    className={`sz-payment-option-card ${paymentMethod === "COD" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <div className="sz-payment-option-left">
                      <div className="sz-payment-radio">
                        <div className="sz-payment-radio-inner" />
                      </div>
                      <div className="sz-payment-option-details">
                        <span className="sz-payment-option-title">Cash on Delivery (COD)</span>
                        <span className="sz-payment-option-desc">Pay cash when package arrives</span>
                      </div>
                    </div>
                    <div className="sz-payment-option-icons">
                      <FaMoneyBillWave size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Coupon */}
            <div className="col-lg-5">
              <div className="sz-checkout-card position-sticky" style={{ top: "100px" }}>
                <h2 className="sz-checkout-card-title mb-3">
                  <FaShoppingCart /> Order Summary
                </h2>

                {/* Items preview row list */}
                <div className="sz-checkout-items-list">
                  {items.map((item) => {
                    const price = Number(item.product.price || 0);
                    return (
                      <div className="sz-checkout-item-row" key={item.id}>
                        <div className="sz-checkout-item-img-box">
                          <img 
                            src={mediaUrl(item.product.image) || "/no-image.png"} 
                            alt={item.product.name} 
                            className="sz-checkout-item-img"
                          />
                        </div>
                        <div className="sz-checkout-item-details">
                          <span className="sz-checkout-item-name">{item.product.name}</span>
                          <span className="sz-checkout-item-meta">
                            Qty: {item.quantity} | Size: {item.size}
                          </span>
                        </div>
                        <span className="sz-checkout-item-price">
                          ₹{(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>



                {/* Price Breakdown */}
                <div className="pt-3 border-top">
                  <div className="sz-checkout-price-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="sz-checkout-price-row discount">
                      <span>Discount</span>
                      <span>- ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="sz-checkout-price-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="sz-checkout-price-row total">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Checkout Button */}
                <button
                  type="button"
                  className="sz-checkout-submit-btn"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spin" /> Processing Order...
                    </>
                  ) : (
                    <>
                      Place Order (₹{finalTotal.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </StoreShell>
  );
}
