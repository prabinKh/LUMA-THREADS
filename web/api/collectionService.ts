import axiosInstance from "./axiosConfig";

export interface Collection {
  id: string | number;
  name: string;
  title: string;
  handle: string;
  slug: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  created_at?: string;
}

function normalizeCollection(raw: any): Collection {
  if (!raw || typeof raw !== "object") return raw;
  const title = raw.title || raw.name || "";
  const name = raw.name || raw.title || "";
  const handle = raw.handle || raw.slug || "";
  const slug = raw.slug || raw.handle || "";
  return {
    ...raw,
    id: raw.id ?? handle,
    name,
    title,
    handle,
    slug,
  };
}

export const collectionService = {
  async getAll(): Promise<Collection[]> {
    try {
      let data: any = null;
      try {
        const response = await axiosInstance.get("/admin/collections/");
        data = response.data;
      } catch {
        const response = await axiosInstance.get("/store/collections/");
        data = response.data;
      }
      const list = Array.isArray(data) ? data : (data && typeof data === "object" && Array.isArray(data.results) ? data.results : []);
      return list.map(normalizeCollection);
    } catch (error) {
      console.error("Error fetching collections:", error);
      return [];
    }
  },

  async getAllPublic(): Promise<Collection[]> {
    try {
      const response = await axiosInstance.get("/store/collections/");
      const data = response.data;
      const list = Array.isArray(data) ? data : (data && typeof data === "object" && Array.isArray(data.results) ? data.results : []);
      return list.map(normalizeCollection);
    } catch (error) {
      console.error("Error fetching public collections:", error);
      return [];
    }
  },

  async create(name: string): Promise<Collection> {
    try {
      const response = await axiosInstance.post("/admin/collections/", { 
        title: name,
        name,
        handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        is_active: true 
      });
      return normalizeCollection(response.data);
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error;
    }
  },

  async delete(id: string | number) {
    try {
      await axiosInstance.delete(`/admin/collections/${id}/`);
    } catch (error) {
      console.error(`Error deleting collection ${id}:`, error);
      throw error;
    }
  }
};
