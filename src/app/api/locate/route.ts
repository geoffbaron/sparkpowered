import { headers } from "next/headers";
import { clientIp, lookupState } from "@/lib/ip-state";

/**
 * GET /api/locate -> { state: "TX" | null, country: "US" | null }
 *
 * Estimates the visitor's US state from their connection so calculators can
 * start on local prices. Offline lookup only: the IP is never stored, logged
 * or sent to anyone. Outside the US, or when unsure, both fields are null and
 * the site shows national averages.
 *
 * In development only, ?ip=1.2.3.4 (or DEV_LOCATE_IP) simulates a visitor.
 */
export async function GET(req: Request) {
  const h = await headers();
  let ip = clientIp(h);
  if (process.env.NODE_ENV === "development") {
    ip = new URL(req.url).searchParams.get("ip") ?? process.env.DEV_LOCATE_IP ?? ip;
  }
  let state: string | null = null;
  try {
    state = lookupState(ip);
  } catch {
    state = null;
  }
  return Response.json(
    { state, country: state ? "US" : null },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } },
  );
}
