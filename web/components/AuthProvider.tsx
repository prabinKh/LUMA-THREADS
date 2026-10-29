"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type User = {
  email: string;
  name: string;
};

export type OrderItem = {
  handle: string;
  title: string;
  colorway?: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
};

export type Order = {
  id: string;
  date: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "Order Confirmed" | "Preparing for Dispatch" | "Shipped" | "Delivered";
  trackingNumber: string;
  carrier: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  orders: Order[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  hasOrders: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pistola_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedOrders = localStorage.getItem("pistola_orders");
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        if (user) {
          localStorage.setItem("pistola_user", JSON.stringify(user));
        } else {
          localStorage.removeItem("pistola_user");
        }
      } catch {
        // ignore
      }
    }
  }, [user, mounted]);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("pistola_orders", JSON.stringify(orders));
      } catch {
        // ignore
      }
    }
  }, [orders, mounted]);

  const login = (email: string, name?: string) => {
    const defaultName = name || email.split("@")[0] || "Customer";
    setUser({ email, name: defaultName });
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const isLoggedIn = !!user;
  const hasOrders = orders.length > 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        orders,
        login,
        logout,
        addOrder,
        hasOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

