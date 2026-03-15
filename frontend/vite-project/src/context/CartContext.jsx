import { createContext, useContext, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";
const CART_URL = `${API_BASE}/cart/`;

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = async (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          cartId: null,
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          quantity: 1,
        },
      ];
    });

    try {
      const res = await fetch(CART_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: 1,
          product: product.id,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        throw new Error(`Cart API error: ${res.status}`);
      }

      const saved = await res.json();

      setItems((prev) =>
        prev.map((i) =>
          i.cartId === null && i.productId === product.id
            ? { ...i, cartId: saved.id }
            : i
        )
      );
    } catch (err) {
      console.error("Failed to sync cart with API:", err);
    }
  };

  const removeFromCart = async (productId) => {
    let cartIdToDelete = null;

    setItems((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (!item) return prev;

      cartIdToDelete = item.cartId;

      if (item.quantity > 1) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }

      return prev.filter((i) => i.productId !== productId);
    });

    if (!cartIdToDelete) {
      return;
    }

    try {
      const res = await fetch(`${CART_URL}${cartIdToDelete}/`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Cart API delete error: ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to delete cart item in API:", err);
    }
  };

  const value = useMemo(() => {
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    return {
      items,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
    };
  }, [items]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

