import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import API from "../../../api";
import { useCart } from "../../../context/CartContext.jsx";
import { calculatePricing } from "../utils/pricingHelpers";
import {
  getEstimatedDeliveryDate,
  formatLine1,
  RAZORPAY_METHOD_MAP,
} from "../utils/checkoutHelpers";

export default function useCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();

  const buyNowItem = location.state?.product ? location.state : null;

  // Active step: "address" | "review" | "payment"
  const [activeStep, setActiveStep] = useState("address");

  const {
    register,
    setValue,
    reset,
    trigger,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
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
    },
  });

  const [
    fullName,
    phone,
    houseName,
    area,
    landmark,
    city,
    district,
    state,
    pincode,
    addressType,
  ] = watch([
    "fullName",
    "phone",
    "houseName",
    "area",
    "landmark",
    "city",
    "district",
    "state",
    "pincode",
    "addressType",
  ]);

  const [saveToProfile, setSaveToProfile] = useState(true);
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

  const applyAddress = useCallback((addr) => {
    reset({
      fullName: addr.full_name || "",
      phone: addr.phone || "",
      houseName: addr.house_name || "",
      area: addr.area || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      district: addr.district || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      addressType: addr.address_type || "HOME",
    });
  }, [reset]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyAddress]);

  const items = useMemo(() => {
    return buyNowItem
      ? [
          {
            id: `buynow-${buyNowItem.product.id}`,
            product: buyNowItem.product,
            quantity: buyNowItem.quantity || 1,
            size: buyNowItem.size || "N/A",
          },
        ]
      : cartItems;
  }, [buyNowItem, cartItems]);

  const subtotal = useMemo(() => {
    return buyNowItem ? Number(buyNowItem.product.price || 0) * (buyNowItem.quantity || 1) : cartTotal;
  }, [buyNowItem, cartTotal]);

  const discount = 0;
  const shipping = 0;
  const finalTotal = Math.max(0, subtotal - discount + shipping);
  const isOnlinePayment = paymentMethod !== "COD";

  const pricing = useMemo(() => {
    return calculatePricing({ items, subtotal, discount });
  }, [items, subtotal, discount]);

  const addressComplete = useMemo(() => {
    return !!(
      (fullName || "").trim() &&
      (phone || "").trim() &&
      (houseName || "").trim() &&
      (area || "").trim() &&
      (city || "").trim() &&
      (district || "").trim() &&
      (state || "").trim() &&
      (pincode || "").trim()
    );
  }, [fullName, phone, houseName, area, city, district, state, pincode]);

  const validateAddressFields = async () => trigger();

  const validateForm = async () => {
    const isAddressValid = await validateAddressFields();
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

  useEffect(() => {
    if (selectedAddressId && Object.keys(dirtyFields).length > 0) {
      setSelectedAddressId(null);
    }
  }, [dirtyFields, selectedAddressId]);

  const handleSelectSavedAddress = (addr) => {
    applyAddress(addr);
    setSelectedAddressId(addr.id);
    setAddressEditing(false);
    toast.success("Address selected");
    setActiveStep("review");
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
    if (!(await validateAddressFields())) {
      toast.error("Please fill required address details.");
      return;
    }

    setLoading(true);
    const savedAddr = saveToProfile ? await saveAddressToProfile() : null;
    setAddressEditing(false);
    setActiveStep("review");
    setLoading(false);
    toast.success(savedAddr ? "Address saved to profile!" : "Address applied!");
  };

  const handleCancelAddressEdit = () => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
      applyAddress(defaultAddress);
      setSelectedAddressId(defaultAddress.id);
      setAddressEditing(false);
    } else {
      toast.warning("Please fill in your delivery address to continue.");
    }
  };

  const buildPayload = () => {
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      line1: formatLine1({ houseName, area, landmark }),
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
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setLoading(false);
          },
        },
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
    if (!(await validateForm())) return;
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
    } else if ((stepId === "review" || stepId === "payment") && addressComplete) {
      setActiveStep(stepId);
    }
  };

  const estimatedDeliveryDate = useMemo(() => getEstimatedDeliveryDate(), []);

  const payDisabled =
    loading ||
    activeStep !== "payment" ||
    paymentMethod === "UPI" ||
    (isOnlinePayment && !razorpayReady);

  return {
    navigate,
    items,
    activeStep,
    setActiveStep,
    paymentMethod,
    setPaymentMethod,
    loading,
    razorpayReady,
    addresses,
    setAddresses,
    selectedAddressId,
    setSelectedAddressId,
    codCaptcha,
    setCodCaptcha,
    codCaptchaInput,
    setCodCaptchaInput,
    saveToProfile,
    setSaveToProfile,
    addressEditing,
    setAddressEditing,
    register,
    setValue,
    reset,
    errors,
    fullName,
    city,
    state,
    pincode,
    phone,
    addressType,
    addressComplete,
    pricing,
    subtotal,
    discount,
    shipping,
    finalTotal,
    estimatedDeliveryDate,
    payDisabled,
    handleSelectSavedAddress,
    handleAddressSubmit,
    handleCancelAddressEdit,
    handleSubmitOrder,
    handleStepClick,
  };
}
