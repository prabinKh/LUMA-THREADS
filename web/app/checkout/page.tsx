"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { useAuth, Order } from "@/components/AuthProvider";
import { formatPrice } from "@/lib/catalog";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isLoggedIn, addOrder } = useAuth();

  // Auth / Guest state
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-fill user email/name if logged in
  useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email);
      if (!firstName && user.name) {
        const parts = user.name.split(" ");
        setFirstName(parts[0] || "");
        if (parts.length > 1) setLastName(parts.slice(1).join(" "));
      }
    }
  }, [user]);

  // Shipping details state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("CA");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Payment details state (eSewa, Bank Transfer, Cash on Delivery, Card)
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [esewaId, setEsewaId] = useState("");
  const [bankTxnId, setBankTxnId] = useState("");
  const [bankSender, setBankSender] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [sameBilling, setSameBilling] = useState(true);

  // Discount code
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState("");

  // Submission state
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost =
    shippingMethod === "express" ? 20 : subtotal >= 150 ? 0 : 10;
  const estimatedTax = Number((subtotal * 0.0825).toFixed(2));
  const finalTotal = Math.max(
    0,
    subtotal + shippingCost + estimatedTax - discountAmount
  );

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === "WELCOME10") {
      const disc = Number((subtotal * 0.1).toFixed(2));
      setDiscountAmount(disc);
      setDiscountApplied("WELCOME10 (-10%)");
      setDiscountError("");
    } else if (discountCode.trim().toUpperCase() === "PISTOLA20") {
      const disc = Number((subtotal * 0.2).toFixed(2));
      setDiscountAmount(disc);
      setDiscountApplied("PISTOLA20 (-20%)");
      setDiscountError("");
    } else {
      setDiscountError("Invalid discount code. Try WELCOME10 or PISTOLA20");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let generatedOrderNum = `PD-${Math.floor(100000 + Math.random() * 900000)}`;
    let trackingNum = `1Z${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
    let carrierName = "FedEx Express";

    try {
      const orderPayload = {
        customer_email: email || user?.email || "customer@lumathreads.com",
        customer_name: `${firstName} ${lastName}`.trim() || user?.name || "Customer",
        first_name: firstName || "Customer",
        last_name: lastName || "",
        address: address || "123 Fashion Blvd",
        apartment: apartment || "",
        city: city || "Los Angeles",
        state: state || "CA",
        zip: zip || "90015",
        postal_code: zip || "90015",
        subtotal: subtotal,
        shipping_fee: shippingCost,
        discount: discountAmount,
        total_amount: finalTotal,
        payment_method:
          paymentMethod === "esewa"
            ? `eSewa (${esewaId || "Wallet"})`
            : paymentMethod === "bank"
            ? `Bank Transfer (${bankTxnId || bankSender || "Nabil Bank"})`
            : paymentMethod === "cod"
            ? "Cash on Delivery (COD)"
            : `Credit Card (ending ${cardNumber.slice(-4) || "4242"})`,
        items: items.map((it) => ({
          name: it.product.title,
          handle: it.product.handle,
          color: it.product.colorway || it.product.color || "",
          size: it.size,
          price:
            typeof it.product.price === "number"
              ? it.product.price
              : parseFloat(String(it.product.price).replace(/[^0-9.]/g, "")) || 0,
          quantity: it.quantity,
          image: it.product.image || (it.product.images && it.product.images[0]) || "",
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.order_number) {
          generatedOrderNum = data.order_number;
        }
        if (data && data.tracking_number) {
          trackingNum = data.tracking_number;
        }
        if (data && data.carrier) {
          carrierName = data.carrier;
        }
      }
    } catch (err) {
      console.warn("Backend order sync fallback to local:", err);
    }

    const newOrder: Order = {
      id: generatedOrderNum,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      customerEmail: email || user?.email || "customer@lumathreads.com",
      customerName:
        `${firstName} ${lastName}`.trim() || user?.name || "Customer",
      items: items.map((it) => ({
        handle: it.product.handle,
        title: it.product.title,
        colorway: it.product.colorway,
        size: it.size,
        quantity: it.quantity,
        price:
          typeof it.product.price === "number"
            ? it.product.price
            : parseFloat(String(it.product.price).replace(/[^0-9.]/g, "")) || 0,
        image: it.product.image || it.product.images[0] || "/placeholder.jpg",
      })),
      subtotal,
      shipping: shippingCost,
      tax: estimatedTax,
      total: finalTotal,
      status: "Order Confirmed",
      trackingNumber: trackingNum,
      carrier: carrierName,
      shippingAddress: {
        firstName: firstName || "Customer",
        lastName: lastName || "",
        address: address || "123 Fashion Blvd",
        apartment: apartment || "",
        city: city || "Los Angeles",
        state: state || "CA",
        zip: zip || "90015",
      },
    };

    addOrder(newOrder);
    setOrderNumber(generatedOrderNum);
    setOrderPlaced(true);
    clearCart();
    setIsSubmitting(false);
  };

  if (orderPlaced) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "4rem auto 8rem",
          padding: "3rem 2rem",
          textAlign: "center",
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #eee",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.4rem",
            margin: "0 auto 1.5rem",
          }}
        >
          ✓
        </div>
        <p
          style={{
            fontSize: "1.2rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#666",
            margin: "0 0 0.5rem",
          }}
        >
          THANK YOU FOR YOUR ORDER
        </p>
        <h1
          style={{
            fontSize: "2.8rem",
            letterSpacing: "1.5px",
            fontWeight: 600,
            margin: "0 0 1rem",
          }}
        >
          Order Confirmed!
        </h1>
        <p style={{ fontSize: "1.4rem", color: "#333", margin: "0 0 2rem" }}>
          Your order <strong>{orderNumber}</strong> has been received and is being
          prepared. A confirmation email has been sent to{" "}
          <strong>{email || user?.email || "your email address"}</strong>.
        </p>

        <div
          style={{
            background: "#f9f9f9",
            padding: "2rem",
            borderRadius: "4px",
            textAlign: "left",
            margin: "2rem 0 3rem",
            fontSize: "1.3rem",
            lineHeight: 1.8,
          }}
        >
          <p style={{ margin: "0 0 0.5rem" }}>
            <strong>Estimated Delivery:</strong> 2-3 Business Days via FedEx
          </p>
          <p style={{ margin: "0 0 0.5rem" }}>
            <strong>Shipping To:</strong> {firstName} {lastName},{" "}
            {address} {apartment}, {city}, {state} {zip}
          </p>
          <p style={{ margin: "0 0 0.5rem" }}>
            <strong>Payment Method:</strong>{" "}
            {paymentMethod === "esewa"
              ? `eSewa Mobile Wallet (${esewaId || "Verified"})`
              : paymentMethod === "bank"
              ? `Direct Bank Transfer (${bankTxnId || bankSender || "Nabil Bank"})`
              : paymentMethod === "cod"
              ? "Cash on Delivery (Pay upon delivery)"
              : `Credit Card ending in ${cardNumber.slice(-4) || "4242"}`}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Total Paid:</strong> ${finalTotal.toFixed(2)}
          </p>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/orders/track"
            style={{
              display: "inline-block",
              background: "#000",
              color: "#fff",
              padding: "1.3rem 2.8rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            🚚 Track Your Order Now
          </Link>
          <Link
            href="/collections/all-new"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#000",
              border: "1px solid #ccc",
              padding: "1.3rem 2.8rem",
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
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: "700px", margin: "5rem auto 8rem", textAlign: "center", padding: "0 1.5rem" }}>
        <h1 style={{ fontSize: "2.4rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1rem" }}>
          Your Bag is Empty
        </h1>
        <p style={{ fontSize: "1.3rem", color: "#666", marginBottom: "2.5rem" }}>
          There are no items in your cart to checkout.
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
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Shop New Arrivals
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem 1.5rem 8rem" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          paddingBottom: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <Link href="/" style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
          LUMA THREADS
        </Link>
        <Link href="/cart" style={{ fontSize: "1.2rem", textDecoration: "underline", color: "#666" }}>
          ← Return to Bag
        </Link>
      </div>

      <div className="checkout-page-grid">
        {/* Left Column: Checkout Steps (Login, Shipping, Payment) */}
        <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* STEP 1: LOGIN / ACCOUNT SECTION */}
          <section
            style={{
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              padding: "2rem",
            }}
          >
            {isLoggedIn ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                    }}
                  >
                    1. Account Verified
                  </h2>
                  <p style={{ margin: 0, fontSize: "1.3rem", color: "#333" }}>
                    Signed in as <strong>{user?.email}</strong> ({user?.name})
                  </p>
                </div>
                <span
                  style={{
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    padding: "4px 8px",
                    border: "1px solid #c8e6c9",
                  }}
                >
                  ✓ Active Customer
                </span>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    1. Account &amp; Contact
                  </h2>
                  <Link
                    href="/login?redirect=/checkout"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#000",
                      textDecoration: "underline",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Already have an account? Sign In
                  </Link>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <input
                    type="email"
                    placeholder="Email Address (for order tracking & receipts) *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      padding: "1rem",
                      border: "1px solid #ccc",
                      fontSize: "1.2rem",
                    }}
                  />
                  <label
                    style={{
                      fontSize: "1.1rem",
                      color: "#555",
                      display: "flex",
                      gap: "0.6rem",
                      alignItems: "center",
                    }}
                  >
                    <input type="checkbox" defaultChecked />
                    Email me with news and exclusive promotional offers
                  </label>
                </div>
              </>
            )}
          </section>

          {/* STEP 2: SHIPPING ADDRESS */}
          <section
            style={{
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.6rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 1.5rem" }}>
              2. Delivery Address
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="checkout-two-col">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
                />
              </div>

              <input
                type="text"
                placeholder="Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
              />

              <input
                type="text"
                placeholder="Apartment, Suite, Unit (optional)"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
              />

              <div className="checkout-city-row">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
                />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff" }}
                >
                  <option value="CA">CA</option>
                  <option value="NY">NY</option>
                  <option value="TX">TX</option>
                  <option value="FL">FL</option>
                  <option value="WA">WA</option>
                  <option value="IL">IL</option>
                </select>
                <input
                  type="text"
                  placeholder="ZIP"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
                />
              </div>

              <input
                type="tel"
                placeholder="Phone (for delivery notifications)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem" }}
              />
            </div>
          </section>

          {/* STEP 3: SHIPPING METHOD */}
          <section
            style={{
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.6rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 1.5rem" }}>
              3. Shipping Method
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1.2rem",
                  border: shippingMethod === "standard" ? "1.5px solid #000" : "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                  />
                  <div>
                    <strong style={{ fontSize: "1.2rem" }}>Standard Shipping (3-5 Business Days)</strong>
                    <div style={{ fontSize: "1.1rem", color: "#666" }}>Complimentary on orders over $150</div>
                  </div>
                </div>
                <strong style={{ fontSize: "1.2rem" }}>
                  {subtotal >= 150 ? "FREE" : "$10.00"}
                </strong>
              </label>

              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1.2rem",
                  border: shippingMethod === "express" ? "1.5px solid #000" : "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                  />
                  <div>
                    <strong style={{ fontSize: "1.2rem" }}>Express Shipping (1-2 Business Days)</strong>
                    <div style={{ fontSize: "1.1rem", color: "#666" }}>Priority handling &amp; air delivery</div>
                  </div>
                </div>
                <strong style={{ fontSize: "1.2rem" }}>$20.00</strong>
              </label>
            </div>
          </section>

          {/* STEP 4: PAYMENT SECTION */}
          <section
            style={{
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.6rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 1.5rem" }}>
              4. Payment Method
            </h2>

            {/* Payment Method Selector Tabs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "0.6rem",
                marginBottom: "1.8rem",
              }}
            >
              {[
                { id: "esewa", label: "eSewa", badge: "Digital Wallet" },
                { id: "bank", label: "Bank Transfer", badge: "Direct Transfer" },
                { id: "cod", label: "Cash on Delivery", badge: "Pay on Arrival" },
                { id: "card", label: "Credit Card", badge: "Visa / Mastercard" },
              ].map((pm) => {
                const isActive = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      padding: "1rem 0.8rem",
                      border: isActive ? "2px solid #000" : "1px solid #dcdcdc",
                      background: isActive ? "#000" : "#fff",
                      color: isActive ? "#fff" : "#111",
                      borderRadius: "0px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.3rem",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.15rem", letterSpacing: "0.5px" }}>{pm.label}</span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        padding: "0.15rem 0.5rem",
                        background: isActive ? "rgba(255,255,255,0.2)" : "#f0f0f0",
                        color: isActive ? "#fff" : "#666",
                        fontWeight: 500,
                      }}
                    >
                      {pm.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 1. eSewa Panel */}
            {paymentMethod === "esewa" && (
              <div
                style={{
                  padding: "1.8rem",
                  background: "#fbfdfa",
                  border: "1.5px solid #60bb46",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: "#60bb46",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "1.2rem",
                        padding: "0.3rem 0.8rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      eSewa
                    </span>
                    <strong style={{ fontSize: "1.3rem" }}>Pay via eSewa Mobile Wallet</strong>
                  </div>
                  <span style={{ fontSize: "1.1rem", color: "#60bb46", fontWeight: 600 }}>Instant Payment</span>
                </div>

                <p style={{ fontSize: "1.15rem", color: "#555", margin: 0 }}>
                  Enter your registered 10-digit eSewa ID (Mobile Number) or scan our official merchant QR code to complete your payment of <strong>${finalTotal.toFixed(2)}</strong>.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <label style={{ fontSize: "1.1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    eSewa ID / Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9841XXXXXX / 9801XXXXXX"
                    value={esewaId}
                    onChange={(e) => setEsewaId(e.target.value)}
                    style={{ padding: "1.1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff", width: "100%" }}
                  />
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: "1px dashed #60bb46",
                    padding: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#f0f0f0",
                      border: "2px solid #222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textAlign: "center",
                      color: "#333",
                      lineHeight: 1.2,
                      padding: "4px",
                    }}
                  >
                    eSewa QR
                  </div>
                  <div style={{ flex: 1, minWidth: "180px", fontSize: "1.15rem", lineHeight: 1.6 }}>
                    <div>Merchant: <strong>Luma Threads Official</strong></div>
                    <div>Account ID: <strong>9841234567</strong></div>
                    <div style={{ color: "#60bb46", fontWeight: 600 }}>Amount: ${finalTotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Bank Transfer Panel */}
            {paymentMethod === "bank" && (
              <div
                style={{
                  padding: "1.8rem",
                  background: "#f8f9fb",
                  border: "1.5px solid #1a365d",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <span style={{ fontSize: "1.8rem" }}>🏦</span>
                    <strong style={{ fontSize: "1.3rem" }}>Direct Bank Transfer / Mobile Banking</strong>
                  </div>
                  <span style={{ fontSize: "1.1rem", color: "#1a365d", fontWeight: 600 }}>ConnectIPS / Mobile Banking</span>
                </div>

                <p style={{ fontSize: "1.15rem", color: "#555", margin: 0 }}>
                  Please transfer the total amount of <strong>${finalTotal.toFixed(2)}</strong> to our official corporate account:
                </p>

                {/* Bank Account Details Card */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #d0d7de",
                    padding: "1.4rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    fontSize: "1.2rem",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "1rem", color: "#777", textTransform: "uppercase", display: "block" }}>Bank Name</span>
                    <strong>Nabil Bank Limited</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "1rem", color: "#777", textTransform: "uppercase", display: "block" }}>Account Name</span>
                    <strong>Luma Threads Nepal Pvt. Ltd.</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "1rem", color: "#777", textTransform: "uppercase", display: "block" }}>Account Number</span>
                    <strong style={{ letterSpacing: "1px", color: "#1a365d" }}>01201017500987</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "1rem", color: "#777", textTransform: "uppercase", display: "block" }}>Branch</span>
                    <strong>Durbar Marg Branch, Kathmandu</strong>
                  </div>
                </div>

                <div className="checkout-two-col">
                  <div>
                    <label style={{ fontSize: "1.1rem", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                      Depositor / Sender Name
                    </label>
                    <input
                      type="text"
                      placeholder="Account holder's full name"
                      value={bankSender}
                      onChange={(e) => setBankSender(e.target.value)}
                      style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff", width: "100%" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "1.1rem", fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                      Transaction Reference / Voucher ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-894102 or Ref No."
                      value={bankTxnId}
                      onChange={(e) => setBankTxnId(e.target.value)}
                      style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff", width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Cash on Delivery (COD) Panel */}
            {paymentMethod === "cod" && (
              <div
                style={{
                  padding: "1.8rem",
                  background: "#fefdfa",
                  border: "1.5px solid #b7791f",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <span style={{ fontSize: "1.8rem" }}>💵</span>
                    <strong style={{ fontSize: "1.3rem" }}>Cash on Delivery (COD)</strong>
                  </div>
                  <span style={{ fontSize: "1.1rem", color: "#b7791f", fontWeight: 600 }}>Pay at Doorstep</span>
                </div>

                <p style={{ fontSize: "1.2rem", color: "#333", margin: 0, lineHeight: 1.6 }}>
                  No advance payment required. You will pay <strong>${finalTotal.toFixed(2)}</strong> in cash when our courier delivers the parcel directly to your address.
                </p>

                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    padding: "1.2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                    fontSize: "1.15rem",
                    color: "#4a5568",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <span style={{ color: "#38a169", fontWeight: 700 }}>✓</span>
                    <span>Free package inspection allowed before handover</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <span style={{ color: "#38a169", fontWeight: 700 }}>✓</span>
                    <span>Delivery confirmation call &amp; SMS tracking updates</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    <span style={{ color: "#38a169", fontWeight: 700 }}>✓</span>
                    <span>Please keep exact cash ready upon delivery: <strong>${finalTotal.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Card Panel */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                  type="text"
                  placeholder="Card Number (e.g. 4242 •••• •••• 4242)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff" }}
                />
                <input
                  type="text"
                  placeholder="Name on Card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff" }}
                />
                <div className="checkout-two-col">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff" }}
                  />
                  <input
                    type="text"
                    placeholder="CVV / CVC"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    style={{ padding: "1rem", border: "1px solid #ccc", fontSize: "1.2rem", background: "#fff" }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              <label style={{ fontSize: "1.2rem", display: "flex", gap: "0.6rem", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(e) => setSameBilling(e.target.checked)}
                />
                Billing address same as shipping address
              </label>
            </div>
          </section>

          {/* PAY NOW BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "1.5rem",
              fontSize: "1.4rem",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              transition: "opacity 0.2s ease",
            }}
          >
            {isSubmitting
              ? "Processing Order..."
              : paymentMethod === "cod"
              ? `Place Order • Cash on Delivery ($${finalTotal.toFixed(2)})`
              : paymentMethod === "esewa"
              ? `Pay with eSewa • $${finalTotal.toFixed(2)}`
              : paymentMethod === "bank"
              ? `Confirm Bank Order • $${finalTotal.toFixed(2)}`
              : `Pay Now • $${finalTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Right Column: Order Summary & Promo Code */}
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #e5e5e5",
            padding: "2.5rem 2rem",
            position: "sticky",
            top: "100px",
          }}
        >
          <h2 style={{ fontSize: "1.6rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 1.5rem" }}>
            Order Summary ({items.length})
          </h2>

          {/* Line items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", maxHeight: "320px", overflowY: "auto", marginBottom: "2rem" }}>
            {items.map((item) => (
              <div
                key={`${item.product.handle}-${item.size}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  gap: "1.2rem",
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative", width: 60, height: 80, background: "#f0f0f0" }}>
                  {item.product.image && (
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      fill
                      sizes="60px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#000",
                      color: "#fff",
                      fontSize: "1rem",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {item.quantity}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: "1.2rem", margin: "0 0 0.3rem", fontWeight: 500 }}>
                    {item.product.title}
                  </h4>
                  <p style={{ fontSize: "1.1rem", color: "#666", margin: 0 }}>
                    Size: {item.size} {item.product.colorway ? `| ${item.product.colorway}` : ""}
                  </p>
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  {formatPrice(item.product.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Promo code form */}
          <form
            onSubmit={handleApplyDiscount}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
          >
            <input
              type="text"
              placeholder="Promo code (e.g. WELCOME10)"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              style={{ flex: 1, padding: "0.8rem 1rem", border: "1px solid #ccc", fontSize: "1.1rem" }}
            />
            <button
              type="submit"
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                padding: "0.8rem 1.4rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </form>

          {discountApplied && (
            <p style={{ color: "#2b8a3e", fontSize: "1.2rem", margin: "-1.5rem 0 1.5rem" }}>
              ✓ Code {discountApplied} applied!
            </p>
          )}

          {discountError && (
            <p style={{ color: "#c1121f", fontSize: "1.2rem", margin: "-1.5rem 0 1.5rem" }}>
              {discountError}
            </p>
          )}

          {/* Pricing calculations */}
          <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem" }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", color: "#2b8a3e" }}>
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem" }}>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem" }}>
              <span>Estimated Tax (CA 8.25%)</span>
              <span>${estimatedTax.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.6rem",
                fontWeight: 700,
                borderTop: "1px solid #000",
                paddingTop: "1.2rem",
                marginTop: "0.5rem",
              }}
            >
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

