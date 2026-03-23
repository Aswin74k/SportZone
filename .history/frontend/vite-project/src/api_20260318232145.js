import { useCart } from "../context/CartContext";

const { addToCart } = useCart();

const handleAddToCart = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.info("Please login first");
    window.dispatchEvent(new Event("openLoginModal"));
    return;
  }

  try {
    setLoading(true);

    await addToCart(product.id); // ✅ USE CONTEXT

    toast.success("Added to cart 🛒");

  } catch (err) {
    toast.error("Failed to add");
  } finally {
    setLoading(false);
  }
};