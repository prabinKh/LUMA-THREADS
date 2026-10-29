import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function EditorialSection({
  image,
  title,
  products,
}: {
  image: string;
  title: string;
  products: Product[];
}) {
  return (
    <section style={{ padding: "4rem 1.5rem", background: "#fafafa" }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto 2.5rem", textAlign: "center" }}>
        <p
          style={{
            fontSize: "1.1rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#666",
            margin: "0 0 0.5rem",
          }}
        >
          STYLING NOTES
        </p>
        <h2
          style={{
            fontSize: "2.2rem",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 600,
          }}
        >
          {title}
        </h2>
      </div>

      <div className="editorial-split">
        <div className="editorial-split__media" style={{ position: "relative", minHeight: "500px", aspectRatio: "4/5" }}>
          <Image
            src={image}
            alt="Pistola Accessories Editorial"
            fill
            sizes="(min-width: 990px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="editorial-split__grid">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

