"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Product } from "@/lib/types";

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (handle: string, size: string) => void;
  updateQuantity: (handle: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pistola_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("pistola_cart", JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, mounted]);

  const addItem = (product: Product, size = "26") => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.product.handle === product.handle && item.size === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.handle === product.handle && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsOpen(true);

    // Asynchronously notify Django admin dashboard of cart activity
    try {
      const sessionId = typeof window !== "undefined"
        ? (localStorage.getItem("shopper_session_id") || (() => {
            const sid = "sess_" + Math.random().toString(36).substring(2, 10);
            localStorage.setItem("shopper_session_id", sid);
            return sid;
          })())
        : "guest_session";

      fetch("/api/cart-requests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          customer_name: "Online Shopper",
          product_name: product.title,
          product_handle: product.handle,
          color: (product.colorVariants && product.colorVariants[0]?.name) || "Default",
          size: size,
          price: product.price,
          quantity: 1,
          image_url: product.image || (product.images && product.images[0]) || "",
          status: "active",
        }),
      }).catch(() => {});
    } catch {
      // Ignore background sync errors
    }
  };

  const removeItem = (handle: string, size: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.handle === handle && item.size === size)
      )
    );
  };

  const updateQuantity = (handle: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(handle, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.handle === handle && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const rawPrice =
      typeof item.product.price === "number"
        ? item.product.price
        : parseFloat(String(item.product.price).replace(/[^0-9.]/g, "")) || 0;
    return sum + rawPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        totalItems,
        subtotal,
      }}
    >
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
