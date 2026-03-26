import { cacheLife } from "next/cache";

export interface RSSArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string; // YYYY-MM-DD
  thumbnail: string | null;
  source: string;
  category: "ev" | "solar" | "battery";
}

const FEEDS = [
  { url: "https://electrek.co/feed/",              source: "Electrek" },
  { url: "https://cleantechnica.com/feed/",        source: "CleanTechnica" },
  { url: "https://insideevs.com/rss/articles/",   source: "InsideEVs" },
  { url: "https://solarpowerworld.com/feed/",      source: "Solar Power World" },
];

// Fallback thumbnail pools — large enough that nearby articles rarely share an image.
// Images are intentionally varied: charging stations, roads, panels, hardware, etc.
const FALLBACKS: Record<RSSArticle["category"], string[]> = {
  ev: [
    // charging stations / infrastructure
    "https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1637073849667-8b31a36c2c46?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620714223084-8fcacc2dfd03?w=600&q=75&auto=format&fit=crop",
    // cars on roads
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571987502951-3cc4c4d76cc4?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=75&auto=format&fit=crop",
    // city / highway / wide shots
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520340232233-b2b6f8c5b8e5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543992321-ceb529d28e5e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=75&auto=format&fit=crop",
  ],
  solar: [
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548348384-a82d027b70f0?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592833167-279d9b0cdb41?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508615263367-5bf4b59bdeaa?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540703432-4c764a8e68d9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1572970897457-a4c19f07b0c3?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545208702-18d44aa7e5d9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=75&auto=format&fit=crop",
  ],
  battery: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601837992973-afa6a31e6ee0?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624958223898-4bdd421fa1a8?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625535069654-cfeb8f829088?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620714223084-8fcacc2dfd03?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584677626646-7c8f83690304?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565339119519-7a37ce14f619?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547393429-552a5d8c9bce?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&q=75&auto=format&fit=crop",
  ],
};

/**
 * Pick a fallback image deterministically.
 * @param index article position in the feed — mixed with the URL hash so
 *              adjacent articles never land on the same pool entry.
 */
function pickFallback(
  category: RSSArticle["category"],
  url: string,
  index: number = 0
): string {
  const pool = FALLBACKS[category];
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
  return pool[(hash + index) % pool.length];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract the text content of the first matching XML tag (handles CDATA). */
function extractTag(xml: string, tag: string): string {
  // Escape any regex special chars in the tag name (e.g. "content:encoded")
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(":", "\\:");
  const re = new RegExp(
    `<${escaped}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${escaped}>`,
    "i"
  );
  const m = re.exec(xml);
  if (!m) return "";
  return ((m[1] ?? m[2]) || "").trim();
}

/** Extract the article URL from an RSS <item>. */
function extractLink(xml: string): string {
  // Standard: <link>https://...</link>
  const m = /<link>([^<]+)<\/link>/i.exec(xml);
  if (m) return m[1].trim();
  // Atom style: <link rel="alternate" href="..."/>
  const m2 = /<link[^>]+href="([^"]+)"/i.exec(xml);
  if (m2) return m2[1].trim();
  return "";
}

/** Extract the best available thumbnail URL from an RSS <item>. */
function extractThumbnail(xml: string): string | null {
  // media:content url="..." (skip gifs and tiny icons)
  let m = /media:content[^>]+url="([^"]+)"/i.exec(xml);
  if (m && isUsableImage(m[1])) return m[1];

  // media:thumbnail
  m = /media:thumbnail[^>]+url="([^"]+)"/i.exec(xml);
  if (m && isUsableImage(m[1])) return m[1];

  // enclosure with image mime
  m = /enclosure[^>]+type="image\/[^"]*"[^>]+url="([^"]+)"/i.exec(xml);
  if (m && isUsableImage(m[1])) return m[1];
  m = /enclosure[^>]+url="([^"]+)"[^>]+type="image\//i.exec(xml);
  if (m && isUsableImage(m[1])) return m[1];

  // First <img> in description or content:encoded
  const body = extractTag(xml, "content:encoded") || extractTag(xml, "description");
  const imgM = /<img[^>]+src="([^"]+)"/i.exec(body);
  if (imgM && isUsableImage(imgM[1])) return imgM[1];

  return null;
}

function isUsableImage(url: string): boolean {
  return !url.includes(".gif") && !url.includes("pixel") && url.startsWith("http");
}

/** Wrap a thumbnail URL in our server-side image proxy so hotlink-blocked
 *  feeds (CleanTechnica, InsideEVs, etc.) are fetched server-to-server. */
function proxyUrl(thumbnailUrl: string, category: RSSArticle["category"]): string {
  return `/api/img?url=${encodeURIComponent(thumbnailUrl)}&cat=${category}`;
}

/** Strip HTML tags and decode common entities. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201c")
    .replace(/&#8221;/g, "\u201d")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Classify an article into one of three categories by keyword matching. */
function categorize(title: string, desc: string): RSSArticle["category"] {
  const text = (title + " " + desc).toLowerCase();
  if (/\bbatter(y|ies)\b|energy storage|powerwall|\bkwh\b|grid storage|home storage|sodium.ion/.test(text)) {
    return "battery";
  }
  if (/\bsolar\b|photovoltaic|\bpv\b|rooftop|solar panel|solar farm|solar power|clean energy/.test(text)) {
    return "solar";
  }
  return "ev";
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetchFeed(feed: { url: string; source: string }): Promise<RSSArticle[]> {
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: 3600 }, // cache for 1 hour
      headers: { "User-Agent": "SparkPowered/1.0 RSS Reader (+https://sparkpowered.com)" },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const articles: RSSArticle[] = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRe.exec(xml)) !== null) {
      const item = match[1];
      const title = stripHtml(extractTag(item, "title"));
      const rawDesc = extractTag(item, "description");
      const description = stripHtml(rawDesc).slice(0, 220).trimEnd();
      const url = extractLink(item);
      const pubDateStr = extractTag(item, "pubDate");

      if (!title || !url) continue;

      let publishedAt: string;
      try {
        publishedAt = new Date(pubDateStr).toISOString().slice(0, 10);
      } catch {
        publishedAt = new Date().toISOString().slice(0, 10);
      }

      const category = categorize(title, description);
      const rawThumb = extractThumbnail(item) ?? pickFallback(category, url, articles.length);
      const thumbnail = proxyUrl(rawThumb, category);

      articles.push({ title, description, url, publishedAt, thumbnail, source: feed.source, category });
    }

    return articles.slice(0, 6); // max 6 per feed
  } catch {
    return [];
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchAllNews(): Promise<RSSArticle[]> {
  "use cache";
  cacheLife("hours");

  const settled = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all = settled
    .filter((r): r is PromiseFulfilledResult<RSSArticle[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Sort newest first, cap at 12
  return all
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 12);
}
