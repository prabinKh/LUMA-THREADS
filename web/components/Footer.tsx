"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  footerService,
  type FooterSettingsData,
  DEFAULT_FRONTEND_FOOTER,
} from "@/api/footerService";

export function Footer() {
  const pathname = usePathname();
  const [footer, setFooter] = useState<FooterSettingsData>(DEFAULT_FRONTEND_FOOTER);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("lumathreads_footer_settings");
      if (cached) {
        setFooter((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch (e) {
      // ignore
    }

    const fetchFooter = async () => {
      try {
        const data = await footerService.getSettings();
        if (data) {
          setFooter(data);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchFooter();

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setFooter(detail);
      }
    };
    window.addEventListener("lumathreads_footer_updated", handleUpdate);
    return () => window.removeEventListener("lumathreads_footer_updated", handleUpdate);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const { newsletter, customerSupport, social, columns, bottomBar } = footer;

  return (
    <footer className="footer color-scheme-1 gradient">
      <div className="footer__content-top page-width">
        {/* Column 1: Newsletter + Support + Social */}
        <div className="footer__block-wrapper">
          {/* Newsletter */}
          {newsletter.enabled && (
            <div className="footer-block--newsletter">
              <div
                className="footer__block-newsletter"
                style={{ marginBottom: "2.4rem" }}
              >
                <p className="footer__newsletter-title">{newsletter.title}</p>
                <form
                  className="footer__newsletter-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(newsletter.successMessage || "Thank you for subscribing to Luma Threads!");
                  }}
                >
                  <input
                    className="footer__newsletter-input"
                    type="email"
                    placeholder={newsletter.placeholder || "Enter your email"}
                    aria-label="Email address"
                    required
                  />
                  <button
                    className="footer__newsletter-submit"
                    type="submit"
                    aria-label="Subscribe"
                  >
                    {newsletter.buttonText || "→"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Customer Support Info */}
          {customerSupport.enabled && (
            <div className="footer__support">
              <div className="footer__support-content">
                <p>
                  <strong>{customerSupport.heading || "CUSTOMER SUPPORT"}</strong>
                  <br />
                  Email:{" "}
                  <a href={`mailto:${customerSupport.email}`}>
                    {customerSupport.email}
                  </a>
                  <br />
                  Hours: {customerSupport.hours}
                  {customerSupport.phone && (
                    <>
                      <br />
                      Tel: {customerSupport.phone}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Social Links */}
          {social.enabled && (
            <div className="footer__social" style={{ marginTop: "1.5rem" }}>
              <ul
                className="list-unstyled list-social footer__list-social"
                role="list"
                style={{ display: "flex", gap: "1.2rem", padding: 0 }}
              >
                {social.facebook && (
                  <li>
                    <a
                      className="link list-social__link"
                      href={social.facebook}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="svg-wrapper">
                        <svg className="icon icon-facebook" fill="none" viewBox="0 0 11 20" width="16" height="16">
                          <path
                            d="M10.0321 11.2494L10.5877 7.63H7.11458V5.28125C7.11458 4.29125 7.59958 3.32562 9.1552 3.32562H10.734V0.244375C10.734 0.244375 9.30145 0 7.93145 0C5.07145 0 3.20208 1.73375 3.20208 4.87187V7.63062H0.0227051V11.25H3.20208V20H7.11458V11.25L10.0321 11.2494Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <span className="visually-hidden">Facebook</span>
                    </a>
                  </li>
                )}

                {social.instagram && (
                  <li>
                    <a
                      className="link list-social__link"
                      href={social.instagram}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="svg-wrapper">
                        <svg className="icon icon-instagram" viewBox="0 0 20 20" width="16" height="16">
                          <path
                            clipRule="evenodd"
                            d="M13.23 3.492c-.84-.037-1.096-.046-3.23-.046-2.144 0-2.39.01-3.238.055-.776.027-1.195.164-1.487.273a2.4 2.4 0 0 0-.912.593 2.5 2.5 0 0 0-.602.922c-.11.282-.238.702-.274 1.486-.046.84-.046 1.095-.046 3.23s.01 2.39.046 3.229c.004.51.097 1.016.274 1.495.145.365.319.639.602.913.282.282.538.456.92.602.474.176.974.268 1.479.273.848.046 1.103.046 3.238.046s2.39-.01 3.23-.046c.784-.036 1.203-.164 1.486-.273.374-.146.648-.329.921-.602.283-.283.447-.548.602-.922.177-.476.27-.979.274-1.486.037-.84.046-1.095.046-3.23s-.01-2.39-.055-3.229c-.027-.784-.164-1.204-.274-1.495a2.4 2.4 0 0 0-.593-.913 2.6 2.6 0 0 0-.92-.602c-.284-.11-.703-.237-1.488-.273ZM6.697 2.05c.857-.036 1.131-.045 3.302-.045a63 63 0 0 1 3.302.045c.664.014 1.321.14 1.943.374a4 4 0 0 1 1.414.922c.41.397.728.88.93 1.414.23.622.354 1.279.365 1.942C18 7.56 18 7.824 18 10.005c0 2.17-.01 2.444-.046 3.292-.036.858-.173 1.442-.374 1.943-.2.53-.474.976-.92 1.423a3.9 3.9 0 0 1-1.415.922c-.51.191-1.095.337-1.943.374-.857.036-1.122.045-3.302.045-2.171 0-2.445-.009-3.302-.055-.849-.027-1.432-.164-1.943-.364a4.15 4.15 0 0 1-1.414-.922 4.1 4.1 0 0 1-.93-1.423c-.183-.51-.329-1.085-.365-1.943C2.009 12.45 2 12.167 2 10.004c0-2.161 0-2.435.055-3.302.027-.848.164-1.432.365-1.942a4.4 4.4 0 0 1 .92-1.414 4.2 4.2 0 0 1 1.415-.93c.51-.183 1.094-.33 1.943-.366Zm.427 4.806a4.105 4.105 0 1 1 5.805 5.805 4.105 4.105 0 0 1-5.805-5.805m1.882 5.371a2.668 2.668 0 1 0 2.042-4.93 2.668 2.668 0 0 0-2.042 4.93m5.922-5.942a.958.958 0 1 1-1.355-1.355.958.958 0 0 1 1.355 1.355"
                            fill="currentColor"
                            fillRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span className="visually-hidden">Instagram</span>
                    </a>
                  </li>
                )}

                {social.twitter && (
                  <li>
                    <a
                      className="link list-social__link"
                      href={social.twitter}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="svg-wrapper">
                        <svg className="icon icon-twitter" fill="none" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      </span>
                      <span className="visually-hidden">Twitter</span>
                    </a>
                  </li>
                )}

                {social.pinterest && (
                  <li>
                    <a
                      className="link list-social__link"
                      href={social.pinterest}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="svg-wrapper">
                        <svg className="icon icon-pinterest" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.97-.12-2.45.02-3.51.13-.96.86-5.87.86-5.87s-.22-.44-.22-1.09c0-1.02.59-1.78 1.33-1.78.63 0 .93.47.93 1.04 0 .63-.4 1.58-.61 2.45-.17.74.37 1.34 1.1 1.34 1.32 0 2.34-1.39 2.34-3.4 0-1.78-1.28-3.02-3.1-3.02-2.11 0-3.35 1.58-3.35 3.22 0 .64.25 1.32.55 1.69.06.07.07.14.05.21-.06.24-.19.76-.21.86-.04.14-.12.17-.28.1-1.04-.49-1.69-2-1.69-3.23 0-2.63 1.91-5.04 5.51-5.04 2.89 0 5.14 2.06 5.14 4.81 0 2.87-1.81 5.18-4.32 5.18-.84 0-1.64-.44-1.91-.96l-.52 1.98c-.19.73-.7 1.64-1.04 2.2A12 12 0 1 0 12 0z"/>
                        </svg>
                      </span>
                      <span className="visually-hidden">Pinterest</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Columns */}
        {columns.map((col) => {
          if (!col.enabled) return null;
          return (
            <div key={col.id} className="footer-block grid__item">
              <p className="footer-block__heading">{col.title}</p>
              <ul className="footer-block__details-content list-unstyled">
                {col.links.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.url} className="link link--text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar: Copyright and Payment methods */}
      <div className="footer__content-bottom">
        <div className="footer__content-bottom-wrapper page-width">
          <div className="footer__copyright caption">
            <small className="copyright__content">
              {bottomBar.copyright || `© ${new Date().getFullYear()}, Luma Threads. All rights reserved.`}
            </small>
          </div>

          {bottomBar.showPaymentBadges && (
            <div className="footer__payment">
              <span className="visually-hidden">Payment methods</span>
              <ul
                className="list list-payment"
                role="list"
                style={{ display: "flex", gap: "0.8rem", listStyle: "none", margin: 0, padding: 0, flexWrap: "wrap" }}
              >
                {bottomBar.paymentBadges.map((badge) => (
                  <li
                    key={badge}
                    style={{
                      border: "1px solid #ddd",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.9rem",
                      borderRadius: "2px",
                      color: "#666",
                    }}
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
