"use client";

import { useState } from "react";

const FALLBACKS: Record<"ev" | "solar" | "battery", string[]> = {
  ev: [
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571987502951-3cc4c4d76cc4?w=600&q=75&auto=format&fit=crop",
  ],
  solar: [
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548348384-a82d027b70f0?w=600&q=75&auto=format&fit=crop",
  ],
  battery: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620714223084-8fcacc2dfd03?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=75&auto=format&fit=crop",
  ],
};

function pickFallback(category: "ev" | "solar" | "battery", url: string): string {
  const pool = FALLBACKS[category];
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

export default function NewsImage({
  src,
  alt,
  category,
  articleUrl,
}: {
  src: string | null;
  alt: string;
  category: "ev" | "solar" | "battery";
  articleUrl: string;
}) {
  const fallback = pickFallback(category, articleUrl);
  const [imgSrc, setImgSrc] = useState(src && src !== "" ? src : fallback);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setImgSrc(fallback)}
    />
  );
}
