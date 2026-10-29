"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  return (
    <form
      className="add-to-cart"
      onSubmit={(event) => {
        event.preventDefault();
        addItem(product, size);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <fieldset>
        <legend>Size</legend>
        <div className="size-row">
          {product.sizes.map((value) => (
            <label key={value} className={value === size ? "selected" : ""}>
              <input
                type="radio"
                name="size"
                value={value}
                checked={value === size}
                onChange={() => setSize(value)}
              />
              {value}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit">{added ? "Added to cart" : "Add to cart"}</button>
    </form>
  );
}
