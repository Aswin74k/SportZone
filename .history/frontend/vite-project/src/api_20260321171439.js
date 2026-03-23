// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 🔥 GET TOKEN
  const getToken = () => localStorage.getItem("access");

  // 🔥 FETCH CART
  const fetchCart = async () => {
    const token = getToken();

    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.log("Cart fetch error:", err);
      }
    }
  };

  // 🔥 LOAD ON START + LOGIN / LOGOUT
  useEffect(() => {
    if (getToken()) {
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
  }, []);

  // 🔥 ADD TO CART
  const addToCart = async (productId) => {
    const token = getToken();

    if (!token) {
      console.log("❌ Not logged in");
      return;
    }

    try {
      console.log("🛒 Adding:", productId);

      await API.post("cart/", {
        product_id: Number(productId), // ✅ IMPORTANT
        quantity: 1,
      });

      console.log("✅ Added to cart");

      fetchCart();
    } catch (err) {
      console.log("❌ Add error:", err.response?.data || err);
    }
  };

  // 🔥 REMOVE ITEM
  const removeFromCart = async (id) => {
    try {
      await API.delete(`cart/${id}/`);
      fetchCart();
    } catch (err) {
      console.log("❌ Remove error:", err.response?.data || err);
    }
  };

  // 🔥 UPDATE QUANTITY
  const updateQuantity = async (id, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      await API.patch(`cart/${id}/`, { quantity });
      fetchCart();
    } catch (err) {
      console.log("❌ Update error:", err.response?.data || err);
    }
  };

  // 🔥 TOTAL PRICE
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + (item.product?.price || 0) * item.quantity,
    0
  );

  // 🔥 ITEM COUNT
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