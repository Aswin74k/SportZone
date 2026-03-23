// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 🔥 CHECK TOKEN
  const getToken = () => localStorage.getItem("access");

  // 🔥 FETCH CART (SAFE)
  const fetchCart = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    setCartItems([]);
    return;
  }

  try {
    const res = await API.get("cart/");
    setCartItems(res.data);
  } catch (err) {
    // 🔥 IGNORE 401
    if (err.response?.status === 401) {
      return;
    }

    console.log("Cart error:", err);
  }
};
  // 🔥 LOAD ON START + LOGIN / LOGOUT EVENTS
  useEffect(() => {
    const token = getToken();

    if (token) {
      fetchCart();
    }

    const handleLogin = () => fetchCart();
    const handleLogout = () => setCartItems([]);

    window.addEventListener("loginSuccess", handleLogin);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
      window.removeEventListener("logout", handleLogout);
    };
  }, []); // ✅ IMPORTANT (NO DEPENDENCIES)

  // 🔥 ADD TO CART
 const addToCart = async (productId) => {
  try {
    console.log("Adding product:", productId); // 🔍 DEBUG

    if (!productId) {
      console.log("❌ Product ID missing");
      return;
    }

    await API.post("cart/", {
      product_id: productId,
      quantity: 1,
    });

    console.log("✅ Added to cart");

    fetchCartFromBackend();
  } catch (err) {
    console.log("❌ Add to cart error:", err.response?.data || err);
  }
};
    if (!token) return;

    try {
      await API.post("cart/", {
        product_id: productId,
        quantity: 1,
      });
      fetchCart();
    } catch (err) {
      console.log("Add error", err?.response || err);
    }
  };

  // 🔥 REMOVE
  const removeFromCart = async (id) => {
    const token = getToken();

    if (!token) return;

    try {
      await API.delete(`cart/${id}/`);
      fetchCart();
    } catch (err) {
      console.log("Remove error", err?.response || err);
    }
  };

  // 🔥 UPDATE QUANTITY
  const updateQuantity = async (id, quantity) => {
    const token = getToken();

    if (!token) return;

    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      await API.patch(`cart/${id}/`, { quantity });
      fetchCart();
    } catch (err) {
      console.log("Update error", err?.response || err);
    }
  };

  // 🔥 DERIVED VALUES
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + (item.product?.price || 0) * item.quantity,
    0
  );

  const cartItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};