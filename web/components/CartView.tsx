"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/catalog";

export function CartView() {
  const { items, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty-cart" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Your bag is empty</h1>
        <Link href="/collections/all-new" className="btn" style={{ display: "inline-block", marginTop: "1.5rem" }}>
          Shop new arrivals
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => {
    const rawPrice =
      typeof item.product.price === "number"
        ? item.product.price
        : parseFloat(String(item.product.price).replace(/[^0-9.]/g, "")) || 0;
    return sum + rawPrice * item.quantity;
  }, 0);

  return (
    <div className="cart-page">
      <h1>Bag</h1>
      <ul className="cart-list" style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={`${item.product.handle}-${item.size}`} style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {item.product.image ? (
              <Link href={`/products/${item.product.handle}${item.product.colorway ? `?color=${encodeURIComponent(item.product.colorway)}` : ""}`}>
                <Image src={item.product.image} alt={item.product.title} width={100} height={130} style={{ objectFit: "cover" }} />
              </Link>
            ) : null}
            <div>
              <Link href={`/products/${item.product.handle}${item.product.colorway ? `?color=${encodeURIComponent(item.product.colorway)}` : ""}`}>{item.product.title}</Link>
              <p>Size: {item.size}</p>
              <p>{formatPrice(item.product.price)}</p>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <label>
                  Qty:{" "}
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.product.handle, item.size, Number(event.target.value))
                    }
                    style={{ width: "50px", padding: "0.2rem" }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.product.handle, item.size)}
                  style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary" style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
        <p>Estimated total: <strong>${total.toFixed(2)}</strong></p>
      </div>
    </div>
  );
}
