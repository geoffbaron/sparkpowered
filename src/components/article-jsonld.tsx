import { AUTHOR_REF, JsonLd, url } from "@/lib/seo";

/** Article structured data credited to Geoff, with dates carrying a timezone. */
export function ArticleJsonLd({ path, headline, description, published, modified }: { path: string; headline: string; description: string; published: string; modified: string }) {
  const at = (d: string) => `${d}T12:00:00+00:00`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url(path)}#article`,
        headline,
        description,
        url: url(path),
        datePublished: at(published),
        dateModified: at(modified),
        author: AUTHOR_REF,
        publisher: { "@id": url("/#organization") },
        isPartOf: { "@id": url("/#website") },
        mainEntityOfPage: url(path),
      }}
    />
  );
}
