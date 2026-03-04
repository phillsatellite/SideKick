import { useEffect } from "react";

export function useEscapeKey(handler) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handler();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handler]);
}
