import Link from "next/link";
import Image from "next/image";

export function CategoryGrid({
  categories,
}: {
  categories: { title: string; image: string; href: string }[];
}) {
  return (
    <section style={{ padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto 2rem", textAlign: "center" }}>
        <p
          style={{
            fontSize: "1.1rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#666",
            margin: "0 0 0.5rem",
          }}
        >
          CURATED ESSENTIALS
        </p>
        <h2
          style={{
            fontSize: "2.4rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 600,
          }}
        >
          SHOP BY CATEGORY
        </h2>
      </div>

      <div className="category-blocks-container">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="category-block-card"
            style={{ aspectRatio: "4/5" }}
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              sizes="(min-width: 750px) 33vw, 50vw"
              style={{ objectFit: "cover" }}
            />
            <div className="category-block-overlay">
              <h3 className="category-block-title">{cat.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

