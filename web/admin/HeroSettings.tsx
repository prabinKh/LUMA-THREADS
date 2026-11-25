import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  Upload,
  Loader2,
  Sparkles,
  Eye,
  Smartphone,
  Monitor,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import { heroService, type HeroContent, DEFAULT_FRONTEND_HERO } from "@/api/heroService";
import { uploadService } from "@/api/uploadService";

const CAMPAIGN_PRESETS: { name: string; content: HeroContent }[] = [
  {
    name: "Winter 2026 Raw Denim Campaign",
    content: {
      subtitle: "EVERYDAY UTILITY. ELEVATED EASE.",
      title: "WINTER 2026",
      desktop: "https://pistoladenim.com/cdn/shop/files/desktop_banner_winter24_2.jpg?v=1730999554&width=3840",
      mobile: "https://pistoladenim.com/cdn/shop/files/mobile_banner_winter24_2.jpg?v=1730999554&width=1500",
      cta: "EXPLORE THE CAMPAIGN",
      ctaHref: "/collections/all-new",
      secondaryCta: "SHOP BEST SELLERS",
      secondaryCtaHref: "/collections/best-sellers",
      badge: "NEW ARRIVAL • ARTISANAL DENIM",
      overlayOpacity: 25,
      alignment: "center",
      bannerHoliday: {
        enabled: true,
        title: "HOLIDAY 2026",
        subtitle: "CURATED CAPSULE COLLECTION",
        image: "https://pistoladenim.com/cdn/shop/files/desktop_holiday_banner.jpg?v=1730999554&width=3840",
        cta: "SHOP THE DROP",
        ctaHref: "/collections/all-denim",
      },
    },
  },
  {
    name: "Spring Tailored Denim Drop",
    content: {
      subtitle: "TIMELESS SILHOUETTES. MODERN FINISHES.",
      title: "SPRING 2026",
      desktop: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=2400&q=85",
      mobile: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85",
      cta: "SHOP NEW ARRIVALS",
      ctaHref: "/collections/all-new",
      secondaryCta: "DENIM FIT GUIDE",
      secondaryCtaHref: "/collections/all-denim",
      badge: "LIMITED EDITION • 14.5OZ SELVEDGE",
      overlayOpacity: 30,
      alignment: "center",
      bannerHoliday: {
        enabled: true,
        title: "SPRING CAPSULE",
        subtitle: "EXCLUSIVE WASH ARCHIVE",
        image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=2400&q=85",
        cta: "EXPLORE LOOKBOOK",
        ctaHref: "/collections/all-denim",
      },
    },
  },
  {
    name: "Atelier Studio Minimalist",
    content: {
      subtitle: "JAPANESE KURABO WEAVE. ZERO WATER WASH.",
      title: "ATELIER EDIT",
      desktop: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=2400&q=85",
      mobile: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=85",
      cta: "DISCOVER THE EDIT",
      ctaHref: "/collections/all-new",
      secondaryCta: "EXPLORE ALL",
      secondaryCtaHref: "/collections/all-denim",
      badge: "HERITAGE ARCHIVE",
      overlayOpacity: 35,
      alignment: "center",
      bannerHoliday: {
        enabled: false,
        title: "CORE BASICS",
        subtitle: "ESSENTIAL DENIM WARDROBE",
        image: "",
        cta: "SHOP BASICS",
        ctaHref: "/collections/all-denim",
      },
    },
  },
];

