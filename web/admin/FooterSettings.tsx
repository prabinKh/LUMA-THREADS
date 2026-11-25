import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  RotateCcw,
  Eye,
  Mail,
  Headphones,
  Share2,
  CreditCard,
  ListTree,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  footerService,
  type FooterSettingsData,
  type FooterColumn,
  type FooterLink,
  DEFAULT_FRONTEND_FOOTER,
} from "@/api/footerService";

const AVAILABLE_PAYMENT_METHODS = [
  "VISA",
  "MC",
  "AMEX",
  "DISC",
  "APPLE PAY",
  "GOOGLE PAY",
  "PAYPAL",
  "KLARNA",
  "AFTERPAY",
  "SHOP PAY",
  "ESEWA",
  "KHALTI",
];

export const FooterSettings = () => {
  const [settings, setSettings] = useState<FooterSettingsData>(DEFAULT_FRONTEND_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"newsletter" | "support" | "social" | "columns" | "bottom">("columns");
  const [customBadgeInput, setCustomBadgeInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await footerService.getSettings();
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error);
        toast.error("Failed to load footer settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await footerService.updateSettings(settings);
      toast.success("Footer settings saved & applied to frontend!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save footer settings to server.");
    } finally {
      setSaving(false);
    }
  };

  // COLUMN & LINK CRUD
  const handleAddLink = (colIdx: number) => {
    setSettings((prev) => {
      const nextCols = [...prev.columns];
      nextCols[colIdx] = {
        ...nextCols[colIdx],
        links: [...nextCols[colIdx].links, { label: "New Link", url: "/collections/all-denim" }],
      };
      return { ...prev, columns: nextCols };
    });
  };

  const handleUpdateLink = (colIdx: number, linkIdx: number, field: keyof FooterLink, val: string) => {
    setSettings((prev) => {
      const nextCols = [...prev.columns];
      const nextLinks = [...nextCols[colIdx].links];
      nextLinks[linkIdx] = { ...nextLinks[linkIdx], [field]: val };
      nextCols[colIdx] = { ...nextCols[colIdx], links: nextLinks };
      return { ...prev, columns: nextCols };
    });
  };

  const handleDeleteLink = (colIdx: number, linkIdx: number) => {
    setSettings((prev) => {
      const nextCols = [...prev.columns];
      nextCols[colIdx] = {
        ...nextCols[colIdx],
        links: nextCols[colIdx].links.filter((_, i) => i !== linkIdx),
      };
      return { ...prev, columns: nextCols };
    });
  };

  const handleUpdateColumnTitle = (colIdx: number, title: string) => {
    setSettings((prev) => {
      const nextCols = [...prev.columns];
      nextCols[colIdx] = { ...nextCols[colIdx], title };
      return { ...prev, columns: nextCols };
    });
  };

  const handleToggleColumn = (colIdx: number) => {
    setSettings((prev) => {
      const nextCols = [...prev.columns];
      nextCols[colIdx] = { ...nextCols[colIdx], enabled: !nextCols[colIdx].enabled };
      return { ...prev, columns: nextCols };
    });
  };

  const handleTogglePaymentBadge = (badge: string) => {
    setSettings((prev) => {
      const exists = prev.bottomBar.paymentBadges.includes(badge);
      const nextBadges = exists
        ? prev.bottomBar.paymentBadges.filter((b) => b !== badge)
        : [...prev.bottomBar.paymentBadges, badge];
      return {
        ...prev,
        bottomBar: {
          ...prev.bottomBar,
          paymentBadges: nextBadges,
        },
      };
    });
  };

  const handleAddCustomBadge = () => {
    const trimmed = customBadgeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!settings.bottomBar.paymentBadges.includes(trimmed)) {
      setSettings((prev) => ({
        ...prev,
        bottomBar: {
          ...prev.bottomBar,
          paymentBadges: [...prev.bottomBar.paymentBadges, trimmed],
        },
      }));
    }
    setCustomBadgeInput("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-screen max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Frontend Connected
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Footer Navigation & Content Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Customize the 4 columns, newsletter banner, support hours, social channels, and payment methods exactly matching the store frontend.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setSettings(DEFAULT_FRONTEND_FOOTER);
              toast.info("Restored default frontend footer settings.");
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">View Store</span>
          </a>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-foreground text-background hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Saving..." : "Save Footer"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        {[
          { id: "columns", label: "Navigation Columns (Shop, About, Help)", icon: ListTree },
          { id: "newsletter", label: "Stay in the Know (Newsletter)", icon: Mail },
          { id: "support", label: "Customer Support & Hours", icon: Headphones },
          { id: "social", label: "Social Media Links", icon: Share2 },
          { id: "bottom", label: "Copyright & Payment Badges", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
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

      {/* Main Content Areas */}
      <div className="space-y-6">
        {/* TAB 1: NAVIGATION COLUMNS */}
        {activeTab === "columns" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings.columns.map((col, colIdx) => (
                <div
                  key={col.id || colIdx}
                  className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-5 bg-blue-600 rounded-sm" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Column #{colIdx + 1}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={col.enabled}
                        onChange={() => handleToggleColumn(colIdx)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-1.5 text-[11px] font-bold text-foreground">
                        {col.enabled ? "Visible" : "Hidden"}
                      </span>
                    </label>
                  </div>

                  {/* Column Title Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Column Heading Title
                    </label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => handleUpdateColumnTitle(colIdx, e.target.value)}
                      placeholder="e.g. SHOP, ABOUT, HELP"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Links List */}
                  <div className="space-y-2.5 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Navigation Links ({col.links.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddLink(colIdx)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Link</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {col.links.map((link, linkIdx) => (
                        <div
                          key={linkIdx}
                          className="p-2.5 bg-muted/40 border border-border rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) =>
                                handleUpdateLink(colIdx, linkIdx, "label", e.target.value)
                              }
                              placeholder="Label (e.g. All Denim)"
                              className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(colIdx, linkIdx)}
                              className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete Link"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) =>
                              handleUpdateLink(colIdx, linkIdx, "url", e.target.value)
                            }
                            placeholder="URL (e.g. /collections/all-denim)"
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-[11px] font-mono outline-none text-muted-foreground focus:text-foreground"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: NEWSLETTER */}
        {activeTab === "newsletter" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-amber-500 rounded-sm" />
                <h2 className="text-base font-bold text-foreground">Stay In The Know (Newsletter Block)</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, enabled: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-2 text-xs font-bold text-foreground">
                  {settings.newsletter.enabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Newsletter Title
                </label>
                <input
                  type="text"
                  value={settings.newsletter.title}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, title: e.target.value },
                    }))
                  }
                  placeholder="STAY IN THE KNOW"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={settings.newsletter.placeholder}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, placeholder: e.target.value },
                    }))
                  }
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Submit Button Label
                </label>
                <input
                  type="text"
                  value={settings.newsletter.buttonText}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, buttonText: e.target.value },
                    }))
                  }
                  placeholder="→"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Success Message (Alert)
                </label>
                <input
                  type="text"
                  value={settings.newsletter.successMessage}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      newsletter: { ...prev.newsletter, successMessage: e.target.value },
                    }))
                  }
                  placeholder="Thank you for subscribing to Luma Threads!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER SUPPORT & HOURS */}
        {activeTab === "support" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-emerald-500 rounded-sm" />
                <h2 className="text-base font-bold text-foreground">Customer Support Details & Hours</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customerSupport.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      customerSupport: { ...prev.customerSupport, enabled: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-2 text-xs font-bold text-foreground">
                  {settings.customerSupport.enabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={settings.customerSupport.heading}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      customerSupport: { ...prev.customerSupport, heading: e.target.value },
                    }))
                  }
                  placeholder="CUSTOMER SUPPORT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.customerSupport.email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      customerSupport: { ...prev.customerSupport, email: e.target.value },
                    }))
                  }
                  placeholder="customerservice@lumathreads.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hours of Operation
                </label>
                <input
                  type="text"
                  value={settings.customerSupport.hours}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      customerSupport: { ...prev.customerSupport, hours: e.target.value },
                    }))
                  }
                  placeholder="Monday – Friday 8AM – 5PM PST"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={settings.customerSupport.phone || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      customerSupport: { ...prev.customerSupport, phone: e.target.value },
                    }))
                  }
                  placeholder="+1 (800) 586-2847"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL MEDIA LINKS */}
        {activeTab === "social" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-pink-500 rounded-sm" />
                <h2 className="text-base font-bold text-foreground">Social Media Channels</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.social.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      social: { ...prev.social, enabled: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                <span className="ml-2 text-xs font-bold text-foreground">
                  {settings.social.enabled ? "Visible" : "Hidden"}
                </span>
              </label>
            </div>

            <div className="space-y-3">
              {[
                { key: "facebook", label: "Facebook URL", placeholder: "https://www.facebook.com/..." },
                { key: "instagram", label: "Instagram URL", placeholder: "https://www.instagram.com/..." },
                { key: "twitter", label: "Twitter / X URL", placeholder: "https://twitter.com/..." },
                { key: "pinterest", label: "Pinterest URL", placeholder: "https://www.pinterest.com/..." },
                { key: "tiktok", label: "TikTok URL", placeholder: "https://www.tiktok.com/@..." },
                { key: "youtube", label: "YouTube URL", placeholder: "https://www.youtube.com/..." },
              ].map((s) => (
                <div key={s.key} className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </label>
                  <input
                    type="text"
                    value={(settings.social as any)[s.key] || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social: { ...prev.social, [s.key]: e.target.value },
                      }))
                    }
                    placeholder={s.placeholder}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BOTTOM BAR & PAYMENT BADGES */}
        {activeTab === "bottom" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Copyright Notice & Payment Badges</h2>
            </div>

            {/* Copyright */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Copyright Notice Text
              </label>
              <input
                type="text"
                value={settings.bottomBar.copyright}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    bottomBar: { ...prev.bottomBar, copyright: e.target.value },
                  }))
                }
                placeholder="© 2026, Luma Threads. All rights reserved."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium"
              />
            </div>

            {/* Payment Badges Selector */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Supported Payment Method Badges
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Click to toggle payment icons shown in the footer bottom bar.
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bottomBar.showPaymentBadges}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        bottomBar: { ...prev.bottomBar, showPaymentBadges: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-xs font-bold text-foreground">
                    {settings.bottomBar.showPaymentBadges ? "Shown" : "Hidden"}
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_PAYMENT_METHODS.map((badge) => {
                  const isSelected = settings.bottomBar.paymentBadges.includes(badge);
                  return (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => handleTogglePaymentBadge(badge)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-foreground text-background border-foreground font-black shadow-xs"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                      <span>{badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Badge Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customBadgeInput}
                  onChange={(e) => setCustomBadgeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomBadge();
                    }
                  }}
                  placeholder="Add custom payment provider (e.g. VENMO, BITCOIN)..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-background text-xs uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddCustomBadge}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  + Add Badge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE FRONTEND FOOTER PREVIEW */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Eye size={15} className="text-emerald-500" />
              Live Frontend Footer Preview
            </span>
            <span className="text-[11px] text-muted-foreground">
              Renders with frontend Shopify-standard typography and column layout
            </span>
          </div>

          {/* Mimic Frontend Footer Container */}
          <div className="bg-neutral-900 text-white p-6 sm:p-10 rounded-2xl border border-neutral-800 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Column 1: Newsletter & Support */}
              <div className="space-y-6">
                {settings.newsletter.enabled && (
                  <div>
                    <p className="text-xs font-bold tracking-[2px] uppercase text-neutral-300 mb-3">
                      {settings.newsletter.title}
                    </p>
                    <div className="flex max-w-xs border-b border-neutral-500 pb-1">
                      <input
                        type="email"
                        disabled
                        placeholder={settings.newsletter.placeholder}
                        className="bg-transparent text-xs text-white placeholder-neutral-500 outline-none flex-1"
                      />
                      <span className="text-neutral-400 font-bold">
                        {settings.newsletter.buttonText}
                      </span>
                    </div>
                  </div>
                )}

                {settings.customerSupport.enabled && (
                  <div className="text-xs text-neutral-400 space-y-1 leading-relaxed">
                    <p className="font-bold text-white tracking-wider">
                      {settings.customerSupport.heading}
                    </p>
                    <p>
                      Email: <span className="text-white underline">{settings.customerSupport.email}</span>
                    </p>
                    <p>Hours: {settings.customerSupport.hours}</p>
                    {settings.customerSupport.phone && <p>Tel: {settings.customerSupport.phone}</p>}
                  </div>
                )}

                {settings.social.enabled && (
                  <div className="flex gap-3 text-neutral-400 text-xs">
                    {settings.social.facebook && <span>Facebook</span>}
                    {settings.social.instagram && <span>Instagram</span>}
                    {settings.social.twitter && <span>Twitter</span>}
                    {settings.social.pinterest && <span>Pinterest</span>}
                  </div>
                )}
              </div>

              {/* Navigation Columns (Col 2, 3, 4) */}
              {settings.columns.map((col, idx) => {
                if (!col.enabled) return null;
                return (
                  <div key={idx} className="space-y-3">
                    <p className="text-xs font-bold tracking-[2px] uppercase text-neutral-200">
                      {col.title}
                    </p>
                    <ul className="space-y-2 text-xs text-neutral-400">
                      {col.links.map((link, lIdx) => (
                        <li key={lIdx} className="hover:text-white transition-colors">
                          {link.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Bottom Bar Preview */}
            <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
              <small>{settings.bottomBar.copyright}</small>
              {settings.bottomBar.showPaymentBadges && (
                <div className="flex flex-wrap gap-2">
                  {settings.bottomBar.paymentBadges.map((badge) => (
                    <span
                      key={badge}
                      className="px-2 py-0.5 border border-neutral-700 rounded text-[10px] text-neutral-400"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FooterSettings;
