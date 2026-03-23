// src/context/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartFromBackend = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartItems([]);
        return;
      }

      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      console.log(err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCartFromBackend();
  }, []);

  const addToCart = async (productId) => {
    await API.post("cart/", { product_id: productId, quantity: 1 });
    fetchCartFromBackend();
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

  const cartItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCartFromBackend,
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