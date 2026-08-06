import { useState, useEffect } from "react";

/**
 * Custom hook to return responsive product display count based on screen width.
 * Desktop (>= 768px): returns 5
 * Mobile (< 768px): returns 6
 * 
 * Uses matchMedia to avoid unnecessary re-renders during resize inside same breakpoint.
 */
export function useResponsiveDisplayCount(desktopCount = 5, mobileCount = 6) {
  const [displayCount, setDisplayCount] = useState(() => {
    if (typeof window === "undefined") return desktopCount;
    return window.innerWidth >= 768 ? desktopCount : mobileCount;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (e) => {
      setDisplayCount(e.matches ? desktopCount : mobileCount);
    };

    // Ensure state matches initial query
    setDisplayCount(mediaQuery.matches ? desktopCount : mobileCount);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [desktopCount, mobileCount]);

  return displayCount;
}

export default useResponsiveDisplayCount;
