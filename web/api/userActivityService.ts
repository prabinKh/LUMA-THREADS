import axiosInstance from "./axiosConfig";

export interface UserActivityLog {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  pageType: string;
  path: string;
  action:
    | "page_view"
    | "page_duration"
    | "card_hover"
    | "card_click"
    | "card_swatch_select"
    | "card_size_select"
    | "card_quick_add"
    | string;
  duration: number; // in seconds
  metadata?: {
    pageTitle?: string;
    productTitle?: string;
    productHandle?: string;
    productPrice?: number | string;
    productColor?: string;
    productImage?: string;
    selectedSize?: string;
    hoverSeconds?: number;
    referrer?: string;
    screenResolution?: string;
    [key: string]: unknown;
  };
  timestamp: string;
  userAgent?: string;
  screenResolution?: string;
  ipAddress?: string;
}

const STORAGE_KEY = "lumathreads_user_activities";

export const getVisitorId = (): string => {
  if (typeof window === "undefined") return "guest";
  let vid = localStorage.getItem("lumathreads_visitor_id");
  if (!vid) {
    vid = "guest_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("lumathreads_visitor_id", vid);
  }
  return vid;
};

export const getCurrentUserInfo = () => {
  if (typeof window === "undefined") {
    return { uid: "guest", email: "guest@lumathreads.local", displayName: "Guest Visitor" };
  }

  try {
    const rawUser = localStorage.getItem("user") || localStorage.getItem("current_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      return {
        uid: String(u.id || u.uid || u.email || "user"),
        email: u.email || "user@lumathreads.local",
        displayName: u.name || u.displayName || u.first_name || u.email?.split("@")[0] || "Shopper",
      };
    }
  } catch (e) {
    // fallback
  }

  const vid = getVisitorId();
  return {
    uid: vid,
    email: `${vid}@guest.lumathreads.local`,
    displayName: `Visitor #${vid.slice(-4).toUpperCase()}`,
  };
};

export const userActivityService = {
  log: async (activity: Partial<UserActivityLog>): Promise<UserActivityLog | null> => {
    if (typeof window === "undefined") return null;

    const user = getCurrentUserInfo();
    const id = activity.id || "act_" + Math.random().toString(36).substring(2, 12);
    const fullLog: UserActivityLog = {
      id,
      uid: activity.uid || user.uid,
      email: activity.email || user.email,
      displayName: activity.displayName || user.displayName,
      pageType: activity.pageType || "page",
      path: activity.path || window.location.pathname,
      action: activity.action || "page_view",
      duration: Math.max(0, activity.duration || 0),
      metadata: activity.metadata || {},
      timestamp: activity.timestamp || new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };

    // 1. Save to localStorage immediately (local resilient log)
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      let list: UserActivityLog[] = existingRaw ? JSON.parse(existingRaw) : [];
      const existingIdx = list.findIndex((a) => a.id === fullLog.id);
      if (existingIdx >= 0) {
        list[existingIdx] = fullLog;
      } else {
        list.unshift(fullLog);
      }
      list = list.slice(0, 1000); // keep last 1000 client side
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("lumathreads_activity_logged", { detail: fullLog }));
    } catch (e) {
      // storage quota or error
    }

    // 2. Transmit to backend API
    try {
      await axiosInstance.post("/admin/activity/", fullLog);
    } catch (error) {
      // network/server fallback is handled by localStorage
    }

    return fullLog;
  },

  track: async (
    action: string,
    metadata: Record<string, unknown> = {},
    duration: number = 0,
    path?: string
  ) => {
    return userActivityService.log({
      action,
      metadata,
      duration,
      path: path || (typeof window !== "undefined" ? window.location.pathname : "/"),
    });
  },

  getAll: async (filters?: { uid?: string; path?: string; card?: string }): Promise<UserActivityLog[]> => {
    let apiLogs: UserActivityLog[] = [];
    try {
      const response = await axiosInstance.get("/admin/activity/", { params: filters });
      if (Array.isArray(response.data)) {
        apiLogs = response.data;
      }
    } catch (e) {
      console.warn("Could not fetch activities from server, using local storage:", e);
    }

    // Merge with client localStorage
    let clientLogs: UserActivityLog[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) clientLogs = JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }

    // Combine uniquely by ID
    const map = new Map<string, UserActivityLog>();
    apiLogs.forEach((l) => map.set(l.id, l));
    clientLogs.forEach((l) => {
      if (!map.has(l.id) || (l.duration > (map.get(l.id)?.duration || 0))) {
        map.set(l.id, l);
      }
    });

    let combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (filters?.uid) {
      combined = combined.filter((l) => l.uid === filters.uid);
    }
    if (filters?.path) {
      combined = combined.filter((l) => l.path === filters.path);
    }
    if (filters?.card) {
      combined = combined.filter(
        (l) =>
          l.metadata?.productHandle === filters.card ||
          l.metadata?.productTitle === filters.card
      );
    }

    return combined;
  },

  clear: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
