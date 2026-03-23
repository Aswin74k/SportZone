// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 🔥 FETCH CART
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartItems([]);
        return;
      }

      const res = await API.get("cart/");
      setCartItems(res.data);
    } catch (err) {
      console.log("Cart fetch error", err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();

    window.addEventListener("loginSuccess", fetchCart);

    return () => {
      window.removeEventListener("loginSuccess", fetchCart);
    };
  }, []);

  // 🔥 ADD
  const addToCart = async (productId) => {
    await API.post("cart/", {
      product_id: productId,
      quantity: 1,
    });
    fetchCart();
  };

  // 🔥 REMOVE
  const removeFromCart = async (id) => {
    await API.delete(`cart/${id}/`);
    fetchCart();
  };

  // 🔥 UPDATE QUANTITY
  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    await API.patch(`cart/${id}/`, { quantity });
    fetchCart();
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product?.price * item.quantity,
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