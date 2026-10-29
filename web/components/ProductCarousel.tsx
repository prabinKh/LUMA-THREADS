"use client";

import { useRef } from "react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function ProductCarousel({
  title,
  subtitle,
  ctaText,
  ctaHref,
  products,
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      const scrollAmount = 340 * 2;
      trackRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="carousel-section" style={{ padding: "3rem 1.5rem 4rem", width: "100%", boxSizing: "border-box" }}>
      <div
        style={{
          width: "100%",
          margin: "0 auto 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          {subtitle && (
            <p
              style={{
                fontSize: "1.1rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#666",
                margin: "0 0 0.4rem",
              }}
            >
              {subtitle}
            </p>
          )}
          <h2
            style={{
              fontSize: "2rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: 0,
              fontWeight: 600,
            }}
          >
            {title}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {ctaText && ctaHref && (
            <Link
              href={ctaHref}
              style={{
                fontSize: "1.2rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              {ctaText}
            </Link>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => scroll("left")}
              aria-label="Previous products"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
              }}
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next products"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="carousel-wrapper" style={{ width: "100%", maxWidth: "100%", padding: 0 }}>
        <div ref={trackRef} className="carousel-track">
          {products.map((product) => (
            <div key={product.handle} className="carousel-slide">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
