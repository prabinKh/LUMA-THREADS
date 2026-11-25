"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type BannerHoliday, DEFAULT_FRONTEND_HERO } from "@/api/heroService";

export function HomeHolidayBanner({ initialBanner }: { initialBanner?: BannerHoliday | null }) {
  const [banner, setBanner] = useState<BannerHoliday | null>(
    initialBanner ?? (DEFAULT_FRONTEND_HERO.bannerHoliday || null)
  );

  useEffect(() => {
    try {
      const cached = localStorage.getItem("lumathreads_hero_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.bannerHoliday) {
          setBanner(parsed.bannerHoliday);
        }
      }
    } catch (e) {
      // ignore
    }

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.bannerHoliday) {
        setBanner(detail.bannerHoliday);
      }
    };
    window.addEventListener("lumathreads_hero_updated", handleUpdate);
    return () => window.removeEventListener("lumathreads_hero_updated", handleUpdate);
  }, []);

  if (!banner || banner.enabled === false || !banner.image) {
    return null;
  }

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "60vh",
        minHeight: "450px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        margin: "2rem 0",
      }}
    >
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        unoptimized
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "#fff",
          padding: "2rem",
        }}
      >
        <p
          style={{
            fontSize: "1.2rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 0.8rem",
          }}
        >
          {banner.subtitle}
        </p>
        <h2
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "3px",
            textTransform: "uppercase",
            margin: "0 0 2rem",
          }}
        >
          {banner.title}
        </h2>
        <Link
          href={banner.ctaHref || "/collections/all-denim"}
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#000",
            padding: "1rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          {banner.cta || "SHOP THE DROP"}
        </Link>
      </div>
    </section>
  );
}
