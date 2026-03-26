/* eslint react-refresh/only-export-components: off */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import API from "../api";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const TOKEN_KEY = "access";

const openLoginModal = () => {
  window.dispatchEvent(new Event("openLoginModal"));
};

const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const clearCart = useCallback(() => setCartItems([]), []);

  const fetchCartFromBackend = useCallback(async () => {
    const token = getToken();

    if (!token) {
      clearCart();
      return;
    }

    try {
      const res = await API.get("cart/");
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearCart();
        return;
      }

      toast.error("Failed to load cart");
      clearCart();
    }
  }, [clearCart]);

  // Backward-compatible alias used by some pages
  const fetchCart = fetchCartFromBackend;

  useEffect(() => {
    // Avoid calling fetchCartFromBackend() when logged-out to prevent sync state updates.
    if (getToken()) {
      // Defer the initial fetch to avoid setState warnings inside effects.
      setTimeout(() => {
        fetchCartFromBackend();
      }, 0);
    }

    const handleLogin = () => fetchCartFromBackend();
    const handleLogout = () => clearCart();

    window.addEventListener("loginSuccess", handleLogin);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
      window.removeEventListener("logout", handleLogout);
    };
  }, [fetchCartFromBackend, clearCart]);

  const addToCart = useCallback(
    async ({ product_id, size, quantity }) => {
      const token = getToken();
      if (!token) {
        toast.info("Login required to add items");
        openLoginModal();
        return;
      }

      if (!product_id) {
        toast.error("Invalid product");
        return;
      }

      try {
        await API.post("cart/", { product_id, size, quantity });
        await fetchCartFromBackend();
        toast.success("Item added to cart 🛒");
      } catch (err) {
        if (err?.response?.status === 401) {
          clearCart();
          openLoginModal();
          return;
        }
        toast.error(err?.response?.data?.size?.[0] || err?.response?.data?.error || "Failed to add to cart");
      }
    },
    [fetchCartFromBackend, clearCart]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      const token = getToken();
      if (!token) {
        toast.info("Please login first");
        openLoginModal();
        return;
      }

      try {
        await API.delete(`cart/${cartItemId}/`);
        await fetchCartFromBackend();
        toast.success("Removed from cart");
      } catch (err) {
        if (err?.response?.status === 401) {
          clearCart();
          openLoginModal();
          return;
        }

        toast.error("Failed to remove item");
      }
    },
    [fetchCartFromBackend, clearCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      const token = getToken();
      if (!token) {
        toast.info("Please login first");
        openLoginModal();
        return;
      }

      const safeQty = Math.max(1, Number(quantity) || 1);

      try {
        await API.patch(`cart/${cartItemId}/`, { quantity: safeQty });
        await fetchCartFromBackend();
      } catch (err) {
        if (err?.response?.status === 401) {
          clearCart();
          openLoginModal();
          return;
        }

        toast.error("Failed to update quantity");
      }
    },
    [fetchCartFromBackend, clearCart]
  );

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        (Number(item.product?.price) || 0) * (item.quantity || 0),
      0
    );
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      fetchCartFromBackend,
      fetchCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartItemCount,
      cartTotal,
      clearCart,
    }),
    [
      cartItems,
      fetchCartFromBackend,
      fetchCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartItemCount,
      cartTotal,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};