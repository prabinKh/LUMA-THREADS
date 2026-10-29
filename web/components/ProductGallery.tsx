"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="img-fallback gallery-main" />;
  }

  return (
    <div className="gallery">
      <div className="gallery-thumbs">
        {images.map((image, index) => (
          <button
            key={image + index}
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
            type="button"
          >
            <Image src={image} alt="" width={160} height={210} />
          </button>
        ))}
      </div>
      <div className="gallery-main">
        <Image src={current} alt={title} width={1200} height={1600} priority />
      </div>
    </div>
  );
}
