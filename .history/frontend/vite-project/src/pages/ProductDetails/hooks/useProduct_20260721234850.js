import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import API from "../../../api";
import { mediaUrl } from "../../../utils/mediaUrl";

export function useProduct(id, addToCart, navigate) {
  // Core Product Data states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Pincode checker states
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [deliveryText, setDeliveryText] = useState("");

  // FBT bundle state
  const [fbtCheckedItems, setFbtCheckedItems] = useState({ 0: true, 1: true });
  const [bundleLoading, setBundleLoading] = useState(false);

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false);

  // Load product main details
  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await API.get(`products/${id}/`);
        if (!mounted) return;

        const data = res.data;
        setProduct(data);

        // Save to recently viewed
        try {
          const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const filtered = viewed.filter((idVal) => Number(idVal) !== Number(data.id));
          filtered.unshift(data.id);
          localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 8)));
        } catch (e) {
          console.error("Error saving recently viewed", e);
        }

        const first = mediaUrl(data?.images?.[0]?.image || data?.image) || "/no-image.png";
        setSelectedImage(first);
        setSelectedSize(null);
        setQty(1);

        // Fetch related category products
        if (data?.category) {
          const relatedRes = await API.get(
            `products/?category=${encodeURIComponent(data.category)}`
          );
          const related = (Array.isArray(relatedRes.data) ? relatedRes.data : [])
            .filter((p) => p.id !== data.id)
            .slice(0, 6);
          if (mounted) setRelatedProducts(related);
        }
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Load Wishlist state
  useEffect(() => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlisted(wishlist.includes(product.id));
  }, [product]);

  // Image Gallery compute
  const gallery = useMemo(() => {
    if (!product) return [];
    const fromGallery = (product.images || []).map((img) => mediaUrl(img.image)).filter(Boolean);
    const primary = product.image ? [mediaUrl(product.image)] : [];
    return [...new Set([...primary, ...fromGallery])];
  }, [product]);

  // Check if product is a shoe
  const isShoe = useMemo(() => {
    if (!product) return false;
    const cat = String(product.category || "").toLowerCase();
    const name = String(product.name || "").toLowerCase();
    return cat.includes("shoe") || cat.includes("footwear") || name.includes("shoe");
  }, [product]);

  // FBT bundle items compute (uses category products as FBT bundle choices)
  const fbtItems = useMemo(() => {
    if (relatedProducts.length >= 2) {
      return relatedProducts.slice(0, 2);
    }
    return [];
  }, [relatedProducts]);

  // FBT pricing calculations
  const fbtPricing = useMemo(() => {
    if (!product) return { current: 0, mrp: 0, discount: 0, savings: 0 };
    let current = Number(product.price);
    let mrp = Math.round(Number(product.price) * 1.25);

    fbtItems.forEach((item, index) => {
      if (fbtCheckedItems[index]) {
        current += Number(item.price);
        mrp += Math.round(Number(item.price) * 1.25);
      }
    });

    return {
      current,
      mrp,
      discount: mrp > current ? Math.round(((mrp - current) / mrp) * 100) : 0,
      savings: mrp - current
    };
  }, [product, fbtItems, fbtCheckedItems]);

  // Toggle FBT items
  const handleFbtToggle = (index) => {
    setFbtCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const sizes = useMemo(() => {
    return Array.isArray(product?.sizes) ? product.sizes : [];
  }, [product]);

  const showSizes = sizes.length > 0;

  // Add FBT bundle items to cart
  const addBundleToCart = async (sizeSectionRef) => {
    if (showSizes && !selectedSize) {
      toast.error("Please select a size for the main product first.");
      setSizeError(true);
      sizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setBundleLoading(true);
      // Add main product
      await addToCart({
        product_id: product.id,
        size: selectedSize || "N/A",
        quantity: 1
      });

      // Add checked FBT choices
      for (let i = 0; i < fbtItems.length; i++) {
        if (fbtCheckedItems[i]) {
          await addToCart({
            product_id: fbtItems[i].id,
            size: "N/A",
            quantity: 1
          });
        }
      }
      toast.success("Added bundle to cart successfully! 🛒");
    } catch (err) {
      toast.error("Failed to add bundle to cart");
    } finally {
      setBundleLoading(false);
    }
  };

  // Wishlist toggle handler
  const toggleWishlist = () => {
    if (!product) return;
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (wishlist.includes(product.id)) {
      wishlist = wishlist.filter((idVal) => idVal !== product.id);
      setWishlisted(false);
      toast.success("Removed from wishlist 🤍");
    } else {
      wishlist.push(product.id);
      setWishlisted(true);
      toast.success("Added to wishlist ❤️");
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  };

  // Share functionality
  const shareProduct = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || `Check out ${product.name} on SportZone!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! 🔗");
    }
  };

  // Pincode validation
  const onCheckPincode = () => {
    setPincodeStatus("checking");
    setTimeout(() => {
      setPincodeStatus("success");
      const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
      setDeliveryText(`Delivery by ${deliveryDate} | Free shipping & Cash on Delivery available.`);
    }, 600);
  };

  const onPincodeInvalid = (errors) => {
    setPincodeStatus("error");
    setDeliveryText(errors.pincode?.message || "Please enter a valid 6-digit pincode.");
  };

  // Add to cart main handler
  const addToCartNow = async (sizeSectionRef) => {
    if (!product?.id) return;

    if (showSizes && !selectedSize) {
      toast.error("Please select a size first.");
      setSizeError(true);
      sizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setCartLoading(true);
      await addToCart({
        product_id: product.id,
        size: selectedSize || "N/A",
        quantity: qty
      });
    } finally {
      setCartLoading(false);
    }
  };

  return {
    product,
    loading,
    qty,
    setQty,
    selectedImage,
    setSelectedImage,
    selectedSize,
    setSelectedSize,
    sizeError,
    setSizeError,
    cartLoading,
    relatedProducts,
    wishlisted,
    pincodeStatus,
    deliveryText,
    fbtCheckedItems,
    bundleLoading,
    gallery,
    isShoe,
    fbtItems,
    fbtPricing,
    sizes,
    showSizes,
    handleFbtToggle,
    addBundleToCart,
    toggleWishlist,
    shareProduct,
    onCheckPincode,
    onPincodeInvalid,
    addToCartNow
  };
}
