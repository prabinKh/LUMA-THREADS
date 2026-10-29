import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Luma Threads | Premium Apparel",
    template: "%s | Luma Threads",
  },
  description:
    "Luma Threads - Everyday essentials with utilitarian sensibility. Perfect for the modern wardrobe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="js" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <div className="site-shell">
              <Header />
              <CartDrawer />
              <main id="MainContent" className="content-for-layout focus-none" tabIndex={-1}>
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
