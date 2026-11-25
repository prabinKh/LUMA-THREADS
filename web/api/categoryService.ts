import axiosInstance from "./axiosConfig";
import { type Category } from "@/lib/types";

function normalizeCategory(c: any): Category {
  if (!c || typeof c !== "object") return c;
  const name = c.name || c.title || "";
  const title = c.title || c.name || "";
  const slug = c.slug || c.handle || "";
  const handle = c.handle || c.slug || "";
  const subcategories = Array.isArray(c.subcategories)
    ? c.subcategories.map((s: any) => ({
        ...s,
        name: s.name || s.title || "",
        title: s.title || s.name || "",
        slug: s.slug || s.handle || "",
        handle: s.handle || s.slug || "",
      }))
    : [];

  return {
    ...c,
    name,
    title,
    slug,
    handle,
    subcategories,
  };
}

export const categoryService = {
  async getAll(options?: { company?: string }) {
    try {
      const response = await axiosInstance.get("/store/categories/", {
        params: options
      });
      const data = response.data;
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as Record<string, unknown>).results)) {
        list = (data as Record<string, unknown>).results as any[];
      }
      return list.map(normalizeCategory) as Category[];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  async getBySlug(slug: string) {
    try {
      const response = await axiosInstance.get(`/store/categories/${slug}/`);
      return normalizeCategory(response.data) as Category;
    } catch (error) {
      console.error(`Error fetching category ${slug}:`, error);
      return null;
    }
  },

  async getFeatures(categorySlug: string) {
    try {
      const response = await axiosInstance.get(`/admin/category-features/`);
      const all = response.data;
      return Array.isArray(all) ? all.find((f) => f?.category_slug === categorySlug || f?.categorySlug === categorySlug || f?.category === categorySlug) ?? null : null;
    } catch (error) {
      console.error(`Error fetching features for ${categorySlug}:`, error);
      return null;
    }
  },

  async updateFeatures(categorySlug: string, featureData: Record<string, unknown>) {
    try {
      const payload = {
        ...featureData,
        categorySlug: categorySlug
      };

      const response = await axiosInstance.post("/admin/category-features/", payload);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error updating features for ${categorySlug}:`, error);
      throw error;
    }
  },

  async create(categoryData: Partial<Category>) {
    try {
      const response = await axiosInstance.post("/admin/categories/", categoryData);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async update(slug: string, categoryData: Partial<Category>) {
    try {
      const response = await axiosInstance.patch(`/admin/categories/${slug}/`, categoryData);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error updating category ${slug}:`, error);
      throw error;
    }
  },

  async delete(slug: string) {
    try {
      await axiosInstance.delete(`/admin/categories/${slug}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting category ${slug}:`, error);
      throw error;
    }
  },

  async createCategory(data: { title: string; handle?: string }) {
    try {
      const response = await axiosInstance.post("/admin/categories/add/", data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async createSubCategory(data: { title: string; handle?: string; category_id: string | number }) {
    try {
      const response = await axiosInstance.post("/admin/categories/add/", data);
      return response.data;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  async deleteCategory(idOrHandle: string | number) {
    try {
      const response = await axiosInstance.delete(`/admin/categories/${idOrHandle}/delete/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${idOrHandle}:`, error);
      throw error;
    }
  },

  async deleteSubCategory(idOrHandle: string | number) {
    try {
      const response = await axiosInstance.delete(`/admin/subcategories/${idOrHandle}/delete/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subcategory ${idOrHandle}:`, error);
      throw error;
    }
  },

  async getAllFeatures() {
    try {
      const response = await axiosInstance.get("/admin/category-features/");
      return response.data;
    } catch (error) {
      console.error("Error fetching all features:", error);
      return [];
    }
  },

  async deleteFeatures(categorySlug: string) {
    await this.updateFeatures(categorySlug, { features: [] });
  }
};
