export type ProductSwatch = {
  name: string;
  color: string;
  handle: string;
  image?: string;
  hoverImage?: string;
  images?: string[];
  price?: number | string;
  priceFormatted?: string;
  sizes?: string[];
};

export type Product = {
  handle: string;
  title: string;
  colorway?: string;
  color?: string;
  price: number | string;
  priceFormatted: string;
  image?: string;
  hoverImage?: string;
  images: string[];
  badge?: string;
  description?: string;
  sizeAndFit?: string;
  care?: string;
  sizes: string[];
  details: string[];
  swatches?: ProductSwatch[];
};

export type Collection = {
  handle?: string;
  title: string;
  description?: string;
  products: string[];
};

export type Catalog = {
  hero: {
    desktop: string;
    mobile: string;
    title?: string;
    subtitle?: string;
    cta: string;
    ctaHref: string;
  };
  bannerHoliday?: {
    image: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaHref: string;
  };
  bannerIcons?: {
    image: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaHref: string;
  };
  manifesto?: {
    heading: string;
    body: string;
  };
  categories: { title: string; image: string; href: string }[];
  editorial?: {
    image: string;
    title: string;
    products: string[];
  };
  homeProducts?: string[];
  collections: Record<string, Collection>;
  products: Record<string, Product>;
  about: {
    heading: string;
    subheading: string;
    image: string;
    paragraphs: string[];
    values?: { title: string; desc: string }[];
  };
};
