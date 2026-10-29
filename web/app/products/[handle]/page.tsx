import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/ProductDetailView";
import { ProductCarousel } from "@/components/ProductCarousel";
import { getAllProducts, getProduct, getProductAsync, getAllProductsAsync } from "@/lib/catalog";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ color?: string; size?: string }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { handle } = await params;
  let { color } = (await searchParams) || {};
  const product = (await getProductAsync(handle)) || getProduct(handle);
  if (product && !color && product.swatches) {
    const matchedSwatch = product.swatches.find(
      (s) =>
        s.handle?.toLowerCase() === handle.toLowerCase() ||
        s.name?.toLowerCase() === handle.toLowerCase()
    );
    if (matchedSwatch) {
      color = matchedSwatch.name;
    }
  }
  const title = color && product ? `${product.title.split(" - ")[0]} - ${color}` : (product?.title ?? "Product");
  return {
    title,
    description: product?.description ?? "Pistola Denim premium piece.",
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { handle } = await params;
  let { color, size } = (await searchParams) || {};
  const product = await getProductAsync(handle);
  if (!product) notFound();

  // If color was not passed in searchParams, but handle was a swatch handle or colorway name
  if (!color && product.swatches && product.swatches.length > 0) {
    const matchedSwatch = product.swatches.find(
      (s) =>
        s.handle?.toLowerCase() === handle.toLowerCase() ||
        s.name?.toLowerCase() === handle.toLowerCase()
    );
    if (matchedSwatch) {
      color = matchedSwatch.name;
    }
  }

  const all = await getAllProductsAsync();
  const related = all
    .filter((item) => item.handle !== product.handle)
    .slice(0, 8);

  return (
    <>
      <ProductDetailView product={product} initialColor={color} initialSize={size} />

      {/* Recommended Carousel */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "4rem" }}>
        <ProductCarousel
          title="YOU MAY ALSO LIKE"
          subtitle="COMPLETE THE LOOK"
          products={related}
        />
      </div>
    </>
  );
}
