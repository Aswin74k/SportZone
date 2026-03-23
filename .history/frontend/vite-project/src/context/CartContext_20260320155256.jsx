// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 CHECK TOKEN
  const hasToken = () => !!localStorage.getItem("token");

  const fetchCart = useCallback(async () => {
    if (!hasToken()) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      console.log("Cart fetch error", err?.response || err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasToken()) {
      fetchCart();
    }

    const handleLogin = () => fetchCart();

    window.addEventListener("loginSuccess", handleLogin);

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
    };
  }, [fetchCart]);

  const addToCart = async (productId) => {
    if (!hasToken()) return;

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

  const removeFromCart = async (id) => {
    if (!hasToken()) return;

    try {
      await API.delete(`cart/${id}/`);
      fetchCart();
    } catch (err) {
      console.log("Remove error", err?.response || err);
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (!hasToken()) return;

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

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
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
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};