"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export function CollectionFilters({
  products,
  onFiltered,
}: {
  products: Product[];
  onFiltered: (filtered: Product[]) => void;
}) {
  const [category, setCategory] = useState("all");
  const [fit, setFit] = useState("all");
  const [rise, setRise] = useState("all");
  const [wash, setWash] = useState("all");
  const [size, setSize] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const [currentCount, setCurrentCount] = useState(products.length);

  const applyFilters = (
    c: string,
    f: string,
    r: string,
    w: string,
    s: string,
    sort: string
  ) => {
    let result = [...products];

    // Category
    if (c !== "all") {
      result = result.filter((p) => {
        const text = `${p.handle} ${p.title}`.toLowerCase();
        if (c === "denim")
          return (
            text.includes("jean") ||
            text.includes("barrel") ||
            text.includes("rise") ||
            text.includes("denim") ||
            text.includes("flare") ||
            text.includes("straight")
          );
        if (c === "tops")
          return text.includes("top") || text.includes("polo") || text.includes("tee");
        if (c === "sweaters")
          return text.includes("sweater") || text.includes("knit");
        if (c === "jackets")
          return text.includes("jacket") || text.includes("coat");
        if (c === "accessories")
          return text.includes("belt") || text.includes("bag");
        return text.includes(c.toLowerCase());
      });
    }

    // Fit
    if (f !== "all") {
      const fQuery = f.toLowerCase().replace(" leg", "");
      result = result.filter((p) =>
        `${p.handle} ${p.title}`.toLowerCase().includes(fQuery)
      );
    }

    // Rise
    if (r !== "all") {
      const rQuery = r.toLowerCase();
      result = result.filter((p) =>
        `${p.handle} ${p.title}`.toLowerCase().includes(rQuery)
      );
    }

    // Wash
    if (w !== "all") {
      const wQuery = w.toLowerCase();
      result = result.filter((p) => {
        const cw = (p.colorway || "").toLowerCase();
        const h = p.handle.toLowerCase();
        if (wQuery === "black")
          return (
            cw.includes("black") || cw.includes("noir") || h.includes("black")
          );
        if (wQuery === "white")
          return (
            cw.includes("white") ||
            cw.includes("moonbeam") ||
            cw.includes("bone") ||
            h.includes("white")
          );
        if (wQuery === "light")
          return (
            cw.includes("light") ||
            cw.includes("moonwave") ||
            cw.includes("vega")
          );
        if (wQuery === "medium")
          return (
            cw.includes("distance") ||
            cw.includes("orion") ||
            cw.includes("polaris")
          );
        if (wQuery === "dark")
          return (
            cw.includes("dark") ||
            cw.includes("nightfall") ||
            cw.includes("legend")
          );
        return cw.includes(wQuery) || h.includes(wQuery);
      });
    }

    // Size
    if (s !== "all") {
      result = result.filter((p) => p.sizes && p.sizes.includes(s));
    }

    // Sort By
    if (sort === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "best-selling") {
      result.sort(
        (a, b) =>
          (b.badge === "Best seller" ? 1 : 0) -
          (a.badge === "Best seller" ? 1 : 0)
      );
    } else if (sort === "newest") {
      result.sort(
        (a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0)
      );
    }

    setCurrentCount(result.length);
    onFiltered(result);
  };

  const handleReset = () => {
    setCategory("all");
    setFit("all");
    setRise("all");
    setWash("all");
    setSize("all");
    setSortBy("featured");
    setCurrentCount(products.length);
    onFiltered(products);
  };

  const isFiltered =
    category !== "all" ||
    fit !== "all" ||
    rise !== "all" ||
    wash !== "all" ||
    size !== "all" ||
    sortBy !== "featured";

  return (
    <div
      className="collection-filter-section"
      style={{
        marginBottom: "2.5rem",
        borderTop: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
        padding: "1.2rem 0",
      }}
    >
      {/* Top Bar: Total Product Count & Filter Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.2rem",
        }}
      >
        {/* Total Product Count */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#111",
            }}
          >
            Total: {currentCount} {currentCount === 1 ? "Product" : "Products"}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "none",
                border: "none",
                color: "#c1121f",
                textDecoration: "underline",
                fontSize: "1.1rem",
                letterSpacing: "0.5px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Reset All
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="collection-filter-controls">
          {/* 1. Category */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                applyFilters(e.target.value, fit, rise, wash, size, sortBy);
              }}
              style={{
                padding: "0.6rem 1rem",
                border: category !== "all" ? "1.5px solid #000" : "1px solid #ccc",
                borderRadius: "0px",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="all">Category: All</option>
              <option value="denim">Denim</option>
              <option value="tops">Tops</option>
              <option value="sweaters">Sweaters</option>
              <option value="jackets">Jackets</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          {/* 2. Fit */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <select
              value={fit}
              onChange={(e) => {
                setFit(e.target.value);
                applyFilters(category, e.target.value, rise, wash, size, sortBy);
              }}
              style={{
                padding: "0.6rem 1rem",
                border: fit !== "all" ? "1.5px solid #000" : "1px solid #ccc",
                borderRadius: "0px",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="all">Fit: All</option>
              <option value="Straight">Straight</option>
              <option value="Barrel">Barrel</option>
              <option value="Wide">Wide Leg</option>
              <option value="Skinny">Skinny</option>
              <option value="Bootcut">Bootcut</option>
              <option value="Flare">Flare</option>
            </select>
          </div>

          {/* 3. Rise */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <select
              value={rise}
              onChange={(e) => {
                setRise(e.target.value);
                applyFilters(category, fit, e.target.value, wash, size, sortBy);
              }}
              style={{
                padding: "0.6rem 1rem",
                border: rise !== "all" ? "1.5px solid #000" : "1px solid #ccc",
                borderRadius: "0px",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="all">Rise: All</option>
              <option value="High Rise">High Rise</option>
              <option value="Mid Rise">Mid Rise</option>
              <option value="Low">Low Rise</option>
            </select>
          </div>

          {/* 4. Wash */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <select
              value={wash}
              onChange={(e) => {
                setWash(e.target.value);
                applyFilters(category, fit, rise, e.target.value, size, sortBy);
              }}
              style={{
                padding: "0.6rem 1rem",
                border: wash !== "all" ? "1.5px solid #000" : "1px solid #ccc",
                borderRadius: "0px",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="all">Wash: All</option>
              <option value="light">Light Wash</option>
              <option value="medium">Medium Wash</option>
              <option value="dark">Dark Wash</option>
              <option value="black">Black / Noir</option>
              <option value="white">White / Ecru</option>
            </select>
          </div>

          {/* 5. Size */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <select
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                applyFilters(category, fit, rise, wash, e.target.value, sortBy);
              }}
              style={{
                padding: "0.6rem 1rem",
                border: size !== "all" ? "1.5px solid #000" : "1px solid #ccc",
                borderRadius: "0px",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="all">Size: All</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
              <option value="31">31</option>
              <option value="32">32</option>
              <option value="33">33</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* 6. Sort By */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                applyFilters(category, fit, rise, wash, size, e.target.value);
              }}
              style={{
                padding: "0.6rem 1rem",
                border: "1px solid #000",
                borderRadius: "0px",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#f8f8f8",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="best-selling">Sort by: Best Selling</option>
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price-asc">Sort by: Price (Low to High)</option>
              <option value="price-desc">Sort by: Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {isFiltered && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            marginTop: "1rem",
            paddingTop: "0.8rem",
            borderTop: "1px dashed #eee",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "1.1rem", color: "#666", textTransform: "uppercase" }}>
            Active:
          </span>
          {category !== "all" && (
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "0.2rem 0.8rem",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Category: {category}
              <button
                type="button"
                onClick={() => {
                  setCategory("all");
                  applyFilters("all", fit, rise, wash, size, sortBy);
                }}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
              >
                ×
              </button>
            </span>
          )}
          {fit !== "all" && (
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "0.2rem 0.8rem",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Fit: {fit}
              <button
                type="button"
                onClick={() => {
                  setFit("all");
                  applyFilters(category, "all", rise, wash, size, sortBy);
                }}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
              >
                ×
              </button>
            </span>
          )}
          {rise !== "all" && (
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "0.2rem 0.8rem",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Rise: {rise}
              <button
                type="button"
                onClick={() => {
                  setRise("all");
                  applyFilters(category, fit, "all", wash, size, sortBy);
                }}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
              >
                ×
              </button>
            </span>
          )}
          {wash !== "all" && (
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "0.2rem 0.8rem",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Wash: {wash}
              <button
                type="button"
                onClick={() => {
                  setWash("all");
                  applyFilters(category, fit, rise, "all", size, sortBy);
                }}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
              >
                ×
              </button>
            </span>
          )}
          {size !== "all" && (
            <span
              style={{
                background: "#000",
                color: "#fff",
                padding: "0.2rem 0.8rem",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Size: {size}
              <button
                type="button"
                onClick={() => {
                  setSize("all");
                  applyFilters(category, fit, rise, wash, "all", sortBy);
                }}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
