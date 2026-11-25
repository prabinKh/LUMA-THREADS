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
  id?: string | number;
  handle: string;
  title: string;
  name?: string;
  colorway?: string;
  color?: string;
  price: number | string;
  priceFormatted?: string;
  image?: string;
  hoverImage?: string;
  images?: string[];
  badge?: string;
  description?: string;
  sizeAndFit?: string;
  care?: string;
  sizes?: string[];
  details?: string[];
  swatches?: ProductSwatch[];
  category?: string;
  categorySlug?: string;
  category_name?: string;
  category_slug?: string;
  brand?: string;
  brand_name?: string;
  stock?: number;
  is_active?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SubCategory = {
  id?: string | number;
  title?: string;
  name?: string;
  slug?: string;
  handle?: string;
  description?: string;
  order?: number;
};

export type Category = {
  id?: string | number;
  title?: string;
  name?: string;
  slug?: string;
  handle?: string;
  icon?: string;
  image?: string;
  description?: string;
  order?: number;
  subcategories?: SubCategory[];
  brands?: string[];
  sections?: { title: string; items: { name: string; slug: string }[] }[];
  updatedAt?: string;
};

export type Brand = {
  id?: number | string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  categories?: any[];
  category_ids?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Company = {
  id?: string;
  name: string;
  slug: string;
  theme_color?: string;
  category?: string;
  logo?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
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
