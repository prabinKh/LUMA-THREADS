import axiosInstance from "./axiosConfig";
import { type Customer } from "@/types/order";

function normalizeCustomer(c: any): Customer {
  if (!c || typeof c !== "object") return c;
  const id = String(c.id ?? c.uid ?? "");
  const uid = String(c.uid ?? c.id ?? "");
  const displayName = c.displayName || c.name || (c.email ? c.email.split("@")[0] : "Customer");
  const name = c.name || displayName;
  const email = c.email || "";

  return {
    ...c,
    id,
    uid,
    displayName,
    name,
    email,
    visitCount: typeof c.visitCount === "number" ? c.visitCount : 1,
    createdAt: c.createdAt || c.date_joined || new Date().toISOString(),
    order_count: typeof c.order_count === "number" ? c.order_count : 0,
    total_spent: typeof c.total_spent === "number" ? c.total_spent : (parseFloat(c.total_spent) || 0),
  };
}

export const customerService = {
  async create(customerData: { name?: string; first_name?: string; last_name?: string; email: string; phone?: string; address?: string; city?: string }) {
    try {
      const response = await axiosInstance.post("/admin/customers/add/", customerData);
      return normalizeCustomer(response.data) as Customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      const response = await axiosInstance.get("/admin/customers/");
      const data = response.data;
      let list: any[] = [];
      if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
        list = (data as any).results;
      } else if (Array.isArray(data)) {
        list = data;
      }
      return list.map(normalizeCustomer) as Customer[];
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  },

  async getById(id: string | number, email?: string | null) {
    try {
      const response = await axiosInstance.get(`/admin/customers/${id}/`, {
        params: email ? { email } : {}
      });
      return normalizeCustomer(response.data) as Customer;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      return null;
    }
  },

  async update(id: string | number, customerData: Partial<Customer>) {
    try {
      const response = await axiosInstance.patch(`/admin/customers/${id}/`, customerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  async updateCart(userId: string | number, cartItems: unknown[]) {
    try {
      const response = await axiosInstance.post(`/admin/customers/${userId}/sync_cart/`, { cartItems });
      return response.data;
    } catch (error) {
      console.error(`Error syncing cart for user ${userId}:`, error);
      throw error;
    }
  },

  async clearCart(userId: string | number) {
    try {
      const response = await axiosInstance.post(`/admin/customers/${userId}/sync_cart/`, { cartItems: [] });
      return response.data;
    } catch (error) {
      console.error(`Error clearing cart for user ${userId}:`, error);
      throw error;
    }
  },

  async syncWishlist(userId: string | number, wishlistItems: unknown[]) {
    try {
      const response = await axiosInstance.post(`/admin/customers/${userId}/sync_wishlist/`, { wishlistItems });
      return response.data;
    } catch (error) {
      console.error(`Error syncing wishlist for user ${userId}:`, error);
      throw error;
    }
  },

  async delete(id: string | number) {
    try {
      await axiosInstance.delete(`/admin/customers/${id}/`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }
};
