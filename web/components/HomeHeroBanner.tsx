"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type HeroContent, DEFAULT_FRONTEND_HERO } from "@/api/heroService";

export function HomeHeroBanner({ initialHero }: { initialHero?: Partial<HeroContent> }) {
  const [hero, setHero] = useState<HeroContent>({
    ...DEFAULT_FRONTEND_HERO,
    ...initialHero,
  });

  useEffect(() => {
    // Check localStorage cache or fetch latest
    try {
      const cached = localStorage.getItem("lumathreads_hero_settings");
      if (cached) {
        setHero((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch (e) {
      // ignore
    }

    const fetchHero = async () => {
      try {
        const res = await fetch("/api/admin/hero-settings/");
        if (res.ok) {
          const data = await res.json();
          if (data && (data.title || data.desktop)) {
            setHero((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (e) {
        // ignore
      }
    };
    fetchHero();

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setHero((prev) => ({ ...prev, ...detail }));
      }
    };
    window.addEventListener("lumathreads_hero_updated", handleUpdate);
    return () => window.removeEventListener("lumathreads_hero_updated", handleUpdate);
  }, []);

  const desktopSrc = hero.desktop || DEFAULT_FRONTEND_HERO.desktop;
  const mobileSrc = hero.mobile || desktopSrc;
  const overlayOpacity = (hero.overlayOpacity ?? 20) / 100;

  return (
    <section
      className="image-banner"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent:
          hero.alignment === "left"
            ? "flex-start"
            : hero.alignment === "right"
            ? "flex-end"
            : "center",
        overflow: "hidden",
        background: "#111",
      }}
    >
      <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <source media="(max-width: 749px)" srcSet={mobileSrc} />
        <Image
          src={desktopSrc}
          alt={hero.title || "Luma Threads Campaign"}
          fill
          priority
          unoptimized
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </picture>

      {/* Dark tint overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity: overlayOpacity,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: hero.alignment || "center",
          padding: "2rem",
          color: "#fff",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          maxWidth: "850px",
          width: "100%",
        }}
      >
        {hero.badge && (
          <span
            style={{
              display: "inline-block",
              padding: "0.4rem 1.2rem",
              marginBottom: "1.2rem",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              border: "1px solid rgba(255, 255, 255, 0.35)",
            }}
          >
            {hero.badge}
          </span>
        )}

        <p
          style={{
            fontSize: "1.3rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: 600,
            margin: "0 0 1rem",
          }}
        >
          {hero.subtitle || "EVERYDAY UTILITY. ELEVATED EASE."}
        </p>

        <h1
          style={{
            fontSize: "clamp(3rem, 6vw, 5.5rem)",
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontWeight: 700,
            margin: "0 0 2rem",
            lineHeight: 1.1,
          }}
        >
          {hero.title || "WINTER 2026"}
        </h1>

        <div
          style={{
            display: "flex",
            gap: "1.2rem",
            flexWrap: "wrap",
            justifyContent:
              hero.alignment === "left"
                ? "flex-start"
                : hero.alignment === "right"
                ? "flex-end"
                : "center",
          }}
        >
          <Link
            href={hero.ctaHref || "/collections/all-new"}
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#000",
              padding: "1.2rem 2.8rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
            }}
          >
            {hero.cta || "EXPLORE THE CAMPAIGN"}
          </Link>

          {hero.secondaryCta && (
            <Link
              href={hero.secondaryCtaHref || "/collections/best-sellers"}
              style={{
                display: "inline-block",
                background: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                padding: "1.2rem 2.8rem",
                fontSize: "1.2rem",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              {hero.secondaryCta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
