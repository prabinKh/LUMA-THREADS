import Image from "next/image";
import Link from "next/link";
import { ProductCarousel } from "@/components/ProductCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { EditorialSection } from "@/components/EditorialSection";
import {
  getCatalog,
  getHomeProducts,
  getHomeProductsAsync,
  getEditorialProducts,
} from "@/lib/catalog";

export default async function HomePage() {
  const catalog = getCatalog();
  const newArrivals = await getHomeProductsAsync();
  const editorialProducts = getEditorialProducts();

  return (
    <>
      {/* 1. Main Hero Image Banner */}
      <section className="image-banner" style={{ position: "relative", width: "100%", minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f0f0f0" }}>
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <source media="(max-width: 749px)" srcSet={catalog.hero.mobile} />
          <Image
            src={catalog.hero.desktop}
            alt="Pistola Denim Campaign"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </picture>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "2rem",
            color: "#fff",
            textShadow: "0 2px 10px rgba(0,0,0,0.4)",
            maxWidth: "800px",
          }}
        >
          <p
            style={{
              fontSize: "1.3rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              margin: "0 0 1rem",
            }}
          >
            {catalog.hero.subtitle || "EVERYDAY UTILITY. ELEVATED EASE."}
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
            {catalog.hero.title || "WINTER 2026"}
          </h1>
          <Link
            href={catalog.hero.ctaHref}
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
            {catalog.hero.cta}
          </Link>
        </div>
      </section>

      {/* 2. Product Carousel: New Arrivals */}
      <ProductCarousel
        title="NEW ARRIVALS"
        subtitle="JUST DROPPED"
        ctaText="Shop All New"
        ctaHref="/collections/all-new"
        products={newArrivals}
      />

      {/* 3. Secondary Banner: Holiday Collection */}
      {catalog.bannerHoliday && (
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
            src={catalog.bannerHoliday.image}
            alt={catalog.bannerHoliday.title}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
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
              {catalog.bannerHoliday.subtitle}
            </p>
            <h2
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                letterSpacing: "3px",
                textTransform: "uppercase",
                margin: "0 0 2rem",
                fontWeight: 600,
              }}
            >
              {catalog.bannerHoliday.title}
            </h2>
            <Link
              href={catalog.bannerHoliday.ctaHref}
              style={{
                display: "inline-block",
                background: "#000",
                color: "#fff",
                border: "1px solid #fff",
                padding: "1.2rem 2.8rem",
                fontSize: "1.2rem",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {catalog.bannerHoliday.cta}
            </Link>
          </div>
        </section>
      )}

      {/* 4. Shop By Category Grid */}
      <CategoryGrid categories={catalog.categories} />

      {/* 5. Pistola Icons Banner */}
      {catalog.bannerIcons && (
        <section
          style={{
            position: "relative",
            width: "100%",
            height: "55vh",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            margin: "3rem 0",
          }}
        >
          <Image
            src={catalog.bannerIcons.image}
            alt={catalog.bannerIcons.title}
            fill
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
              {catalog.bannerIcons.subtitle}
            </p>
            <h2
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
                letterSpacing: "3px",
                textTransform: "uppercase",
                margin: "0 0 2rem",
                fontWeight: 600,
              }}
            >
              {catalog.bannerIcons.title}
            </h2>
            <Link
              href={catalog.bannerIcons.ctaHref}
              style={{
                display: "inline-block",
                background: "#fff",
                color: "#000",
                padding: "1.2rem 2.8rem",
                fontSize: "1.2rem",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {catalog.bannerIcons.cta}
            </Link>
          </div>
        </section>
      )}

      {/* 6. Rich Text Manifesto */}
      {catalog.manifesto && (
        <section
          style={{
            maxWidth: "900px",
            margin: "5rem auto",
            padding: "0 2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#666",
              margin: "0 0 1rem",
            }}
          >
            ABOUT LUMA THREADS
          </p>
          <h2
            style={{
              fontSize: "2.8rem",
              letterSpacing: "2.5px",
              fontWeight: 600,
              textTransform: "uppercase",
              margin: "0 0 1.8rem",
              lineHeight: 1.2,
            }}
          >
            {catalog.manifesto.heading}
          </h2>
          <p
            style={{
              fontSize: "1.4rem",
              lineHeight: 1.8,
              color: "#444",
              letterSpacing: "0.5px",
              margin: "0 0 2.5rem",
            }}
          >
            {catalog.manifesto.body}
          </p>
          <Link
            href="/pages/about-us"
            style={{
              fontSize: "1.2rem",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Read Our Story →
          </Link>
        </section>
      )}

      {/* 7. Editorial Split Section: The Accessories Edit */}
      {catalog.editorial && (
        <EditorialSection
          image={catalog.editorial.image}
          title={catalog.editorial.title}
          products={editorialProducts}
        />
      )}
    </>
  );
}
