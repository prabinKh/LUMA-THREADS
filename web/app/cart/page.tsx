"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { formatPrice } from "@/lib/catalog";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { isLoggedIn } = useAuth();
  const freeShippingThreshold = 150;
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem 8rem" }}>
      <h1
        style={{
          fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
          letterSpacing: "3px",
          textTransform: "uppercase",
          fontWeight: 600,
          textAlign: "center",
          margin: "0 0 3rem",
        }}
      >
        YOUR SHOPPING BAG
      </h1>

      {/* Free shipping bar */}
      <div
        style={{
          background: "#f7f7f7",
          padding: "1.5rem 2rem",
          maxWidth: "600px",
          margin: "0 auto 3rem",
          textAlign: "center",
          borderRadius: "4px",
        }}
      >
        <p style={{ fontSize: "1.2rem", margin: "0 0 0.8rem", letterSpacing: "0.5px" }}>
          {remainingForFree <= 0 ? (
            <strong>✓ You have qualified for FREE standard shipping!</strong>
          ) : (
            <>
              Add <strong>${remainingForFree.toFixed(2)}</strong> more to receive{" "}
              <strong>FREE STANDARD SHIPPING</strong>
            </>
          )}
        </p>
        <div style={{ height: "6px", background: "#e0e0e0", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "#000",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#666" }}>
          <p style={{ fontSize: "1.4rem", letterSpacing: "1px", marginBottom: "2rem" }}>
            Your bag is currently empty.
          </p>
          <Link
            href="/collections/all-new"
            style={{
              display: "inline-block",
              background: "#000",
              color: "#fff",
              padding: "1.2rem 3rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-page-grid">
          {/* Item list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {items.map((item) => (
              <div
                key={`${item.product.handle}-${item.size}`}
                className="cart-page-item"
              >
                <div style={{ position: "relative", width: 100, height: 130, background: "#f5f5f5" }}>
                  {item.product.image && (
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      sizes="100px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", fontWeight: 500 }}>
                    <Link href={`/products/${item.product.handle}`}>{item.product.title}</Link>
                  </h3>
                  <p style={{ fontSize: "1.2rem", color: "#666", margin: "0 0 0.8rem" }}>
                    Size: {item.size} {item.product.colorway ? `| ${item.product.colorway}` : ""}
                  </p>
                  <p style={{ fontSize: "1.3rem", fontWeight: 600, margin: 0 }}>
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
                  <div className="cart-quantity-selector">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.handle, item.size, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.handle, item.size, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.handle, item.size)}
                    style={{ background: "none", border: "none", color: "#888", fontSize: "1.1rem", textDecoration: "underline", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={clearCart}
                style={{ background: "none", border: "none", color: "#888", fontSize: "1.2rem", textDecoration: "underline", cursor: "pointer" }}
              >
                Clear Bag
              </button>
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              background: "#fafafa",
              padding: "2.5rem",
              border: "1px solid #eee",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                margin: "0 0 2rem",
                fontWeight: 600,
              }}
            >
              Order Summary
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.4rem",
                marginBottom: "1rem",
              }}
            >
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.3rem",
                color: "#666",
                marginBottom: "1.5rem",
              }}
            >
              <span>Shipping</span>
              <span>{remainingForFree <= 0 ? "FREE" : "Calculated at next step"}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.6rem",
                fontWeight: 700,
                borderTop: "1px solid #ddd",
                paddingTop: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <span>Estimated Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isLoggedIn) {
                  router.push("/checkout");
                } else {
                  router.push("/login?redirect=/checkout");
                }
              }}
              style={{
                width: "100%",
                padding: "1.4rem",
                background: "#000",
                color: "#fff",
                border: "none",
                fontSize: "1.3rem",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {isLoggedIn ? "Proceed to Payment" : "Sign In to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
