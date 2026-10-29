"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import { formatPrice } from "@/lib/catalog";

export function CartDrawer() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } =
    useCart();

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100
  );
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      className={`cart-drawer-backdrop ${isOpen ? "is-open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div className="cart-drawer-panel">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Bag ({items.length})</h2>
          <button
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close bag"
          >
            ×
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="shipping-bar">
          <p className="shipping-bar__text">
            {remainingForFree <= 0 ? (
              <strong>You've unlocked free standard shipping!</strong>
            ) : (
              <>
                Add <strong>${remainingForFree.toFixed(2)}</strong> more to get{" "}
                <strong>FREE SHIPPING</strong>
              </>
            )}
          </p>
          <div className="shipping-bar__track">
            <div
              className="shipping-bar__progress"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="cart-drawer__items">
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 1rem",
                color: "#666",
              }}
            >
              <p
                style={{
                  fontSize: "1.4rem",
                  letterSpacing: "1px",
                  marginBottom: "1.5rem",
                }}
              >
                YOUR BAG IS CURRENTLY EMPTY.
              </p>
              <Link
                href="/collections/all-new"
                onClick={closeCart}
                className="cart-drawer__checkout-btn"
                style={{ display: "inline-block", width: "auto", padding: "1rem 2rem" }}
              >
                Shop New Arrivals
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.handle}-${item.size}`}
                className="cart-drawer__item"
              >
                <Link
                  href={`/products/${item.product.handle}${item.product.colorway ? `?color=${encodeURIComponent(item.product.colorway)}` : ""}`}
                  onClick={closeCart}
                  style={{ position: "relative", width: 80, height: 105, display: "block", flexShrink: 0 }}
                >
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                </Link>
                <div className="cart-drawer__item-details">
                  <div>
                    <h3 className="cart-drawer__item-title">
                      <Link
                        href={`/products/${item.product.handle}${item.product.colorway ? `?color=${encodeURIComponent(item.product.colorway)}` : ""}`}
                        onClick={closeCart}
                      >
                        {item.product.title}
                      </Link>
                    </h3>
                    <p className="cart-drawer__item-meta">
                      Size: {item.size}
                      {item.product.colorway ? ` | ${item.product.colorway}` : ""}
                    </p>
                    <p className="cart-drawer__item-price">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="cart-drawer__item-actions">
                    <div className="cart-quantity-selector">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.handle,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.handle,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-drawer__remove"
                      onClick={() =>
                        removeItem(item.product.handle, item.size)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal">
              <span>Estimated Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="cart-drawer__note">
              Taxes and shipping calculated at checkout.
            </p>
            <button
              type="button"
              onClick={() => {
                closeCart();
                if (isLoggedIn) {
                  router.push("/checkout");
                } else {
                  router.push("/login?redirect=/checkout");
                }
              }}
              className="cart-drawer__checkout-btn"
              style={{ width: "100%", border: "none", cursor: "pointer", textAlign: "center" }}
            >
              {isLoggedIn ? `Proceed to Payment • $${subtotal.toFixed(2)}` : `Sign In to Checkout • $${subtotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