export const HeroSettings = () => {
  const [content, setContent] = useState<HeroContent>(DEFAULT_FRONTEND_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await heroService.getSettings();
        if (data) {
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to load hero settings:", error);
        toast.error("Failed to load hero settings");
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await heroService.updateSettings(content);
      toast.success("Hero settings saved and applied to live frontend!");
    } catch (error) {
      console.error("Failed to update hero settings:", error);
      toast.error("Failed to save hero settings to server.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "desktop" | "mobile" | "secondary"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "desktop") setUploadingDesktop(true);
    if (field === "mobile") setUploadingMobile(true);
    if (field === "secondary") setUploadingSecondary(true);

    try {
      const url = await uploadService.uploadImage(file, "hero");
      if (field === "desktop") {
        setContent((prev) => ({ ...prev, desktop: url }));
      } else if (field === "mobile") {
        setContent((prev) => ({ ...prev, mobile: url }));
      } else {
        setContent((prev) => ({
          ...prev,
          bannerHoliday: {
            ...(prev.bannerHoliday || {
              enabled: true,
              title: "HOLIDAY 2026",
              subtitle: "CURATED CAPSULE",
              image: "",
              cta: "SHOP THE DROP",
              ctaHref: "/collections/all-denim",
            }),
            image: url,
          },
        }));
      }
      toast.success("Hero image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try entering a direct image URL.");
    } finally {
      if (field === "desktop") setUploadingDesktop(false);
      if (field === "mobile") setUploadingMobile(false);
      if (field === "secondary") setUploadingSecondary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPreviewImage =
    previewDevice === "mobile" ? content.mobile || content.desktop : content.desktop;

  return (
    <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-screen max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
              Frontend Match
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Hero & Campaign Banner Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure the main homepage campaign banner and secondary drop banner exactly as displayed on the live store.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Live Site</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-foreground text-background hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Publishing..." : "Publish to Live"}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            Quick Campaign Presets
          </span>
          <button
            type="button"
            onClick={() => {
              setContent(DEFAULT_FRONTEND_HERO);
              toast.info("Reset to default Winter 2026 campaign.");
            }}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Reset to Default</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CAMPAIGN_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setContent(p.content);
                toast.success(`Loaded preset: ${p.name}`);
              }}
              className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-all hover:scale-[1.02] cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Settings on Left, Live Frontend Preview on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Section 1: Main Hero Banner */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <span className="w-2.5 h-6 bg-blue-600 rounded-sm" />
              <h2 className="text-base font-bold text-foreground">1. Main Campaign Hero Banner</h2>
            </div>

            {/* Campaign Headline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Campaign Headline (Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. WINTER 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Rendered as the prominent clamp(3rem, 6vw, 5.5rem) uppercase title on the homepage.
              </p>
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Campaign Subtitle
              </label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="e.g. EVERYDAY UTILITY. ELEVATED EASE."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium"
              />
            </div>

            {/* Campaign Badge / Pill */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Badge / Tag Pill (Optional)
              </label>
              <input
                type="text"
                value={content.badge || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, badge: e.target.value }))}
                placeholder="e.g. NEW ARRIVAL • ARTISANAL DENIM"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium"
              />
            </div>

            {/* Desktop Image Banner */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Monitor size={13} />
                  <span>Desktop Campaign Image URL</span>
                </label>
                <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  <Upload size={12} />
                  <span>{uploadingDesktop ? "Uploading..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "desktop")}
                    disabled={uploadingDesktop}
                  />
                </label>
              </div>
              <input
                type="text"
                value={content.desktop}
                onChange={(e) => setContent((prev) => ({ ...prev, desktop: e.target.value }))}
                placeholder="https://pistoladenim.com/cdn/shop/files/desktop_banner_winter24_2.jpg..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>

            {/* Mobile Image Banner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Smartphone size={13} />
                  <span>Mobile Campaign Image URL (&lt; 750px)</span>
                </label>
                <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  <Upload size={12} />
                  <span>{uploadingMobile ? "Uploading..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "mobile")}
                    disabled={uploadingMobile}
                  />
                </label>
              </div>
              <input
                type="text"
                value={content.mobile}
                onChange={(e) => setContent((prev) => ({ ...prev, mobile: e.target.value }))}
                placeholder="https://pistoladenim.com/cdn/shop/files/mobile_banner_winter24_2.jpg..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>

            {/* Call to Actions (Buttons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={content.cta}
                  onChange={(e) => setContent((prev) => ({ ...prev, cta: e.target.value }))}
                  placeholder="EXPLORE THE CAMPAIGN"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Button Link URL
                </label>
                <input
                  type="text"
                  value={content.ctaHref}
                  onChange={(e) => setContent((prev) => ({ ...prev, ctaHref: e.target.value }))}
                  placeholder="/collections/all-new"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Secondary Button Text (Optional)
                </label>
                <input
                  type="text"
                  value={content.secondaryCta || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, secondaryCta: e.target.value }))}
                  placeholder="SHOP BEST SELLERS"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Secondary Button Link URL
                </label>
                <input
                  type="text"
                  value={content.secondaryCtaHref || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, secondaryCtaHref: e.target.value }))}
                  placeholder="/collections/best-sellers"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-mono"
                />
              </div>
            </div>

            {/* Overlay & Text Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Dark Overlay Opacity
                  </label>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {content.overlayOpacity ?? 20}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={content.overlayOpacity ?? 20}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, overlayOpacity: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setContent((prev) => ({ ...prev, alignment: align }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        (content.alignment || "center") === align
                          ? "bg-foreground text-background border-foreground font-black"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Secondary Holiday / Capsule Drop Banner */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-purple-600 rounded-sm" />
                <h2 className="text-base font-bold text-foreground">
                  2. Secondary Holiday / Capsule Drop Banner
                </h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.bannerHoliday?.enabled ?? true}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      bannerHoliday: {
                        ...(prev.bannerHoliday || {
                          enabled: true,
                          title: "HOLIDAY 2026",
                          subtitle: "CURATED CAPSULE",
                          image: "",
                          cta: "SHOP THE DROP",
                          ctaHref: "/collections/all-denim",
                        }),
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-2 text-xs font-bold text-foreground">
                  {content.bannerHoliday?.enabled ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            {content.bannerHoliday?.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Secondary Banner Title
                    </label>
                    <input
                      type="text"
                      value={content.bannerHoliday?.title || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          bannerHoliday: {
                            ...(prev.bannerHoliday as any),
                            title: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g. HOLIDAY 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Secondary Banner Subtitle
                    </label>
                    <input
                      type="text"
                      value={content.bannerHoliday?.subtitle || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          bannerHoliday: {
                            ...(prev.bannerHoliday as any),
                            subtitle: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g. CURATED CAPSULE COLLECTION"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Secondary Banner Image URL
                    </label>
                    <label className="text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1">
                      <Upload size={12} />
                      <span>{uploadingSecondary ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "secondary")}
                        disabled={uploadingSecondary}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={content.bannerHoliday?.image || ""}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        bannerHoliday: {
                          ...(prev.bannerHoliday as any),
                          image: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://pistoladenim.com/cdn/shop/files/desktop_holiday_banner.jpg..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      value={content.bannerHoliday?.cta || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          bannerHoliday: {
                            ...(prev.bannerHoliday as any),
                            cta: e.target.value,
                          },
                        }))
                      }
                      placeholder="SHOP THE DROP"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Button CTA Link
                    </label>
                    <input
                      type="text"
                      value={content.bannerHoliday?.ctaHref || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          bannerHoliday: {
                            ...(prev.bannerHoliday as any),
                            ctaHref: e.target.value,
                          },
                        }))
                      }
                      placeholder="/collections/all-denim"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Frontend Preview (5 cols) */}
        <div className="xl:col-span-5 sticky top-6 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye size={14} className="text-blue-600" />
                Live Frontend Hero Preview
              </span>

              {/* Device Toggle */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    previewDevice === "desktop"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop View"
                >
                  <Monitor size={14} />
                  <span className="text-[10px] hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    previewDevice === "mobile"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone size={14} />
                  <span className="text-[10px] hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Viewport Frame */}
            <div className="pt-4 flex justify-center">
              <div
                className={`relative overflow-hidden rounded-xl border border-border shadow-lg transition-all duration-300 ${
                  previewDevice === "mobile" ? "w-[320px] min-h-[480px]" : "w-full min-h-[400px]"
                }`}
                style={{
                  background: "#111",
                }}
              >
                {/* Background Image */}
                {currentPreviewImage ? (
                  <img
                    src={currentPreviewImage}
                    alt={content.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-muted-foreground text-xs">
                    No image configured
                  </div>
                )}

                {/* Dark Overlay */}
                <div
                  className="absolute inset-0 transition-opacity"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 1)",
                    opacity: (content.overlayOpacity ?? 20) / 100,
                  }}
                />

                {/* Content Overlay */}
                <div
                  className="relative z-10 w-full h-full min-h-[400px] flex flex-col justify-center p-6 text-white"
                  style={{
                    alignItems:
                      content.alignment === "left"
                        ? "flex-start"
                        : content.alignment === "right"
                        ? "flex-end"
                        : "center",
                    textAlign: content.alignment || "center",
                  }}
                >
                  {/* Badge */}
                  {content.badge && (
                    <span className="inline-block px-3 py-1 mb-3 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-widest text-white border border-white/30">
                      {content.badge}
                    </span>
                  )}

                  {/* Subtitle */}
                  {content.subtitle && (
                    <p className="text-xs sm:text-sm font-semibold uppercase tracking-[3px] mb-2 opacity-90 drop-shadow">
                      {content.subtitle}
                    </p>
                  )}

                  {/* Title */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-[4px] leading-tight mb-5 drop-shadow-md">
                    {content.title || "CAMPAIGN TITLE"}
                  </h1>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {content.cta && (
                      <span className="inline-block px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider shadow-md hover:bg-neutral-100 transition-colors">
                        {content.cta}
                      </span>
                    )}

                    {content.secondaryCta && (
                      <span className="inline-block px-5 py-2.5 bg-black/60 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider border border-white/40 shadow-md">
                        {content.secondaryCta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Banner Preview if active */}
            {content.bannerHoliday?.enabled && content.bannerHoliday.image && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Secondary Drop Banner Preview:
                </span>
                <div className="relative rounded-xl overflow-hidden h-32 flex items-center justify-center text-center p-4 text-white">
                  <img
                    src={content.bannerHoliday.image}
                    alt={content.bannerHoliday.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-widest opacity-90 font-bold">
                      {content.bannerHoliday.subtitle}
                    </p>
                    <h2 className="text-lg font-black uppercase tracking-wider">
                      {content.bannerHoliday.title}
                    </h2>
                    <span className="inline-block mt-1 px-3 py-1 bg-white text-black text-[10px] font-bold uppercase">
                      {content.bannerHoliday.cta}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroSettings;
