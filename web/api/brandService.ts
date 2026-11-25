import axiosInstance from "./axiosConfig";
import { safeStorage } from "@/lib/storage";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  categories?: unknown[];
  category_ids?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = "luma_admin_brands";

const DEFAULT_BRANDS: Brand[] = [
  {
    id: 1,
    name: "Luma Threads",
    slug: "luma-threads",
    description: "Premium sustainable essentials & utilitarian craftsmanship",
    logo: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&h=100&fit=crop",
    categories: [{ slug: "tops", name: "Tops" }, { slug: "denim", name: "Denim" }],
    category_ids: ["tops", "denim"],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Pistola Denim",
    slug: "pistola-denim",
    description: "California-crafted premium denim and modern silhouettes",
    logo: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop",
    categories: [{ slug: "denim", name: "Denim" }, { slug: "bottoms", name: "Bottoms" }],
    category_ids: ["denim", "bottoms"],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Atelier Studio",
    slug: "atelier-studio",
    description: "Tailored outerwear, cashmere knitwear, and timeless classics",
    logo: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&h=100&fit=crop",
    categories: [{ slug: "outerwear", name: "Outerwear" }, { slug: "knitwear", name: "Knitwear" }],
    category_ids: ["outerwear", "knitwear"],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

function getStoredBrands(): Brand[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_BRANDS;
}

function saveStoredBrands(brands: Brand[]): void {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
  } catch (e) {
    // ignore
  }
}

export const brandService = {
  // Public endpoints
  async getAll(categorySlug?: string, options?: { company?: string }) {
    try {
      const response = await axiosInstance.get("/store/brands/", {
        params: {
          category: categorySlug,
          ...options
        }
      });
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        saveStoredBrands(data);
        return data as Brand[];
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as Record<string, unknown>).results)) {
        const results = (data as Record<string, unknown>).results as Brand[];
        if (results.length > 0) {
          saveStoredBrands(results);
          return results;
        }
      }
    } catch (error) {
      console.warn("Backend brands endpoint unavailable, using local cache:", error);
    }
    return getStoredBrands();
  },

  async getBySlug(slug: string) {
    try {
      const response = await axiosInstance.get(`/store/brands/${slug}/`);
      return response.data as Brand;
    } catch (error) {
      const all = getStoredBrands();
      return all.find(b => b.slug === slug) || null;
    }
  },

  // Admin endpoints
  async createBrand(data: Partial<Brand>) {
    let createdBrand: Brand | null = null;
    try {
      const response = await axiosInstance.post("/admin/brands/", data);
      createdBrand = response.data as Brand;
    } catch (error) {
      console.warn("Backend create brand endpoint unavailable, saving to local store:", error);
    }

    const current = getStoredBrands();
    const newBrand: Brand = createdBrand || {
      id: Date.now(),
      name: data.name || "New Brand",
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `brand-${Date.now()}`),
      description: data.description || "",
      logo: data.logo || "",
      categories: (data.category_ids || []).map(id => ({ slug: id, id, name: id.charAt(0).toUpperCase() + id.slice(1) })),
      category_ids: data.category_ids || [],
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newBrand, ...current.filter(b => b.slug !== newBrand.slug)];
    saveStoredBrands(updated);
    return newBrand;
  },

  async updateBrand(slug: string, data: Partial<Brand>) {
    let updatedBrand: Brand | null = null;
    try {
      const response = await axiosInstance.patch(`/admin/brands/${slug}/`, data);
      updatedBrand = response.data as Brand;
    } catch (error) {
      console.warn("Backend update brand endpoint unavailable, updating local store:", error);
    }

    const current = getStoredBrands();
    const updated = current.map(b => {
      if (b.slug === slug) {
        return {
          ...b,
          ...data,
          categories: data.category_ids ? data.category_ids.map(id => ({ slug: id, id, name: id.charAt(0).toUpperCase() + id.slice(1) })) : b.categories,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });
    saveStoredBrands(updated);
    return updatedBrand || updated.find(b => b.slug === slug) || (data as Brand);
  },

  async deleteBrand(slug: string) {
    try {
      await axiosInstance.delete(`/admin/brands/${slug}/`);
    } catch (error) {
      console.warn("Backend delete brand endpoint unavailable, deleting from local store:", error);
    }

    const current = getStoredBrands();
    const updated = current.filter(b => b.slug !== slug);
    saveStoredBrands(updated);
    return true;
  },

  async getAllAdmin(search?: string) {
    try {
      const response = await axiosInstance.get("/admin/brands/", {
        params: search ? { search } : {}
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as any).results) ? (data as any).results : null);
      if (list && list.length > 0) {
        saveStoredBrands(list);
        return list as Brand[];
      }
    } catch (error) {
      console.warn("Backend admin brands endpoint unavailable, using local cache:", error);
    }

    const stored = getStoredBrands();
    if (search && search.trim()) {
      const q = search.toLowerCase();
      return stored.filter(b => b.name.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q));
    }
    return stored;
  },
};
