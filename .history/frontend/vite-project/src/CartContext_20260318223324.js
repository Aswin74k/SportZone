    import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 🔥 FETCH CART FROM BACKEND
  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartItems([]); // not logged in
      return;
    }

    try {
      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      console.log("Cart fetch error", err);
      setCartItems([]);
    }
  };

  // 🔥 ADD TO CART
  const addToCart = async (productId) => {
    try {
      await API.post("cart/", {
        product: productId,
        quantity: 1,
      });

      fetchCart(); // refresh cart
    } catch (err) {
      console.log("Add to cart error", err);
    }
  };

  // 🔥 REMOVE FROM CART
  const removeFromCart = async (id) => {
    try {
      await API.delete(`cart/${id}/`);
      fetchCart();
    } catch (err) {
      console.log("Remove error", err);
    }
  };

  // 🔥 CART COUNT
  const cartItemCount = cartItems.length;

  // 🔥 LOAD ON START
  useEffect(() => {
    fetchCart();
  }, []);

  // 🔥 AFTER LOGIN
  useEffect(() => {
    const handleLogin = () => fetchCart();
    window.addEventListener("loginSuccess", handleLogin);

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
    };
  }, []);

  // 🔥 AFTER LOGOUT
  useEffect(() => {
    const handleLogout = () => setCartItems([]);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemCount,
        addToCart,
        removeFromCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 🔥 HOOK
export const useCart = () => useContext(CartContext);