import { notFound } from "next/navigation";
import Link from "next/link";
import { CollectionClientView } from "@/components/CollectionClientView";
import {
  COLLECTION_ALIASES,
  getCatalog,
  getCollection,
  getCollectionProducts,
  getCollectionProductsAsync,
} from "@/lib/catalog";

type PageProps = {
  params: Promise<{ handle: string }>;
};

export function generateStaticParams() {
  const catalog = getCatalog();
  const handles = [
    ...Object.keys(catalog.collections),
    ...Object.keys(COLLECTION_ALIASES),
  ];
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const collection = getCollection(handle);
  return {
    title: collection?.title ?? "Collection",
    description: collection?.description ?? "Pistola Denim collection.",
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const collection = getCollection(handle);
  if (!collection) notFound();

  const products = await getCollectionProductsAsync(handle);

  return (
    <div className="collection-page-container">
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "1.1rem",
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "#777",
          marginBottom: "1.5rem",
        }}
      >
        <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
        <span>{collection.title}</span>
      </div>

      {/* Collection Hero Header */}
      <div
        style={{
          textAlign: "center",
          margin: "1rem auto 2.5rem",
          maxWidth: "800px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: 600,
            margin: "0 0 1rem",
          }}
        >
          {collection.title}
        </h1>
        {collection.description && (
          <p
            style={{
              fontSize: "1.3rem",
              lineHeight: 1.6,
              color: "#555",
              margin: 0,
            }}
          >
            {collection.description}
          </p>
        )}
      </div>

      {/* Filter and Product Grid spanning full width */}
      <CollectionClientView initialProducts={products} />

      {/* Bottom Collection SEO Notes */}
      <div
        style={{
          marginTop: "6rem",
          paddingTop: "4rem",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          maxWidth: "900px",
          margin: "6rem auto 0",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: "1.6rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          ABOUT OUR {collection.title.toUpperCase()}
        </h3>
        <p style={{ fontSize: "1.3rem", lineHeight: 1.7, color: "#666" }}>
          Crafted with premium cotton and comfort stretch blends, our denim and
          apparel are designed to wear in, not wear out. Designed in Downtown Los
          Angeles with elevated utilitarian details that redefine everyday staples.
        </p>
      </div>
    </div>
  );
}
