import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#666" }}>
        <p>No products found in this collection.</p>
      </div>
    );
  }

  return (
    <div className="product-grid-4-col">
      {products.map((product) => (
        <ProductCard key={product.handle} product={product} />
      ))}
    </div>
  );
}
