import { createContext, useState, useContext, useEffect } from 'react';
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
      console.log("Cart fetch error", err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();

    // reload when login happens
    window.addEventListener("loginSuccess", fetchCart);

    return () => {
      window.removeEventListener("loginSuccess", fetchCart);
    };
  }, []);

  // 🔥 ADD TO CART
  const addToCart = async (productId) => {
    try {
     await API.post("cart/", {
  product_id: productId,
  quantity: 1,
});

      await fetchCart(); // ✅ refresh cart
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 REMOVE
  const removeFromCart = async (id) => {
    try {
      await API.delete(`cart/${id}/`);
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 CLEAR
  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        fetchCart,
        clearCart,
        cartItemCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};