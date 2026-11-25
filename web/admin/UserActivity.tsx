import { useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userActivityService, type UserActivityLog } from "@/api/userActivityService";
import {
  Activity,
  User,
  Clock,
  Eye,
  ShoppingCart,
  Search,
  Home,
  Package,
  Filter,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  PieChart as PieChartIcon,
  Users as UsersIcon,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  MousePointerClick,
  Palette,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { safeToDate, formatPrice } from "@/lib/utils";
import { format, subDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

interface UserSummary {
  uid: string;
  email: string;
  displayName: string;
  lastActive: Date;
  totalActivities: number;
  totalTime: number; // in seconds
  cardHoverTime: number; // in seconds
}

interface CardStat {
  handle: string;
  title: string;
  image?: string;
  price?: number | string;
  totalSeconds: number;
  hoverCount: number;
  clickCount: number;
  swatchCount: number;
  quickAddCount: number;
  uniqueUsers: Set<string>;
}

interface PageStat {
  path: string;
  pageType: string;
  totalSeconds: number;
  visits: number;
  uniqueUsers: Set<string>;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export const UserActivity = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"feed" | "cards" | "pages" | "users">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<Record<string, boolean>>({});

  const { data: rawActivities = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["user_activities"],
    queryFn: () => userActivityService.getAll(),
    refetchInterval: 2500, // Live poll every 2.5 seconds
  });

  const activities: UserActivityLog[] = useMemo(() => {
    if (Array.isArray(rawActivities)) return rawActivities;
    return [];
  }, [rawActivities]);

  const { products: allProducts } = useProducts();

  const toggleTechnicalDetails = (id: string) => {
    setShowTechnicalDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Summaries by User
  const userSummaries = useMemo(() => {
    const summaries: Record<string, UserSummary> = {};

    activities.forEach((act) => {
      if (!summaries[act.uid]) {
        summaries[act.uid] = {
          uid: act.uid,
          email: act.email,
          displayName: act.displayName || act.email.split("@")[0],
          lastActive: safeToDate(act.timestamp) || new Date(),
          totalActivities: 0,
          totalTime: 0,
          cardHoverTime: 0,
        };
      }

      summaries[act.uid].totalActivities += 1;
      summaries[act.uid].totalTime += Number(act.duration || 0);

      if (act.action === "card_hover" || act.metadata?.hoverSeconds) {
        summaries[act.uid].cardHoverTime += Number(act.metadata?.hoverSeconds || act.duration || 0);
      }

      const actDate = safeToDate(act.timestamp);
      if (actDate && actDate > summaries[act.uid].lastActive) {
        summaries[act.uid].lastActive = actDate;
      }
    });

    return Object.values(summaries).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
  }, [activities]);

  // Aggregated Card Engagement Stats (Every second spent on particular card!)
  const cardStats = useMemo(() => {
    const map: Record<string, CardStat> = {};

    activities.forEach((act) => {
      const handle =
        act.metadata?.productHandle ||
        (act.path.startsWith("/products/") ? act.path.replace("/products/", "").split("?")[0] : null);

      if (!handle) return;

      const title =
        act.metadata?.productTitle ||
        handle
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

      if (!map[handle]) {
        const foundProd = allProducts.find((p) => p.handle === handle || p.slug === handle);
        map[handle] = {
          handle,
          title,
          image: (act.metadata?.productImage as string) || foundProd?.image || foundProd?.images?.[0],
          price: (act.metadata?.productPrice as string | number) || foundProd?.price,
          totalSeconds: 0,
          hoverCount: 0,
          clickCount: 0,
          swatchCount: 0,
          quickAddCount: 0,
          uniqueUsers: new Set(),
        };
      }

      map[handle].uniqueUsers.add(act.uid);

      if (act.action === "card_hover" || act.metadata?.hoverSeconds) {
        const secs = Number(act.metadata?.hoverSeconds || act.duration || 0);
        map[handle].totalSeconds += secs;
        map[handle].hoverCount += 1;
      } else if (act.action === "card_click" || act.pageType === "product_view") {
        map[handle].clickCount += 1;
      } else if (act.action === "card_swatch_select") {
        map[handle].swatchCount += 1;
      } else if (act.action === "card_quick_add" || act.action === "add_to_cart") {
        map[handle].quickAddCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [activities, allProducts]);

  // Aggregated Page Stats (Every second spent on particular page!)
  const pageStats = useMemo(() => {
    const map: Record<string, PageStat> = {};

    activities.forEach((act) => {
      const path = act.path || "/";
      if (!map[path]) {
        map[path] = {
          path,
          pageType: act.pageType || "page",
          totalSeconds: 0,
          visits: 0,
          uniqueUsers: new Set(),
        };
      }

      map[path].uniqueUsers.add(act.uid);
      if (act.action === "page_view") {
        map[path].visits += 1;
      }
      if (act.action === "page_duration" || act.duration > 0) {
        map[path].totalSeconds += Number(act.duration || 0);
      }
    });

    return Object.values(map).sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [activities]);

  // Overall KPI Metrics
  const totalSecondsAll = useMemo(() => {
    return activities.reduce((acc, a) => acc + Number(a.duration || 0), 0);
  }, [activities]);

  const totalCardHoverSeconds = useMemo(() => {
    return cardStats.reduce((acc, c) => acc + c.totalSeconds, 0);
  }, [cardStats]);

  // Filtered Activities for feed
  const filteredActivities = useMemo(() => {
    let result = activities;

    if (selectedUserUid) {
      result = result.filter((a) => a.uid === selectedUserUid);
    }

    if (actionFilter !== "all") {
      result = result.filter((a) => a.action === actionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.path.toLowerCase().includes(q) ||
          (a.metadata?.productTitle as string)?.toLowerCase().includes(q) ||
          (a.metadata?.productHandle as string)?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activities, selectedUserUid, actionFilter, searchQuery]);

  const formatSeconds = (sec: number) => {
    if (!sec || sec < 0) return "0s";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getActionBadge = (act: UserActivityLog) => {
    switch (act.action) {
      case "card_hover":
        return {
          label: "Card Hover",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
          icon: Clock,
        };
      case "card_click":
        return {
          label: "Card Click",
          color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
          icon: MousePointerClick,
        };
      case "card_swatch_select":
        return {
          label: "Color Swatch Switch",
          color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
          icon: Palette,
        };
      case "card_quick_add":
        return {
          label: "Card Quick Add",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
          icon: ShoppingCart,
        };
      case "page_duration":
        return {
          label: "Time on Page",
          color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
          icon: Clock,
        };
      case "page_view":
        return {
          label: "Page View",
          color: "bg-neutral-500/10 text-neutral-600 border-neutral-500/30",
          icon: Eye,
        };
      default:
        return {
          label: act.action.replace(/_/g, " "),
          color: "bg-muted text-muted-foreground",
          icon: Activity,
        };
    }
  };

  return (
    <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-screen max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
              Live Real-Time Tracking
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              User Activity & Second-by-Second Engagement
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tracking every single user session, every second spent on particular store pages, and every second spent hovering and clicking product cards.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm("Clear client-side cached activity logs?")) {
                await userActivityService.clear();
                queryClient.invalidateQueries({ queryKey: ["user_activities"] });
                toast.success("Activity cache cleared.");
              }
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-rose-50 text-muted-foreground hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users Tracked */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <UsersIcon size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Tracked Users</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">{userSummaries.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {userSummaries.filter((u) => u.uid.startsWith("guest")).length} Guests •{" "}
            {userSummaries.filter((u) => !u.uid.startsWith("guest")).length} Authenticated
          </div>
        </div>

        {/* KPI 2: Total Time Spent on Site */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Time Spent</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {formatSeconds(totalSecondsAll)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {totalSecondsAll.toLocaleString()} total active seconds
          </div>
        </div>

        {/* KPI 3: Card Engagement Time */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Package size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Card Seconds Spent</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {formatSeconds(totalCardHoverSeconds)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Across {cardStats.length} product cards
          </div>
        </div>

        {/* KPI 4: Total Logged Actions */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Activity size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Events Logged</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {activities.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Live updates every 2.5s
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        {[
          { id: "cards", label: `Product Cards Engagement (${cardStats.length})`, icon: Package },
          { id: "pages", label: `Pages Time Spent (${pageStats.length})`, icon: Clock },
          { id: "feed", label: `Live Activity Stream (${filteredActivities.length})`, icon: Activity },
          { id: "users", label: `User Journeys (${userSummaries.length})`, icon: UsersIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCT CARDS ENGAGEMENT & SECONDS SPENT */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Time Spent & Interactions Per Product Card
              </h2>
              <p className="text-xs text-muted-foreground">
                Tracks exactly every second users spent hovering, inspecting, and clicking on particular product cards.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Product Card</th>
                    <th className="py-3 px-4">Total Seconds Spent</th>
                    <th className="py-3 px-4 text-center">Hovers</th>
                    <th className="py-3 px-4 text-center">Clicks</th>
                    <th className="py-3 px-4 text-center">Color Swatches</th>
                    <th className="py-3 px-4 text-center">Quick Adds</th>
                    <th className="py-3 px-4 text-center">Shoppers</th>
                    <th className="py-3 px-4 text-right">View PDP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {cardStats.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No card interactions logged yet. Browse products on the homepage or collections to generate live data!
                      </td>
                    </tr>
                  ) : (
                    cardStats.map((c) => {
                      const maxSec = cardStats[0]?.totalSeconds || 1;
                      const pct = Math.min(100, Math.round((c.totalSeconds / maxSec) * 100));

                      return (
                        <tr key={c.handle} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {c.image ? (
                                <img
                                  src={c.image}
                                  alt=""
                                  className="w-10 h-12 object-cover rounded-lg border border-border"
                                />
                              ) : (
                                <div className="w-10 h-12 bg-muted rounded-lg border border-border flex items-center justify-center">
                                  <Package size={16} className="text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-foreground text-xs">{c.title}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {c.handle} • ${parseFloat(String(c.price || "0")).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Seconds Spent with Progress Bar */}
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-foreground font-mono">
                                  {formatSeconds(c.totalSeconds)}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {c.totalSeconds}s
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold font-mono">
                            {c.hoverCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono text-indigo-600">
                            {c.clickCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono text-purple-600">
                            {c.swatchCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono text-emerald-600">
                            {c.quickAddCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px]">
                              {c.uniqueUsers.size}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={`/products/${c.handle}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 inline-flex items-center gap-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[11px]"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAGE DURATION & SECONDS SPENT */}
      {activeTab === "pages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Time Spent Per Page URL
              </h2>
              <p className="text-xs text-muted-foreground">
                Tracks active seconds spent across individual pages, routes, and collection catalogs.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Page Path</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Total Seconds Spent</th>
                    <th className="py-3 px-4 text-center">Visits</th>
                    <th className="py-3 px-4 text-center">Avg Time / Visit</th>
                    <th className="py-3 px-4 text-center">Shoppers</th>
                    <th className="py-3 px-4 text-right">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {pageStats.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        No page views tracked yet.
                      </td>
                    </tr>
                  ) : (
                    pageStats.map((p) => {
                      const maxSec = pageStats[0]?.totalSeconds || 1;
                      const pct = Math.min(100, Math.round((p.totalSeconds / maxSec) * 100));
                      const avgSec = p.visits > 0 ? Math.round(p.totalSeconds / p.visits) : p.totalSeconds;

                      return (
                        <tr key={p.path} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-foreground">
                            {p.path}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold text-[10px] uppercase">
                              {p.pageType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-foreground font-mono">
                                  {formatSeconds(p.totalSeconds)}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {p.totalSeconds}s
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono">
                            {p.visits}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-600">
                            {formatSeconds(avgSec)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-muted text-[10px]">
                              {p.uniqueUsers.size}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={p.path}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 inline-flex items-center gap-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[11px]"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE REAL-TIME ACTIVITY STREAM */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
              <Search size={15} className="text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, product, card, or page path..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <span className="text-[11px] font-bold text-muted-foreground">Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-2.5 py-1 text-xs font-semibold outline-none"
              >
                <option value="all">All Actions</option>
                <option value="card_hover">Card Hovers</option>
                <option value="card_click">Card Clicks</option>
                <option value="card_swatch_select">Swatch Switches</option>
                <option value="card_quick_add">Quick Adds</option>
                <option value="page_duration">Page Durations</option>
                <option value="page_view">Page Views</option>
              </select>

              {selectedUserUid && (
                <button
                  type="button"
                  onClick={() => setSelectedUserUid(null)}
                  className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-bold"
                >
                  Clear User Filter ✕
                </button>
              )}
            </div>
          </div>

          {/* Activity Stream List */}
          <div className="space-y-2.5">
            {filteredActivities.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-xs">
                No activities matching current filter.
              </div>
            ) : (
              filteredActivities.slice(0, 150).map((act) => {
                const badge = getActionBadge(act);
                const BadgeIcon = badge.icon;
                const date = safeToDate(act.timestamp) || new Date();

                return (
                  <div
                    key={act.id}
                    className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-blue-500/40 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Left: User & Action */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-xs shrink-0">
                          {act.displayName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-xs">
                              {act.displayName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({act.uid})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${badge.color}`}
                            >
                              <BadgeIcon size={10} />
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] text-foreground font-semibold">
                              {act.path}
                            </span>
                            {act.metadata?.productTitle && (
                              <span className="text-blue-600 font-bold">
                                • Card: {String(act.metadata.productTitle)}
                              </span>
                            )}
                            {act.metadata?.swatchName && (
                              <span className="text-purple-600 font-bold">
                                • Swatch: {String(act.metadata.swatchName)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Duration Pill & Timestamp */}
                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {act.duration > 0 && (
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1">
                            <Clock size={11} />
                            <span>{act.duration}s</span>
                          </div>
                        )}

                        <span className="text-[10px] text-muted-foreground font-mono">
                          {format(date, "HH:mm:ss")}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleTechnicalDetails(act.id)}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Toggle JSON details"
                        >
                          {showTechnicalDetails[act.id] ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Metadata */}
                    {showTechnicalDetails[act.id] && (
                      <div className="mt-3 pt-3 border-t border-border/60 text-[11px] font-mono bg-muted/40 p-3 rounded-lg space-y-1">
                        <div>ID: {act.id}</div>
                        <div>User Agent: {act.userAgent}</div>
                        <div>Screen: {act.screenResolution}</div>
                        <div>Metadata: {JSON.stringify(act.metadata)}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS LIST & JOURNEYS */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UsersIcon size={16} />
              <span>All Tracked Shoppers ({userSummaries.length})</span>
            </h3>

            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {userSummaries.map((u) => {
                const isSelected = selectedUserUid === u.uid;
                return (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => setSelectedUserUid(u.uid)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500 shadow-xs"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-blue-600 text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-foreground truncate">
                          {u.displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-foreground">
                          {formatSeconds(u.totalTime)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {u.totalActivities} events
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedUserUid ? (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      User Journey: {userSummaries.find((u) => u.uid === selectedUserUid)?.displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Chronological history of every second spent and card touched by this user.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUserUid(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Close User
                  </button>
                </div>

                <div className="space-y-3">
                  {activities
                    .filter((a) => a.uid === selectedUserUid)
                    .map((act) => {
                      const badge = getActionBadge(act);
                      const BadgeIcon = badge.icon;
                      return (
                        <div
                          key={act.id}
                          className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${badge.color}`}
                            >
                              <BadgeIcon size={10} />
                              <span>{badge.label}</span>
                            </span>
                            <span className="font-mono font-semibold">{act.path}</span>
                            {act.metadata?.productTitle && (
                              <span className="text-blue-600 font-bold">
                                • {String(act.metadata.productTitle)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {act.duration > 0 && (
                              <span className="font-mono font-bold text-emerald-600">
                                ⏱ {act.duration}s
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {format(safeToDate(act.timestamp) || new Date(), "HH:mm:ss")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-xs">
                Select a user on the left to view their complete journey and second-by-second breakdown.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivity;
