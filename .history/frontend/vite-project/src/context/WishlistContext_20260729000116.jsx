/* eslint react-refresh/only-export-components: off */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import API from "../api";

const WishlistContext = createContext(null);

const TOKEN_KEY = "access";
const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");

const openLoginModal = () => {
  window.location.href = "/login";
};

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const fetchWishlistFromBackend = useCallback(async (showLoader = true) => {
    const token = getToken();
    if (!token) {
      setWishlistProducts([]);
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await API.get("wishlist/");
      setWishlistProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 401) {
        setWishlistProducts([]);
        return;
      }
      setWishlistProducts([]);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch once after mount
    if (getToken()) fetchWishlistFromBackend();

    const handleLogin = () => fetchWishlistFromBackend();
    const handleLogout = () => setWishlistProducts([]);

    window.addEventListener("loginSuccess", handleLogin);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("loginSuccess", handleLogin);
      window.removeEventListener("logout", handleLogout);
    };
  }, [fetchWishlistFromBackend]);

  const wishlistIds = useMemo(() => {
    return new Set(wishlistProducts.map((p) => p.id));
  }, [wishlistProducts]);

  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    return wishlistIds.has(Number(productId));
  }, [wishlistIds]);

  const toggleWishlist = useCallback(
    async (productId) => {
      const token = getToken();
      if (!token) {
        toast.info("Please login");
        openLoginModal();
        return;
      }

      if (!productId) return;

      const numericId = Number(productId);
      const productExists = wishlistIds.has(numericId);
      setWishlistBusy(true);

      // Optimistic UI
      const prev = wishlistProducts;
      if (productExists) {
        setWishlistProducts((items) => items.filter((p) => Number(p.id) !== numericId));
     } else {
  // Don't add a placeholder product.
  // The wishlist will refresh silently after the API call succeeds.
}
      try {
        if (productExists) {
          await API.delete("wishlist/", {
            data: { product_id: productId },
          });
          toast.info("Removed from wishlist ❌");
        } else {
          await API.post("wishlist/", { product_id: productId });
          toast.success("Added to wishlist ❤️");
        }

        await fetchWishlistFromBackend();
      } catch (err) {
        // rollback optimistic state
        setWishlistProducts(prev);
        if (err?.response?.status === 401) {
          setWishlistProducts([]);
          toast.info("Please login");
          openLoginModal();
          return;
        }
        toast.error("Wishlist update failed");
      } finally {
        setWishlistBusy(false);
      }
    },
    [fetchWishlistFromBackend, wishlistIds]
  );

  const value = useMemo(
    () => ({
      wishlistProducts,
      wishlistLoading,
      wishlistBusy,
      fetchWishlistFromBackend,
      isWishlisted,
      toggleWishlist,
    }),
    [wishlistProducts, wishlistLoading, wishlistBusy, fetchWishlistFromBackend, isWishlisted, toggleWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

