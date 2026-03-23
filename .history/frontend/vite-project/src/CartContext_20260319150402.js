import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 🔥 FETCH CART
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
      console.log("Cart fetch error:", err);
      setCartItems([]);
    }
  };

  // 🔥 AUTO LOAD
  useEffect(() => {
    fetchCartFromBackend();
  }, []);

  // 🔥 ADD
  const addToCart = async (productId) => {
    try {
      await API.post("cart/", {
        product_id: productId,
        quantity: 1,
      });

      fetchCartFromBackend();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 REMOVE
  const removeFromCart = async (id) => {
    try {
      await API.delete(`cart/${id}/`);
      fetchCartFromBackend();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 UPDATE
  const updateQuantity = async (id, quantity) => {
    try {
      await API.patch(`cart/${id}/`, { quantity });
      fetchCartFromBackend();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 TOTAL
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