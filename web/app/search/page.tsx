import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { searchProducts } from "@/lib/catalog";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function SearchResults({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const products = searchProducts(query);

  return (
    <div className="search-page-container">
      <div
        style={{
          fontSize: "1.1rem",
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "#777",
          marginBottom: "2rem",
        }}
      >
        <Link href="/">Home</Link> &nbsp;/&nbsp; <span>Search</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: 600,
            margin: "0 0 1rem",
          }}
        >
          {query ? `Search Results for "${query}"` : "Search Products"}
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Found {products.length} {products.length === 1 ? "product" : "products"}
        </p>

        {/* Search input form */}
        <form
          action="/search"
          method="get"
          style={{
            maxWidth: "500px",
            margin: "2rem auto 0",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="Search our catalog..."
            style={{
              flex: 1,
              padding: "1rem 1.4rem",
              border: "1px solid #ccc",
              fontSize: "1.2rem",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "4rem", textAlign: "center" }}>
          Loading search...
        </div>
      }
    >
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}
