import { NextRequest, NextResponse } from "next/server";

// Last-resort fallbacks if the upstream fetch fails completely.
// Must be reliable Unsplash CDN URLs — these are served directly to the browser.
const FALLBACKS: Record<string, string[]> = {
  ev: [
    "https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571987502951-3cc4c4d76cc4?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=75&auto=format&fit=crop",
  ],
  solar: [
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548348384-a82d027b70f0?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545208702-18d44aa7e5d9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?w=600&q=75&auto=format&fit=crop",
  ],
  battery: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=75&auto=format&fit=crop",
  ],
};

function pickFallback(cat: string, url: string): string {
  const pool = FALLBACKS[cat] ?? FALLBACKS.ev;
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url") ?? "";
  const cat = request.nextUrl.searchParams.get("cat") ?? "ev";

  if (!url.startsWith("http")) {
    return NextResponse.redirect(pickFallback(cat, url));
  }

  try {
    // Server-to-server fetch bypasses browser hotlink protection
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      next: { revalidate: 86400 }, // Next.js caches the upstream response for 24h
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !contentType.startsWith("image/")) {
      return NextResponse.redirect(pickFallback(cat, url));
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    });
  } catch {
    return NextResponse.redirect(pickFallback(cat, url));
  }
}
