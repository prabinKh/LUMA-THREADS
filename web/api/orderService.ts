import axiosInstance from "./axiosConfig";
import { type Order } from "@/types/order";

function normalizeOrder(raw: any): Order {
  if (!raw) return raw;
  return {
    ...raw,
    id: String(raw.id || raw.order_number || ""),
    orderId: raw.order_number || raw.orderId || String(raw.id || ""),
    customerName: raw.customer_name || raw.customerName || "Customer",
    customerEmail: raw.customer_email || raw.customerEmail || "",
    totalAmount: Number(raw.total_amount ?? raw.totalAmount ?? 0),
    status: (raw.status || "pending").toLowerCase() as Order["status"],
    shippingAddress: typeof raw.shipping_address === "object" && raw.shipping_address !== null
      ? raw.shipping_address
      : {
          address: String(raw.shipping_address || ""),
          city: "",
          phone: raw.customer_phone || "",
        },
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    paymentMethod: raw.payment_method || raw.paymentMethod || "COD",
    paymentStatus: raw.payment_status || raw.paymentStatus || "unpaid",
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any) => ({
          productId: String(it.productId || it.product_handle || it.id || ""),
          name: it.name || it.product_name || "Item",
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image: it.image || it.image_url || "",
          features: it.features || [it.color, it.size].filter(Boolean),
        }))
      : [],
  };
}

export const orderService = {
  async getAll(options?: { status?: string; exclude_status?: string; payment_status?: string }) {
    try {
      const response = await axiosInstance.get("/admin/orders/", {
        params: options
      });
      const data = response.data;
      const rawList = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as any).results) ? (data as any).results : []);
      return rawList.map(normalizeOrder);
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  async getById(id: string | number) {
    try {
      const response = await axiosInstance.get(`/admin/orders/${id}/`);
      return normalizeOrder(response.data);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  },

  async create(orderData: Partial<Order>) {
    try {
      const response = await axiosInstance.post("/orders/", orderData);
      return normalizeOrder(response.data);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async update(id: string | number, orderData: Partial<Order>) {
    try {
      const response = await axiosInstance.patch(`/admin/orders/${id}/`, orderData);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  async updateStatus(id: string | number, status: string) {
    try {
      const response = await axiosInstance.patch(`/admin/orders/${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  async updatePaymentStatus(id: string | number, paymentStatus: string) {
    try {
      const response = await axiosInstance.patch(`/admin/orders/${id}/`, { paymentStatus });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} payment status:`, error);
      throw error;
    }
  },

  async getByUser() {
    try {
      const response = await axiosInstance.get("/store/orders/my-orders/");
      return response.data as Order[];
    } catch (error) {
      console.error("Error fetching my orders:", error);
      return [];
    }
  },

  async delete(id: string | number) {
    try {
      await axiosInstance.delete(`/admin/orders/${id}/`);
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  }
};
