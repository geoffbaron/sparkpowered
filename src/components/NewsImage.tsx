"use client";

// Images are already routed through /api/img which handles fallbacks server-side.
// This component exists purely to suppress the Next.js no-img-element lint rule.
export default function NewsImage({ src, alt }: { src: string | null; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? ""}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  );
}
