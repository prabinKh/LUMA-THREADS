"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/catalog";
import type { Product, ProductSwatch } from "@/lib/types";

export function ProductDetailView({
  product,
  initialColor,
  initialSize,
}: {
  product: Product;
  initialColor?: string;
  initialSize?: string;
}) {
  const searchParams = useSearchParams();
  const queryColor = searchParams?.get("color") || initialColor || "";
  const querySize = searchParams?.get("size") || initialSize || "";

  // Find matching swatch from product swatches
  const findMatchingSwatch = (colorName: string): ProductSwatch | null => {
    if (!colorName || !product.swatches) return null;
    return (
      product.swatches.find(
        (s) => s.name.toLowerCase() === colorName.toLowerCase()
      ) || null
    );
  };

  const initialSwatch =
    findMatchingSwatch(queryColor) ||
    (product.swatches && product.swatches.length > 0
      ? product.swatches[0]
      : null);

  const [activeSwatch, setActiveSwatch] = useState<ProductSwatch | null>(
    initialSwatch
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    querySize || product.sizes?.[0] || "26"
  );
  const [quantity, setQuantity] = useState(1);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    sizeFit: false,
    care: false,
    shipping: false,
  });

  const { addItem } = useCart();

  // Keep state synced if URL params change
  useEffect(() => {
    if (queryColor) {
      const match = findMatchingSwatch(queryColor);
      if (match) setActiveSwatch(match);
    }
    if (querySize && product.sizes?.includes(querySize)) {
      setSelectedSize(querySize);
    }
  }, [queryColor, querySize]);

  // Current active colorway
  const currentColorway = activeSwatch?.name || product.colorway || "";

  // Dynamic price based on active swatch
  const currentPrice =
    activeSwatch?.price !== undefined && activeSwatch?.price !== null
      ? activeSwatch.price
      : product.price;

  // Dynamic sizes based on active swatch
  const currentSizes: string[] =
    activeSwatch?.sizes && activeSwatch.sizes.length > 0
      ? activeSwatch.sizes
      : product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["XS", "S", "M", "L"];

  // Title without colorway
  const baseTitle = product.title.split(" - ")[0];
  const displayTitle = currentColorway
    ? `${baseTitle} - ${currentColorway}`
    : product.title;

  // DEDICATED IMAGES FOR THE CURRENT COLORWAY & DRESS ONLY
  const currentImages: string[] = (() => {
    if (activeSwatch?.images && activeSwatch.images.length > 0) {
      return activeSwatch.images;
    }
    if (activeSwatch?.image) {
      const list = [activeSwatch.image];
      if (activeSwatch.hoverImage && activeSwatch.hoverImage !== activeSwatch.image) {
        list.push(activeSwatch.hoverImage);
      }
      return list;
    }
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [product.image || "/placeholder.jpg"];
  })();

  // Handle color swatch click
  const handleSwatchClick = (swatch: ProductSwatch) => {
    setActiveSwatch(swatch);
    const swatchSizes =
      swatch.sizes && swatch.sizes.length > 0
        ? swatch.sizes
        : product.sizes && product.sizes.length > 0
        ? product.sizes
        : ["XS", "S", "M", "L"];

    let newSize = selectedSize;
    if (!swatchSizes.includes(selectedSize)) {
      newSize = swatchSizes[0] || "";
      setSelectedSize(newSize);
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("color", swatch.name);
      if (newSize) url.searchParams.set("size", newSize);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Handle size click
  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (activeSwatch?.name) url.searchParams.set("color", activeSwatch.name);
      url.searchParams.set("size", size);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    const customizedProduct: Product = {
      ...product,
      title: displayTitle,
      colorway: currentColorway,
      price: currentPrice,
      priceFormatted: typeof currentPrice === "number" ? `$${currentPrice.toFixed(2)}` : String(currentPrice),
      image: currentImages[0] || product.image,
      hoverImage: currentImages[1] || product.hoverImage,
      images: currentImages,
      sizes: currentSizes,
    };
    for (let i = 0; i < quantity; i++) {
      addItem(customizedProduct, selectedSize);
    }
  };

  const rawPriceNum =
    typeof currentPrice === "number"
      ? currentPrice
      : parseFloat(String(currentPrice).replace(/[^0-9.]/g, "")) || 0;
  const installment = (rawPriceNum / 4).toFixed(2);

  return (
    <div className="pdp-layout">
      {/* 1. SQUARE GALLERY: MULTIPLE IMAGES IN 2-COLUMN SQUARE GRID (Pistola Style) */}
      <div className="pdp-gallery-container">
        <div className="pdp-gallery-grid">
          {currentImages.map((imgSrc, idx) => (
            <div
              key={`${currentColorway}-${idx}`}
              className="pdp-gallery-item"
              onClick={() => setZoomedImage(imgSrc)}
              title="Click to zoom"
            >
              <Image
                src={imgSrc}
                alt={`${product.title} - ${currentColorway} view ${idx + 1}`}
                fill
                priority={idx < 2}
                sizes="(min-width: 990px) 35vw, (min-width: 768px) 50vw, 100vw"
                style={{ objectFit: "cover" }}
                className="pdp-gallery-img"
              />
              <div className="pdp-gallery-item-badge">
                <span>{idx + 1}/{currentImages.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PRODUCT DETAILS & ACTIONS: STICKY COLUMN */}
      <div className="pdp-info">
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: "1.1rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#777",
            marginBottom: "1rem",
          }}
        >
          <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
          <Link href="/collections/all-denim">Denim</Link> &nbsp;/&nbsp;{" "}
          <span>{baseTitle}</span>
        </div>

        {product.badge && (
          <span
            style={{
              display: "inline-block",
              border: "1px solid rgb(255, 0, 14)",
              color: "rgb(255, 0, 14)",
              padding: "0.2rem 0.6rem",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            {product.badge}
          </span>
        )}

        <h1
          style={{
            fontSize: "2.4rem",
            margin: "0 0 0.8rem",
            fontWeight: 500,
            letterSpacing: "1px",
            lineHeight: 1.25,
          }}
        >
          {baseTitle}
          {currentColorway && (
            <span style={{ fontWeight: 300, color: "#555" }}>
              {" "}
              — {currentColorway}
            </span>
          )}
        </h1>

        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            margin: "0 0 1rem",
            letterSpacing: "0.5px",
          }}
        >
          {formatPrice(currentPrice)}
        </div>

        {/* Klarna installments note */}
        <p
          style={{
            fontSize: "1.1rem",
            color: "#555",
            margin: "0 0 2rem",
            letterSpacing: "0.5px",
          }}
        >
          or 4 interest-free payments of <strong>${installment}</strong> with{" "}
          <strong>Klarna</strong> or <strong>Afterpay</strong>.
        </p>

        {/* Square Color Buttons */}
        {product.swatches && product.swatches.length > 0 && (
          <div style={{ marginBottom: "2.2rem" }}>
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0 0 0.8rem",
              }}
            >
              COLOR:{" "}
              <span style={{ fontWeight: 400, color: "#555" }}>
                {currentColorway}
              </span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              {product.swatches.map((swatch) => {
                const isActive =
                  activeSwatch?.name.toLowerCase() === swatch.name.toLowerCase();
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    className={`pdp-swatch-square ${isActive ? "active" : ""}`}
                    onClick={() => handleSwatchClick(swatch)}
                    title={swatch.name}
                    aria-label={`Select color ${swatch.name}`}
                    style={{
                      backgroundColor: swatch.color,
                      width: "28px",
                      height: "28px",
                      borderRadius: "0px", // Square button
                      border: isActive ? "2px solid #000" : "1px solid #d0d0d0",
                      outline: "none",
                      boxShadow: isActive
                        ? "0 0 0 1px #fff, 0 0 0 2.5px #000"
                        : "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.15s ease",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Square Sizes */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.8rem",
            }}
          >
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              SELECT SIZE:{" "}
              <span style={{ fontWeight: 400, color: "#555" }}>
                {selectedSize}
              </span>
            </span>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                textDecoration: "underline",
                fontSize: "1.1rem",
                cursor: "pointer",
                color: "#666",
              }}
              onClick={() =>
                alert("Standard US Denim Sizing: 23-33. Runs true to size.")
              }
            >
              Size Guide
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
            {currentSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  className={`pdp-size-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleSizeClick(sz)}
                  style={{
                    borderRadius: "0px", // Square button
                    minWidth: "48px",
                    height: "44px",
                    border: isSelected ? "1.5px solid #000" : "1px solid #dcdcdc",
                    background: isSelected ? "#000" : "#fff",
                    color: isSelected ? "#fff" : "#000",
                    fontWeight: isSelected ? 600 : 400,
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity & Add to Cart */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
          <div className="cart-quantity-selector" style={{ height: "48px", borderRadius: "0px" }}>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ width: "38px", height: "100%", borderRadius: "0px" }}
            >
              -
            </button>
            <span style={{ width: "38px" }}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              style={{ width: "38px", height: "100%", borderRadius: "0px" }}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              flex: 1,
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "0px",
              fontSize: "1.3rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              height: "48px",
              transition: "opacity 0.2s",
            }}
          >
            Add to Bag • {formatPrice(rawPriceNum * quantity)}
          </button>
        </div>

        {/* Free shipping banner */}
        <div
          style={{
            background: "#f8f8f8",
            padding: "1.2rem 1.5rem",
            marginBottom: "3rem",
            fontSize: "1.2rem",
            letterSpacing: "0.5px",
          }}
        >
          ✓ <strong>Complimentary US Shipping</strong> on orders over $150
          <br />
          ✓ <strong>30-Day Hassle-Free Returns</strong>
        </div>

        {/* Accordions */}
        <div className="pdp-accordions">
          {/* Description */}
          <div className="pdp-accordion">
            <div
              className="pdp-accordion-header"
              onClick={() => toggleAccordion("description")}
            >
              <span>Description</span>
              <span>{openAccordions.description ? "−" : "+"}</span>
            </div>
            {openAccordions.description && (
              <div className="pdp-accordion-body">
                {product.description ||
                  "Everyday essentials with utilitarian sensibility. Perfect for the busy, modern woman who demands her clothing work as hard as she does."}
              </div>
            )}
          </div>

          {/* Size & Fit */}
          <div className="pdp-accordion">
            <div
              className="pdp-accordion-header"
              onClick={() => toggleAccordion("sizeFit")}
            >
              <span>Size &amp; Fit</span>
              <span>{openAccordions.sizeFit ? "−" : "+"}</span>
            </div>
            {openAccordions.sizeFit && (
              <div className="pdp-accordion-body">
                {product.sizeAndFit ||
                  "• High rise\n• Relaxed barrel leg silhouette\n• Model is 5'9\" wearing size 26\n• 100% Cotton"}
              </div>
            )}
          </div>

          {/* Care */}
          <div className="pdp-accordion">
            <div
              className="pdp-accordion-header"
              onClick={() => toggleAccordion("care")}
            >
              <span>Care</span>
              <span>{openAccordions.care ? "−" : "+"}</span>
            </div>
            {openAccordions.care && (
              <div className="pdp-accordion-body">
                {product.care ||
                  "Machine wash cold inside out with like colors. Hang or lay flat to dry."}
              </div>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="pdp-accordion">
            <div
              className="pdp-accordion-header"
              onClick={() => toggleAccordion("shipping")}
            >
              <span>Shipping &amp; Returns</span>
              <span>{openAccordions.shipping ? "−" : "+"}</span>
            </div>
            {openAccordions.shipping && (
              <div className="pdp-accordion-body">
                We offer free standard shipping on all US orders over $150. Orders
                are processed within 1-2 business days. Items returned within 30
                days in original condition with tags attached are eligible for a
                full refund.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional Lightbox modal on image zoom */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            cursor: "zoom-out",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "90vw",
              maxWidth: "1000px",
              aspectRatio: "1 / 1",
              maxHeight: "90vh",
            }}
          >
            <Image
              src={zoomedImage}
              alt="Zoomed view"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
