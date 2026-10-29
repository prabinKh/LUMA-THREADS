"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

const navItems = [
  {
    label: "NEW",
    href: "/collections/all-new",
    megaMenu: [
      {
        title: "New Arrivals",
        links: [
          { label: "Shop All New", href: "/collections/all-new" },
          { label: "New Denim", href: "/collections/all-denim" },
          { label: "New Tops", href: "/collections/all-new" },
          { label: "New Bottoms", href: "/collections/all-denim" },
        ],
      },
    ],
  },
  {
    label: "DENIM",
    href: "/collections/all-denim",
    megaMenu: [
      {
        title: "Shop By Fit",
        links: [
          { label: "Shop All Denim", href: "/collections/all-denim" },
          { label: "Barrel", href: "/collections/barrel-jeans" },
          { label: "Straight", href: "/collections/straight-jeans" },
          { label: "Skinny", href: "/collections/skinny-jeans" },
          { label: "Bootcut", href: "/collections/bootcut-jeans" },
          { label: "Wide Leg", href: "/collections/wide-leg-jeans" },
          { label: "Flare", href: "/collections/flare-jeans" },
        ],
      },
      {
        title: "By Rise",
        links: [
          { label: "High Rise", href: "/collections/high-rise-denim" },
          { label: "Mid Rise", href: "/collections/mid-rise-denim" },
          { label: "Low Rise", href: "/collections/low-rise-denim" },
        ],
      },
      {
        title: "By Wash",
        links: [
          { label: "Light Wash", href: "/collections/light-wash" },
          { label: "Dark Wash", href: "/collections/dark-wash" },
          { label: "Black", href: "/collections/black-denim" },
          { label: "White", href: "/collections/white-denim" },
        ],
      },
    ],
  },
  {
    label: "CLOTHING",
    href: "/collections/all-new",
    megaMenu: [
      {
        title: "Category",
        links: [
          { label: "Shop All", href: "/collections/all-new" },
          { label: "Tops", href: "/collections/tops" },
          { label: "Bottoms", href: "/collections/bottoms" },
          { label: "Dresses & Skirts", href: "/collections/dresses-skirts" },
          { label: "Outerwear", href: "/collections/outerwear" },
          { label: "Knitwear", href: "/collections/knitwear" },
          { label: "Accessories", href: "/collections/accessories" },
        ],
      },
    ],
  },
  {
    label: "BEST SELLERS",
    href: "/collections/best-sellers",
  },
  {
    label: "ABOUT",
    href: "/pages/about-us",
  },
  {
    label: "SALE",
    href: "/collections/best-sellers",
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, openCart } = useCart();
  const { orders, hasOrders, isLoggedIn, user, logout } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div
        className="announcement-bar color-scheme-1 gradient"
        role="region"
        aria-label="Announcement"
      >
        <div className="announcement-bar__wrapper">
          <Link href="/collections/all-new" className="announcement-bar__link">
            <p className="announcement-bar__message">
              FREE SHIPPING ON ORDERS OVER $150 &nbsp;|&nbsp; COMPLIMENTARY US
              RETURNS
            </p>
          </Link>
        </div>
      </div>

      {/* Sticky Header */}
      <div className="section-header">
        <div className="header-wrapper color-scheme-1 gradient">
          <header className="header">
            {/* Left: Mobile hamburger */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                className="header__icon header__icon--menu medium-hide large-up-hide"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <span className="svg-wrapper">
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 16 14"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1h14M1 7h14M1 13h14"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </button>
            </div>

            {/* Center: Logo */}
            <h1 className="header__heading" style={{ justifySelf: "center", margin: 0 }}>
              <Link
                href="/"
                className="header__heading-link"
                aria-label="Luma Threads"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="header__heading-logo-wrapper"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span
                    style={{
                      fontSize: "clamp(2rem, 3vw, 2.5rem)",
                      fontWeight: 700,
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      fontFamily: "'Libre Franklin', sans-serif",
                      color: "#000",
                      whiteSpace: "nowrap",
                    }}
                  >
                    LUMA THREADS
                  </span>
                </div>
              </Link>
            </h1>

            {/* Right: Icons */}
            <div
              className="header__icons"
              style={{ display: "flex", alignItems: "center", gap: "1rem", justifySelf: "end" }}
            >
              {/* Conditional Track Order button in the top header */}
              {hasOrders && (
                <Link
                  href="/track"
                  className="header__icon header__tracking-pill"
                  title="Track Your Orders"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    background: "#f4f4f5",
                    color: "#18181b",
                    border: "1px solid #e4e4e7",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Track ({orders.length})</span>
                </Link>
              )}

              {/* User Account / Sign In */}
              {isLoggedIn ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Link
                    href="/orders/track"
                    title={`Signed in as ${user?.email}`}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#000",
                      textDecoration: "none",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Hi, {user?.name?.split(" ")[0]}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    title="Sign Out"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "10px",
                      color: "#888",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    (Exit)
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="header__icon"
                  aria-label="Account Sign In"
                  title="Sign In"
                  style={{
                    textDecoration: "none",
                    color: "#000",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <span className="svg-wrapper">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                </Link>
              )}

              {/* Search toggle */}
              <button
                className="header__icon"
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <span className="svg-wrapper">
                  <svg
                    fill="none"
                    height="15"
                    viewBox="0 0 15 15"
                    width="15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.75 14.4437C13.5709 14.4437 13.3938 14.375 13.2563 14.2396L10.7167 11.6812C9.61045 12.5729 8.24587 13.0562 6.8042 13.0562C5.36253 13.0562 3.56462 12.4062 2.38545 11.225C1.2042 10.0437 0.554199 8.47499 0.554199 6.80624C0.554199 5.13749 1.2042 3.56666 2.38545 2.38749C3.5667 1.20624 5.13545 0.556244 6.8042 0.556244C8.47295 0.556244 10.0438 1.20624 11.2229 2.38749C12.4042 3.56874 13.0542 5.13749 13.0542 6.80624C13.0542 8.47499 12.5771 9.59583 11.6959 10.6979L14.2417 13.2625C14.5125 13.5354 14.5104 13.975 14.2375 14.2437C14.1021 14.3792 13.925 14.4458 13.7479 14.4458L13.75 14.4437ZM6.80628 1.94374C5.50837 1.94374 4.28753 2.44999 3.36878 3.36666C2.45003 4.28333 1.94587 5.50624 1.94587 6.80416C1.94587 8.10208 2.45212 9.32291 3.36878 10.2417C4.28753 11.1604 5.50837 11.6646 6.80628 11.6646C8.1042 11.6646 9.32503 11.1583 10.2438 10.2417C10.2479 10.2375 10.25 10.2354 10.2521 10.2333C11.1646 9.31666 11.6667 8.09999 11.6667 6.80624C11.6667 5.51249 11.1604 4.28749 10.2438 3.36874C9.32503 2.44999 8.1042 1.94583 6.80628 1.94583V1.94374Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                className="header__icon"
                aria-label="Open cart"
                onClick={openCart}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  padding: "0.4rem",
                }}
              >
                <span className="svg-wrapper" style={{ position: "relative" }}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 15 15"
                    width="16"
                    height="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.373 13.442H2.325l-.91-8.672h11.812l-.854 8.672zM5.63 1.724c.422-.44.977-.655 1.7-.655 1.873 0 2.458 1.622 2.64 2.649H4.81c.078-.607.28-1.427.82-1.994zm8.567 2.167a.524.524 0 0 0-.39-.173h-2.79C10.78 2.13 9.833.042 7.329.042c-1.006 0-1.83.329-2.446.978-.769.808-1.027 1.933-1.11 2.698H.83a.53.53 0 0 0-.392.174.519.519 0 0 0-.13.406l1.018 9.725c.028.268.254.47.523.47h11c.27 0 .498-.204.523-.473l.958-9.725a.525.525 0 0 0-.134-.404z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                  {totalItems > 0 && (
                    <span className="cart-count-bubble">{totalItems}</span>
                  )}
                </span>
              </button>
            </div>
          </header>

          {/* Desktop Navigation */}
          <nav
            className="header__nav small-hide"
            aria-label="Main navigation"
            style={{ borderTop: "1px solid rgba(var(--color-foreground), 0.06)" }}
          >
            <ul
              className="header__menu"
              role="list"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2.4rem",
                padding: "0.8rem 0",
              }}
            >
              {navItems.map((item) => (
                <li
                  key={item.label}
                  className="header__menu-item"
                  style={{ position: "relative" }}
                >
                  <Link
                    href={item.href}
                    style={{
                      fontSize: "1.2rem",
                      letterSpacing: "1.8px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      padding: "0.6rem 0",
                      display: "block",
                    }}
                  >
                    {item.label}
                  </Link>
                  {item.megaMenu && (
                    <div className="mega-menu" role="navigation">
                      {item.megaMenu.map((col) => (
                        <div key={col.title} className="mega-menu__col">
                          <p className="mega-menu__title">{col.title}</p>
                          {col.links.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              className="mega-menu__link"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Search Dropdown Bar */}
          {searchOpen && (
            <div
              style={{
                background: "#f7f7f7",
                padding: "1rem 2rem",
                borderTop: "1px solid #e5e5e5",
              }}
            >
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  maxWidth: "600px",
                  margin: "0 auto",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="search"
                  placeholder="Search denim, tops, best sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.8rem 1.2rem",
                    border: "1px solid #ccc",
                    fontSize: "1.2rem",
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.8rem 1.6rem",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "80%",
              maxWidth: "340px",
              background: "#fff",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                paddingBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  fontFamily: "'Libre Franklin', sans-serif",
                  color: "#000",
                }}
              >
                LUMA THREADS
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.8rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {item.label}
                  </Link>
                  {item.megaMenu && (
                    <div
                      style={{
                        paddingLeft: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      {item.megaMenu.flatMap((col) =>
                        col.links.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                              fontSize: "1.2rem",
                              color: "#666",
                              padding: "0.2rem 0",
                            }}
                          >
                            {link.label}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
