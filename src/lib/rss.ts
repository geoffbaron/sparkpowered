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

// Fallback thumbnails by category (Unsplash)
const FALLBACK: Record<RSSArticle["category"], string> = {
  ev:      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=75&auto=format&fit=crop",
  solar:   "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=75&auto=format&fit=crop",
  battery: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop",
};

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
      const thumbnail = extractThumbnail(item) ?? FALLBACK[category];

      articles.push({ title, description, url, publishedAt, thumbnail, source: feed.source, category });
    }

    return articles.slice(0, 6); // max 6 per feed
  } catch {
    return [];
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchAllNews(): Promise<RSSArticle[]> {
  const settled = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all = settled
    .filter((r): r is PromiseFulfilledResult<RSSArticle[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Sort newest first, cap at 12
  return all
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 12);
}
