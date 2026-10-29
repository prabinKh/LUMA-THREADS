"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { formatPrice } from "@/lib/catalog";

export default function OrderTrackingPage() {
  const { orders } = useAuth();

  return (
    <div style={{ maxWidth: "1000px", margin: "3rem auto 8rem", padding: "0 2rem" }}>
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "1.1rem",
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "#777",
          marginBottom: "2rem",
        }}
      >
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
          Home
        </Link>{" "}
        &nbsp;/&nbsp; <span>Order Tracking</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontSize: "1.1rem",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "#666",
            fontWeight: 600,
            margin: "0 0 0.8rem",
          }}
        >
          LIVE SHIPMENT STATUS
        </p>
        <h1
          style={{
            fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 500,
            margin: 0,
          }}
        >
          Your Order Tracking
        </h1>
      </div>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 2rem",
            background: "#fafafa",
            border: "1px dashed #ccc",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <h2 style={{ fontSize: "1.8rem", letterSpacing: "1px", marginBottom: "1rem" }}>
            No Active Orders Found
          </h2>
          <p style={{ fontSize: "1.3rem", color: "#666", marginBottom: "2.5rem" }}>
            Once you place an order, live tracking details and status updates will appear here.
          </p>
          <Link
            href="/collections/all-denim"
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
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
          {orders.map((order, orderIndex) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #e5e5e5",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: "1.8rem 2.4rem",
                  background: "#f9f9f9",
                  borderBottom: "1px solid #e5e5e5",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#777",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    ORDER NUMBER
                  </span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "1px" }}>
                    {order.id}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "1rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#777",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    DATE PLACED
                  </span>
                  <span style={{ fontSize: "1.3rem", color: "#333", fontWeight: 500 }}>
                    {order.date}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "1rem",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "#777",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    TOTAL
                  </span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-block",
                      background: "#e8f5e9",
                      color: "#1b5e20",
                      padding: "6px 12px",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    ● {order.status}
                  </span>
                </div>
              </div>

              {/* Live Visual Tracker Bar */}
              <div style={{ padding: "2.5rem 1.5rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
                <div className="tracking-steps-wrapper">
                  {/* Connecting Line */}
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "12%",
                      right: "12%",
                      height: "3px",
                      background: "#e0e0e0",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "66%",
                        height: "100%",
                        background: "#000",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Step 1: Confirmed */}
                  <div className="tracking-step-item">
                    <div className="tracking-step-circle" style={{ background: "#000", color: "#fff" }}>
                      ✓
                    </div>
                    <span className="tracking-step-label">
                      Confirmed
                    </span>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className="tracking-step-item">
                    <div className="tracking-step-circle" style={{ background: "#000", color: "#fff" }}>
                      ✓
                    </div>
                    <span className="tracking-step-label">
                      Preparing
                    </span>
                  </div>

                  {/* Step 3: Shipped / In Transit */}
                  <div className="tracking-step-item">
                    <div className="tracking-step-circle" style={{ background: "#000", color: "#fff", boxShadow: "0 0 0 4px rgba(0,0,0,0.15)" }}>
                      🚚
                    </div>
                    <span className="tracking-step-label" style={{ color: "#000", fontWeight: 700 }}>
                      In Transit
                    </span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="tracking-step-item">
                    <div className="tracking-step-circle" style={{ background: "#f0f0f0", color: "#888", border: "2px solid #ddd" }}>
                      📦
                    </div>
                    <span className="tracking-step-label" style={{ color: "#888" }}>
                      Delivered
                    </span>
                  </div>
                </div>

                {/* Carrier details */}
                <div
                  style={{
                    background: "#fdf8f0",
                    border: "1px solid #fae6c6",
                    padding: "1.2rem 1.6rem",
                    borderRadius: "4px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    fontSize: "1.2rem",
                  }}
                >
                  <div>
                    <strong>Carrier:</strong> {order.carrier} &nbsp;|&nbsp;{" "}
                    <strong>Tracking #:</strong>{" "}
                    <code style={{ background: "#fff", padding: "2px 6px", border: "1px solid #ddd" }}>
                      {order.trackingNumber}
                    </code>
                  </div>
                  <div>
                    <strong>Estimated Arrival:</strong> In 2-3 Business Days
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ padding: "2.4rem" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    margin: "0 0 1.5rem",
                  }}
                >
                  Items in this Shipment ({order.items.length})
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "70px 1fr auto",
                        gap: "1.5rem",
                        alignItems: "center",
                        paddingBottom: "1.2rem",
                        borderBottom: "1px solid #f2f2f2",
                      }}
                    >
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          position: "relative",
                          background: "#f5f5f5",
                          border: "1px solid #eee",
                        }}
                      >
                        <Image
                          src={it.image}
                          alt={it.title}
                          fill
                          sizes="70px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 600 }}>
                          {it.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: "1.1rem", color: "#666" }}>
                          Size: <strong>{it.size}</strong> &nbsp;•&nbsp; Qty: <strong>{it.quantity}</strong>
                          {it.colorway && <> &nbsp;•&nbsp; Color: <strong>{it.colorway}</strong></>}
                        </p>
                      </div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 600 }}>
                        ${(it.price * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping address footer */}
                <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #eee", fontSize: "1.2rem", color: "#555" }}>
                  <strong>Destination:</strong> {order.shippingAddress.firstName} {order.shippingAddress.lastName},{" "}
                  {order.shippingAddress.address} {order.shippingAddress.apartment || ""}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

