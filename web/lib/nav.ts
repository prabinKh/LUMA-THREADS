export const NAV_LINKS = [
  { href: "/collections/all-new", label: "New" },
  { href: "/collections/all-denim", label: "Denim" },
  { href: "/collections/best-sellers", label: "Best Sellers" },
  { href: "/collections/sale", label: "Sale" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Help",
    links: [
      { href: "/about", label: "Customer Care" },
      { href: "/collections/all-denim", label: "Denim Fit Guide" },
      { href: "/about", label: "Shipping Guidelines" },
      { href: "/cart", label: "Tracking" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/pages/about-us", label: "Contact Us" },
      { href: "/collections/best-sellers", label: "Lookbook" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/collections/all-new", label: "All New" },
      { href: "/collections/all-denim", label: "All Denim" },
      { href: "/collections/best-sellers", label: "Best Sellers" },
      { href: "/search", label: "Search" },
    ],
  },
] as const;
