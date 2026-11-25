import Image from "next/image";
import Link from "next/link";
import { ProductCarousel } from "@/components/ProductCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { EditorialSection } from "@/components/EditorialSection";
import { HomeHeroBanner } from "@/components/HomeHeroBanner";
import { HomeHolidayBanner } from "@/components/HomeHolidayBanner";
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
      {/* 1. Main Dynamic Hero Campaign Banner */}
      <HomeHeroBanner
        initialHero={{
          title: catalog.hero?.title,
          subtitle: catalog.hero?.subtitle,
          desktop: catalog.hero?.desktop,
          mobile: catalog.hero?.mobile,
          cta: catalog.hero?.cta,
          ctaHref: catalog.hero?.ctaHref,
        }}
      />

      {/* 2. Product Carousel: New Arrivals */}
      <ProductCarousel
        title="NEW ARRIVALS"
        subtitle="JUST DROPPED"
        ctaText="Shop All New"
        ctaHref="/collections/all-new"
        products={newArrivals}
      />

      {/* 3. Secondary Dynamic Banner: Holiday Collection */}
      <HomeHolidayBanner initialBanner={catalog.bannerHoliday as any} />

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
