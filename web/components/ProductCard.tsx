"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, ProductSwatch } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "./CartProvider";

export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeSwatch, setActiveSwatch] = useState<ProductSwatch | null>(
    product.swatches && product.swatches.length > 0 ? product.swatches[0] : null
  );

  const { addItem } = useCart();

  // Active images based on swatch selection
  const currentMainImage =
    activeSwatch?.image || product.image || product.images[0] || "/placeholder.jpg";
  const currentHoverImage =
    activeSwatch?.hoverImage || product.hoverImage || product.images[1] || currentMainImage;

  // Active colorway name
  const currentColorway = activeSwatch?.name || product.colorway || "";

  // Active price based on swatch selection (supports different price/amount per color!)
  const currentPrice = activeSwatch?.price || product.price;

  // Active sizes based on swatch selection (supports different sizes per color!)
  const currentSizes =
    activeSwatch?.sizes && activeSwatch.sizes.length > 0
      ? activeSwatch.sizes
      : product.sizes;

  // Title without colorway if colorway is already in title
  const baseTitle = product.title.split(" - ")[0];

  // Compute product URL carrying selected color & size so PDP opens with that exact dress/color & size
  const queryParams = new URLSearchParams();
  if (currentColorway) {
    queryParams.set("color", currentColorway);
  }
  if (selectedSize) {
    queryParams.set("size", selectedSize);
  }
  const queryString = queryParams.toString();
  const productUrl = `/products/${product.handle}${queryString ? `?${queryString}` : ""}`;

  // ONLY select the size (do NOT add to cart on size click)
  const handleSizeClick = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize((prev) => (prev === size ? "" : size));
  };

  // Switch the color swatch and update the card image immediately
  const handleSwatchClick = (swatch: ProductSwatch, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSwatch(swatch);
    const swatchSizes =
      swatch.sizes && swatch.sizes.length > 0 ? swatch.sizes : product.sizes;
    if (selectedSize && !swatchSizes.includes(selectedSize)) {
      setSelectedSize("");
    }
  };

  // Add to cart only when clicking the Quick Add button
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sizeToUse = selectedSize || currentSizes[0] || "26";
    const productWithColor: Product = {
      ...product,
      colorway: currentColorway,
      price: currentPrice,
      image: currentMainImage,
      hoverImage: currentHoverImage,
    };
    addItem(productWithColor, sizeToUse);
  };

  return (
    <div
      className="ns-product product-card product-card--style2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      {/* 1. Card Media Container */}
      <div
        className="ns-relative"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      >
        <Link
          className="js-card-product-link"
          href={productUrl}
          style={{ display: "block", position: "relative", aspectRatio: "3/4" }}
        >
          {/* Main image - dynamically updates based on selected color swatch */}
          <Image
            className="ns-w-100 ns-h-auto js-card-main-img"
            src={currentMainImage}
            alt={`${product.title} - ${currentColorway}`}
            fill
            sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
            style={{
              objectFit: "cover",
              opacity:
                isHovered && currentHoverImage && currentHoverImage !== currentMainImage
                  ? 0
                  : 1,
              transition: "opacity 0.35s ease",
            }}
          />
          {/* Hover alternate image */}
          {currentHoverImage && currentHoverImage !== currentMainImage && (
            <Image
              className="ns-hover-img media--hover-effect js-card-hover-img"
              src={currentHoverImage}
              alt={`${product.title} ${currentColorway} alternate`}
              fill
              sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
              style={{
                objectFit: "cover",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.35s ease",
              }}
            />
          )}
        </Link>

        {/* Product Tag / Badge */}
        {product.badge && (
          <div
            className="product-label"
            style={{ position: "absolute", top: "10px", left: "10px", zIndex: 3 }}
          >
            <span
              className="product-tag product-tag--absolute"
              style={{
                border: "1px solid rgb(255, 0, 14)",
                color: "rgb(255, 0, 14)",
                backgroundColor: "#fff",
                padding: "2px 8px",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Mobile Quick Options Trigger */}
        <button
          type="button"
          className="card-mobile-quick-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsHovered(!isHovered);
          }}
          aria-label="Toggle options"
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            zIndex: 4,
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(4px)",
            border: "1px solid #d5d5d5",
            borderRadius: "0px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "4px 8px",
            cursor: "pointer",
            display: isHovered ? "none" : "block",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          + Options
        </button>

        {/* COLOR & SIZE PANEL: SLIDES DOWN TO UP (FROM BOTTOM OF IMAGE UPWARD) ON HOVER / TAP */}
        <div
          className="card-image-bottom-up-panel"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(8px)",
            padding: "10px 12px 12px",
            zIndex: 5,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            transition:
              "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease",
            pointerEvents: isHovered ? "auto" : "none",
            boxShadow: "0 -4px 18px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "92%",
            overflowY: "auto",
          }}
        >
          {/* Top Panel Bar with Close Button on Mobile */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#777",
                fontWeight: 600,
              }}
            >
              Select Options
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsHovered(false);
              }}
              aria-label="Close options"
              style={{
                background: "none",
                border: "none",
                fontSize: "16px",
                lineHeight: "14px",
                cursor: "pointer",
                padding: "2px 4px",
                color: "#777",
              }}
            >
              ×
            </button>
          </div>
          {/* Square Color Buttons */}
          {product.swatches && product.swatches.length > 0 && (
            <div className="product__swatches" aria-label="Color options" role="group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#777",
                    fontWeight: 600,
                  }}
                >
                  Color: <strong style={{ color: "#111" }}>{currentColorway}</strong>
                </span>
              </div>
              <div
                className="product__swatch-links-wrapper is-loaded"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                {product.swatches.map((swatch) => {
                  const isActive =
                    (activeSwatch && activeSwatch.name === swatch.name) ||
                    (!activeSwatch &&
                      swatch.name.toLowerCase() === currentColorway.toLowerCase());

                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      className={`product__swatch-link ${isActive ? "product__swatch-link--current active" : ""}`}
                      onClick={(e) => handleSwatchClick(swatch, e)}
                      title={swatch.name}
                      aria-label={swatch.name}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "0px", // Square button
                        backgroundColor: swatch.color,
                        border: isActive ? "2px solid #000" : "1px solid #ccc",
                        cursor: "pointer",
                        padding: 0,
                        position: "relative",
                        outline: "none",
                        boxShadow: isActive
                          ? "0 0 0 1px #fff, 0 0 0 2.5px #000"
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Square Size Buttons */}
          <div className="selector-wrapper js product-form__item js-card-size-wrapper">
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#777",
                display: "block",
                marginBottom: "4px",
                fontWeight: 600,
              }}
            >
              Sizes:{" "}
              {selectedSize ? (
                <strong style={{ color: "#111" }}>({selectedSize})</strong>
              ) : null}
            </span>
            <fieldset
              className="single-option-radio js-card-size-fieldset"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                border: 0,
                padding: 0,
                margin: 0,
              }}
            >
              {currentSizes.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    className={`nosto-size ${isSelected ? "selected" : ""}`}
                    onClick={(e) => handleSizeClick(sz, e)}
                    title={`Select size ${sz}`}
                    style={{
                      background: isSelected ? "#000" : "#fff",
                      color: isSelected ? "#fff" : "#000",
                      fontSize: "10px",
                      lineHeight: "22px",
                      height: "24px",
                      minWidth: "26px",
                      borderRadius: "0px", // Square button
                      padding: "0 3px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      border: isSelected ? "1px solid #000" : "1px solid #dcdcdc",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sz}
                  </button>
                );
              })}
            </fieldset>
          </div>

          {/* Quick Add Button */}
          <div className="product-form__item product-form__item--submit" style={{ marginTop: "2px" }}>
            <button
              type="button"
              className="ns-atc card-add-to-cart btn btn-underline"
              onClick={handleQuickAdd}
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "0px",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              <span>
                {selectedSize ? `Add Size ${selectedSize} to Bag` : "Quick Add"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Product Details - Stays Clean & Stable Below the Image */}
      <div
        className="ns-relative ns-prod-details product-card__info"
        style={{ paddingTop: "12px" }}
      >
        {/* Product Title */}
        <h3 style={{ margin: "0 0 6px" }}>
          <Link
            className="ns-prod-name js-card-product-name-link"
            href={productUrl}
            style={{
              fontSize: "13px",
              letterSpacing: "1px",
              color: "#000",
              textDecoration: "none",
              fontWeight: 500,
              lineHeight: 1.4,
              display: "inline-block",
            }}
          >
            {baseTitle}
            {currentColorway && (
              <>
                {" - "}
                <em
                  className="ns-prod-name-colorway"
                  style={{ fontStyle: "italic", fontWeight: 400 }}
                >
                  {currentColorway}
                </em>
              </>
            )}
          </Link>
        </h3>

        {/* Product Price */}
        <div className="ns-prod-price js-card-price" style={{ margin: "4px 0 0" }}>
          <div className="price">
            <span
              className="price-item price-item--regular"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                color: "#111",
              }}
            >
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
