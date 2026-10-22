import { allEndingFigures } from "@/lib/solartopia/ending";

const body = JSON.stringify(allEndingFigures());

/** Per-state figures for the Solartopia ending. Same for everyone, so cache it. */
export function GET() {
  return new Response(body, {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=3600, s-maxage=86400" },
  });
}
