import axiosInstance from "./axiosConfig";
import { type Product } from "@/lib/types";

function normalizeProduct(p: any): Product {
  if (!p || typeof p !== "object") return p;
  const name = p.name || p.title || "";
  const title = p.title || p.name || "";
  const slug = p.slug || p.handle || "";
  const handle = p.handle || p.slug || "";
  const id = String(p.id ?? "");
  const price = typeof p.price === "number" ? p.price : (parseFloat(p.price) || 0);
  const image = p.image || (Array.isArray(p.images) && p.images[0]?.image) || "";
  let brandName = p.brand_name || (typeof p.brand === "object" && p.brand?.name) || (typeof p.brand === "string" ? p.brand : "") || "";
  if (!brandName && Array.isArray(p.details)) {
    const brandDetail = p.details.find((d: any) => typeof d === "string" && d.toLowerCase().startsWith("brand:"));
    if (brandDetail) {
      brandName = brandDetail.split(":")[1]?.trim() || "";
    }
  }
  if (!brandName) brandName = "Luma Threads";

  const categoryName = p.category_name || p.category_title || (typeof p.category === "object" && p.category?.title) || (typeof p.category === "string" && isNaN(Number(p.category)) ? p.category : "") || "Apparel";

  const totalVariantStock = Array.isArray(p.variants) && p.variants.length > 0
    ? p.variants.reduce((acc: number, v: any) => acc + (Number(v.stock_quantity) || 0), 0)
    : null;
  const computedStock = typeof p.stock === "number" ? p.stock : (totalVariantStock !== null ? totalVariantStock : (p.is_active === false ? 0 : 50));

  return {
    ...p,
    id,
    handle,
    name,
    title,
    slug,
    price,
    image,
    brand_name: brandName,
    brand: brandName,
    category_name: categoryName,
    category: categoryName,
    stock: computedStock,
  };
}

export const productService = {
  async getAll(options?: { company?: string }) {
    try {
      const response = await axiosInstance.get("/store/products/", {
        params: options
      });
      const data = response.data;
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as Record<string, unknown>).results)) {
        list = (data as Record<string, unknown>).results as any[];
      }
      return list.map(normalizeProduct) as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  async getBySlug(slug: string) {
    try {
      const response = await axiosInstance.get(`/store/products/${slug}/`);
      return normalizeProduct(response.data) as Product;
    } catch (error) {
      console.error(`Error fetching product ${slug}:`, error);
      return null;
    }
  },

  async getById(id: string | number) {
    try {
      const response = await axiosInstance.get(`/admin/products/${id}/`);
      return normalizeProduct(response.data) as Product;
    } catch (error) {
      console.error(`Error fetching product ID ${id}:`, error);
      return null;
    }
  },

  async getByCategory(categorySlug: string, options?: { company?: string }) {
    try {
      const response = await axiosInstance.get("/store/products/", {
        params: {
          category: categorySlug,
          ...options
        }
      });
      const data = response.data;
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as Record<string, unknown>).results)) {
        list = (data as Record<string, unknown>).results as any[];
      }
      return list.map(normalizeProduct) as Product[];
    } catch (error) {
      console.error(`Error fetching products for category ${categorySlug}:`, error);
      return [];
    }
  },

  // Admin methods
  async create(productData: Partial<Product>) {
    try {
      const response = await axiosInstance.post("/admin/products/", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async update(id: string | number, productData: Partial<Product>) {
    try {
      const response = await axiosInstance.patch(`/admin/products/${id}/`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string | number) {
    try {
      await axiosInstance.delete(`/admin/products/${id}/`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
};
