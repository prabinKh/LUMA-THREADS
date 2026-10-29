"use client";

import { useState } from "react";
import { CollectionFilters } from "./CollectionFilters";
import { ProductGrid } from "./ProductGrid";
import type { Product } from "@/lib/types";

export function CollectionClientView({ initialProducts }: { initialProducts: Product[] }) {
  const [displayed, setDisplayed] = useState<Product[]>(initialProducts);

  return (
    <>
      <CollectionFilters products={initialProducts} onFiltered={setDisplayed} />
      <ProductGrid products={displayed} />
    </>
  );
}

