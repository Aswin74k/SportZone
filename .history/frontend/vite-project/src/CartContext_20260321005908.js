import { createContext, useContext, useState, useEffect, useMemo } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("loginSuccess", fetchCart);
    return () => window.removeEventListener("loginSuccess", fetchCart);
  }, []);

  // 🔥 MEMO FIX (IMPORTANT)
  const value = useMemo(() => {
    const cartTotal = cartItems.reduce(
      (total, item) => total + item.product?.price * item.quantity,
      0
    );

    const cartItemCount = cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );

    return {
      cartItems,
      fetchCart,
      cartTotal,
      cartItemCount,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};