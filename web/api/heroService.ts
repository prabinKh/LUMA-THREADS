import axiosInstance from "./axiosConfig";

export interface BannerHoliday {
  enabled: boolean;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaHref: string;
}

export interface HeroContent {
  id?: number | string;
  subtitle: string;
  title: string;
  desktop: string;
  mobile: string;
  cta: string;
  ctaHref: string;
  secondaryCta?: string;
  secondaryCtaHref?: string;
  badge?: string;
  overlayOpacity?: number;
  alignment?: "center" | "left" | "right";
  bannerHoliday?: BannerHoliday;
  // Legacy / fallback fields:
  image?: string;
  description?: string;
  link?: string;
  buttonText?: string;
  specs?: { label: string; value: string }[];
}

export const DEFAULT_FRONTEND_HERO: HeroContent = {
  subtitle: "EVERYDAY UTILITY. ELEVATED EASE.",
  title: "WINTER 2026",
  desktop: "https://pistoladenim.com/cdn/shop/files/desktop_banner_winter24_2.jpg?v=1730999554&width=3840",
  mobile: "https://pistoladenim.com/cdn/shop/files/mobile_banner_winter24_2.jpg?v=1730999554&width=1500",
  cta: "EXPLORE THE CAMPAIGN",
  ctaHref: "/collections/all-new",
  secondaryCta: "SHOP BEST SELLERS",
  secondaryCtaHref: "/collections/best-sellers",
  badge: "NEW ARRIVAL • ARTISANAL DENIM",
  overlayOpacity: 20,
  alignment: "center",
  bannerHoliday: {
    enabled: true,
    title: "HOLIDAY 2026",
    subtitle: "CURATED CAPSULE COLLECTION",
    image: "https://pistoladenim.com/cdn/shop/files/desktop_holiday_banner.jpg?v=1730999554&width=3840",
    cta: "SHOP THE DROP",
    ctaHref: "/collections/all-denim",
  },
};

const STORAGE_KEY = "lumathreads_hero_settings";

export const heroService = {
  getSettings: async (options?: { company?: string }): Promise<HeroContent> => {
    try {
      const response = await axiosInstance.get("/admin/hero-settings/", {
        params: options,
      });
      const data = response.data;
      const parsed = Array.isArray(data) && data.length > 0 ? data[0] : data;
      if (parsed && typeof parsed === "object" && (parsed.title || parsed.desktop)) {
        const merged: HeroContent = {
          ...DEFAULT_FRONTEND_HERO,
          ...parsed,
          desktop: parsed.desktop || parsed.image || DEFAULT_FRONTEND_HERO.desktop,
          mobile: parsed.mobile || parsed.desktop || parsed.image || DEFAULT_FRONTEND_HERO.mobile,
          cta: parsed.cta || parsed.buttonText || DEFAULT_FRONTEND_HERO.cta,
          ctaHref: parsed.ctaHref || parsed.link || DEFAULT_FRONTEND_HERO.ctaHref,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (error) {
      console.warn("Could not fetch hero settings from API, checking local storage:", error);
    }

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }

    return DEFAULT_FRONTEND_HERO;
  },

  updateSettings: async (data: HeroContent): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("lumathreads_hero_updated", { detail: data }));
      }
      await axiosInstance.post("/admin/hero-settings/", data);
    } catch (error) {
      console.error("Error updating hero settings on backend:", error);
      // Even if backend fails, local storage was updated so UI remains responsive
      throw error;
    }
  },
};
