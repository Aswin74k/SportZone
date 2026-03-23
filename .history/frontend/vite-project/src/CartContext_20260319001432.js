import { createContext, useState, useContext, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState([]);

  // 🔥 MOVE THIS INSIDE
  const fetchCartFromBackend = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartItems([]);
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

  const removeFromCart = async (id) => {
    await API.delete(`cart/${id}/`);
    fetchCartFromBackend();
  };

  const updateQuantity = async (id, quantity) => {
    await API.patch(`cart/${id}/`, { quantity });
    fetchCartFromBackend();
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price * item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCartFromBackend,
        removeFromCart,
        updateQuantity,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};