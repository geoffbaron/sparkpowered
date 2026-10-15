import { cacheLife } from "next/cache";

/**
 * A headline from a publisher's RSS feed. We keep only what is needed to link
 * out with attribution: no article text and no images are republished (see the
 * news policy on /about).
 */
export interface RSSArticle {
  title: string;
  /** Used only for categorising and the Tesla filter; never rendered. */
  description: string;
  url: string;
  publishedAt: string; // YYYY-MM-DD
  source: string;
  sourceUrl: string;
  category: "ev" | "solar" | "battery";
}

export const FEEDS = [
  { url: "https://electrek.co/feed/",            source: "Electrek",          home: "https://electrek.co" },
  { url: "https://cleantechnica.com/feed/",      source: "CleanTechnica",     home: "https://cleantechnica.com" },
  { url: "https://insideevs.com/rss/articles/all/",  source: "InsideEVs",         home: "https://insideevs.com" },
  { url: "https://www.solarpowerworldonline.com/feed/",    source: "Solar Power World", home: "https://www.solarpowerworldonline.com" },
];

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

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<RSSArticle[]> {
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

      const parsed = new Date(pubDateStr);
      if (Number.isNaN(parsed.getTime())) continue;
      const publishedAt = parsed.toISOString().slice(0, 10);

      if (!/^https?:\/\//.test(url)) continue;
      const category = categorize(title, description);
      articles.push({ title, description, url, publishedAt, source: feed.source, sourceUrl: feed.home, category });
    }

    return articles.slice(0, 6); // max 6 per feed
  } catch {
    return [];
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchAllNews(limit = 12): Promise<RSSArticle[]> {
  "use cache";
  cacheLife("hours");

  const settled = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all = settled
    .filter((r): r is PromiseFulfilledResult<RSSArticle[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Newest first
  return all
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
