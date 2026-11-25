import axiosInstance from "./axiosConfig";

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  enabled: boolean;
  links: FooterLink[];
}

export interface FooterSettingsData {
  newsletter: {
    enabled: boolean;
    title: string;
    placeholder: string;
    buttonText: string;
    successMessage: string;
  };
  customerSupport: {
    enabled: boolean;
    heading: string;
    email: string;
    hours: string;
    phone?: string;
    address?: string;
  };
  social: {
    enabled: boolean;
    facebook: string;
    instagram: string;
    twitter: string;
    pinterest: string;
    tiktok: string;
    youtube: string;
  };
  columns: FooterColumn[];
  bottomBar: {
    copyright: string;
    showPaymentBadges: boolean;
    paymentBadges: string[];
  };
}

export const DEFAULT_FRONTEND_FOOTER: FooterSettingsData = {
  newsletter: {
    enabled: true,
    title: "STAY IN THE KNOW",
    placeholder: "Enter your email",
    buttonText: "→",
    successMessage: "Thank you for subscribing to Luma Threads!",
  },
  customerSupport: {
    enabled: true,
    heading: "CUSTOMER SUPPORT",
    email: "customerservice@lumathreads.com",
    hours: "Monday – Friday 8AM – 5PM PST",
    phone: "+1 (800) 586-2847",
    address: "Atelier Studio, Los Angeles, CA",
  },
  social: {
    enabled: true,
    facebook: "https://www.facebook.com/pistoladenimla/",
    instagram: "https://www.instagram.com/pistoladenim/?hl=en",
    twitter: "https://twitter.com/pistoladenim",
    pinterest: "https://www.pinterest.com/pistoladenim/",
    tiktok: "https://www.tiktok.com/@pistoladenim",
    youtube: "",
  },
  columns: [
    {
      id: "col-shop",
      title: "SHOP",
      enabled: true,
      links: [
        {"label": "All New", "url": "/collections/all-new"},
        {"label": "All Denim", "url": "/collections/all-denim"},
        {"label": "Best Sellers", "url": "/collections/best-sellers"},
        {"label": "Barrel Jeans", "url": "/collections/all-denim"},
        {"label": "Straight Leg", "url": "/collections/all-denim"},
      ],
    },
    {
      id: "col-about",
      title: "ABOUT",
      enabled: true,
      links: [
        {"label": "Our Story", "url": "/pages/about-us"},
        {"label": "Denim Fit Guide", "url": "/collections/all-denim"},
        {"label": "Sustainability", "url": "/pages/about-us"},
        {"label": "Stockists", "url": "/pages/about-us"},
      ],
    },
    {
      id: "col-help",
      title: "HELP",
      enabled: true,
      links: [
        {"label": "Shipping & Returns", "url": "/pages/about-us"},
        {"label": "FAQ", "url": "/pages/about-us"},
        {"label": "Size Guide", "url": "/pages/about-us"},
        {"label": "Contact Us", "url": "/pages/about-us"},
      ],
    },
  ],
  bottomBar: {
    copyright: "© 2026, Luma Threads. All rights reserved.",
    showPaymentBadges: true,
    paymentBadges: ["VISA", "MC", "AMEX", "DISC", "APPLE PAY", "PAYPAL", "KLARNA", "AFTERPAY"],
  },
};

const STORAGE_KEY = "lumathreads_footer_settings";

export const footerService = {
  getSettings: async (): Promise<FooterSettingsData> => {
    try {
      const response = await axiosInstance.get("/admin/footer-settings/");
      const data = response.data;
      if (data && typeof data === "object" && (data.columns || data.newsletter || data.customerSupport)) {
        const merged: FooterSettingsData = {
          ...DEFAULT_FRONTEND_FOOTER,
          ...data,
          newsletter: { ...DEFAULT_FRONTEND_FOOTER.newsletter, ...(data.newsletter || {}) },
          customerSupport: { ...DEFAULT_FRONTEND_FOOTER.customerSupport, ...(data.customerSupport || {}) },
          social: { ...DEFAULT_FRONTEND_FOOTER.social, ...(data.social || {}) },
          columns: Array.isArray(data.columns) && data.columns.length > 0 ? data.columns : DEFAULT_FRONTEND_FOOTER.columns,
          bottomBar: { ...DEFAULT_FRONTEND_FOOTER.bottomBar, ...(data.bottomBar || {}) },
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (error) {
      console.warn("Could not fetch footer settings from API, using fallback:", error);
    }

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }

    return DEFAULT_FRONTEND_FOOTER;
  },

  updateSettings: async (data: FooterSettingsData): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("lumathreads_footer_updated", { detail: data }));
      }
      await axiosInstance.post("/admin/footer-settings/", data);
    } catch (error) {
      console.error("Error updating footer settings on server:", error);
      throw error;
    }
  },
};
