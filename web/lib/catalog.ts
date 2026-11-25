import data from "./catalog.json";
import type { Catalog, Collection, Product } from "./types";

const catalog = data as unknown as Catalog;
const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://127.0.0.1:8000/api";

export const COLLECTION_ALIASES: Record<string, string> = {
  "shop-all": "all-denim",
  "all": "all-denim",
  "denim": "all-denim",
  "sale": "best-sellers",
  "straight": "all-denim",
  "straight-jeans": "all-denim",
  "barrel-jeans": "all-denim",
  "skinny-jeans": "all-denim",
  "bootcut-jeans": "all-denim",
  "wide-leg-jeans": "all-denim",
  "flare-jeans": "all-denim",
  "high-rise-denim": "all-denim",
  "mid-rise-denim": "all-denim",
  "low-rise-denim": "all-denim",
  "light-wash": "all-denim",
  "dark-wash": "all-denim",
  "black-denim": "all-denim",
  "white-denim": "all-denim",
  "tops": "all-new",
  "bottoms": "all-denim",
  "dresses-skirts": "all-new",
  "outerwear": "all-new",
  "knitwear": "all-new",
  "accessories": "all-new",
  "event-dressing": "all-new",
  "new-denim": "all-denim",
  "new-tops": "all-new",
  "new-bottoms": "all-denim",
};

export function getCatalog(): Catalog {
  return catalog;
}

export function getProduct(handle: string): Product | undefined {
  if (catalog.products[handle]) return catalog.products[handle];
  const normalized = handle.toLowerCase().trim();
  const all = Object.values(catalog.products);
  return all.find(
    (p) =>
      p.handle.toLowerCase() === normalized ||
      p.swatches?.some(
        (s) => s.handle?.toLowerCase() === normalized || s.name?.toLowerCase() === normalized
      ) ||
      p.colorway?.toLowerCase() === normalized
  );
}

export function getAllProducts(): Product[] {
  return Object.values(catalog.products);
}

export function resolveCollectionHandle(handle: string): string {
  return COLLECTION_ALIASES[handle] ?? handle;
}

export function getCollection(handle: string): Collection | undefined {
  const resolved = resolveCollectionHandle(handle);
  const col = catalog.collections[resolved] || catalog.collections[handle];
  if (col) {
    return { ...col, handle: resolved };
  }
  const formattedTitle = handle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    handle,
    title: formattedTitle,
    description: `Curated ${formattedTitle} collection at Luma Threads.`,
    image: "",
    products: [],
  };
}

export function getCollectionProducts(handle: string): Product[] {
  const collection = getCollection(handle);
  if (!collection) return [];
  return collection.products
    .map((h) => catalog.products[h])
    .filter((p): p is Product => Boolean(p));
}

export function getHomeProducts(): Product[] {
  const newArrivals = catalog.collections["all-new"]?.products || [];
  return newArrivals
    .slice(0, 8)
    .map((h) => catalog.products[h])
    .filter((p): p is Product => Boolean(p));
}

export function getEditorialProducts(): Product[] {
  const handles = catalog.editorial?.products || [];
  return handles
    .map((h) => catalog.products[h])
    .filter((p): p is Product => Boolean(p));
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllProducts();
  return getAllProducts().filter((p) =>
    `${p.title} ${p.colorway || ""} ${p.handle}`.toLowerCase().includes(q)
  );
}

export function formatPrice(price: number | string): string {
  if (typeof price === "number") {
    return `$${price.toFixed(2)}`;
  }
  if (!price.startsWith("$")) {
    return `$${price}`;
  }
  return price;
}

async function safeJsonFetch(url: string): Promise<any> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Live Django API asynchronous integration functions with resilient fallback
export async function getAllProductsAsync(): Promise<Product[]> {
  try {
    const data = await safeJsonFetch(`${DJANGO_URL}/store/products/`);
    if (data) {
      const list = Array.isArray(data) ? data : data?.results;
      if (Array.isArray(list) && list.length > 0) {
        return list as Product[];
      }
    }
  } catch (err) {
    console.warn("Django API unreachable, using static catalog:", err);
  }
  return getAllProducts();
}

export async function getProductAsync(handle: string): Promise<Product | undefined> {
  try {
    const data = await safeJsonFetch(`${DJANGO_URL}/store/products/${handle}/`);
    if (data && data.handle) {
      return data as Product;
    }
  } catch (err) {
    console.warn(`Django API product lookup failed for ${handle}, using fallback:`, err);
  }
  return getProduct(handle);
}

export async function getCollectionProductsAsync(handle: string): Promise<Product[]> {
  const resolved = resolveCollectionHandle(handle);
  try {
    // If all or shop-all, fetch all products
    if (handle === "all" || handle === "shop-all" || resolved === "all" || resolved === "shop-all") {
      const all = await getAllProductsAsync();
      if (all && all.length > 0) return all;
    }

    // Try collection query first
    const dataCol = await safeJsonFetch(`${DJANGO_URL}/store/products/?collection=${encodeURIComponent(handle)}`);
    if (dataCol) {
      const list = Array.isArray(dataCol) ? dataCol : dataCol?.results;
      if (Array.isArray(list) && list.length > 0) {
        return list as Product[];
      }
    }

    // Try category query next (denim, tops, sweaters, dresses, jackets, accessories)
    const dataCat = await safeJsonFetch(`${DJANGO_URL}/store/products/?category=${encodeURIComponent(resolved)}`);
    if (dataCat) {
      const list = Array.isArray(dataCat) ? dataCat : dataCat?.results;
      if (Array.isArray(list) && list.length > 0) {
        return list as Product[];
      }
    }
  } catch (err) {
    console.warn(`Django API collection products failed for ${handle}:`, err);
  }

  // Resilient fallback: fetch all products and filter in memory
  try {
    const all = await getAllProductsAsync();
    if (all && all.length > 0) {
      const hLower = handle.toLowerCase();
      const rLower = resolved.toLowerCase();
      const filtered = all.filter((p: any) => {
        const cat = (p.category_handle || p.category_title || p.category || "").toLowerCase();
        const sub = (p.subcategory_handle || p.subcategory_title || p.subcategory || "").toLowerCase();
        const colList = Array.isArray(p.collections) ? p.collections.map((c: any) => String(c).toLowerCase()) : [];
        return (
          cat === hLower ||
          cat === rLower ||
          sub === hLower ||
          sub === rLower ||
          colList.includes(hLower) ||
          colList.includes(rLower)
        );
      });
      if (filtered.length > 0) return filtered;
      return all;
    }
  } catch {}

  return getCollectionProducts(handle);
}

export async function getHomeProductsAsync(): Promise<Product[]> {
  const all = await getAllProductsAsync();
  return all.slice(0, 8);
}
