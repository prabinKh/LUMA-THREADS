import Image from "next/image";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";

export const metadata = {
  title: "About Us | Luma Threads",
  description: "Clothing for modern women. Everyday utility with elevated ease.",
};

export default function AboutPage() {
  const { about } = getCatalog();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem 8rem" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px", color: "#777", marginBottom: "3rem" }}>
        <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
        <span>About Us</span>
      </div>

      {/* Main Image with Text Section */}
      <section className="about-hero-grid">
        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", background: "#f5f5f5", overflow: "hidden" }}>
          <Image
            src={about.image}
            alt="Luma Threads Story"
            fill
            priority
            sizes="(min-width: 990px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div style={{ maxWidth: "600px", width: "100%" }}>
          <p
            style={{
              fontSize: "1.2rem",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "#666",
              margin: "0 0 1rem",
              fontWeight: 600,
            }}
          >
            {about.subheading}
          </p>
          <h1
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.4rem)",
              lineHeight: 1.15,
              fontWeight: 600,
              letterSpacing: "1px",
              margin: "0 0 2rem",
            }}
          >
            {about.heading}
          </h1>
          {about.paragraphs.map((p, idx) => (
            <p
              key={idx}
              style={{
                fontSize: "1.4rem",
                lineHeight: 1.8,
                color: "#444",
                marginBottom: "1.6rem",
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Brand Values / Pillars */}
      {about.values && (
        <section
          style={{
            borderTop: "1px solid rgba(0,0,0,0.08)",
            paddingTop: "6rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "#666",
              margin: "0 0 1rem",
            }}
          >
            OUR COMMITMENT
          </p>
          <h2
            style={{
              fontSize: "2.6rem",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              margin: "0 0 4rem",
              fontWeight: 600,
            }}
          >
            DESIGNED FOR REAL LIFE
          </h2>

          <div className="about-values-grid">
            {about.values.map((v) => (
              <div
                key={v.title}
                style={{
                  background: "#fafafa",
                  padding: "3rem 2.5rem",
                  border: "1px solid #eee",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.6rem",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    margin: "0 0 1rem",
                    fontWeight: 600,
                  }}
                >
                  {v.title}
                </h3>
                <p style={{ fontSize: "1.3rem", lineHeight: 1.7, color: "#555", margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
