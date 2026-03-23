import { createContext, useState, useContext, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState([]);

  // 🔥 FETCH CART FROM BACKEND
  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      console.log("Cart fetch error:", err);
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

      fetchCart(); // refresh
    } catch (err) {
      console.log("Add error:", err);
    }
  };

  // 🔥 REMOVE FROM CART
  const removeFromCart = async (id) => {
    try {
      await API.delete(`cart/${id}/`);
      fetchCart();
    } catch (err) {
      console.log("Remove error:", err);
    }
  };

  // 🔥 UPDATE QUANTITY
  const updateQuantity = async (id, quantity) => {
    try {
      await API.patch(`cart/${id}/`, { quantity });
      fetchCart();
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  // 🔥 CLEAR CART (LOGOUT)
  const clearCart = () => {
    setCartItems([]);
  };

  // 🔥 TOTAL COUNT (IMPORTANT FIX)
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // 🔥 TOTAL PRICE
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

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
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemCount,
        cartTotal,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};