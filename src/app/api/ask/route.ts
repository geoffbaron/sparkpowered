import { headers } from "next/headers";
import { connection } from "next/server";
import { clientIp } from "@/lib/ip-state";
import { ask, liveDeps, status, visitorKey } from "@/lib/ask-spark/engine";

/**
 * Ask Spark. GET -> { status: "open" | "resting" | "busy" }.
 * POST { question, history } -> an answer as safe display parts.
 * The API key never leaves the server; the visitor's IP is hashed in memory
 * for rate limits and never stored or logged.
 */

const NO_STORE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

export async function GET() {
  await connection();
  return Response.json({ status: await status(liveDeps()) }, { headers: NO_STORE });
}

/** Only our own pages may post here (browsers always send Origin on a POST). */
function sameSite(origin: string | null, host: string | null) {
  if (!origin) return true;
  try {
    const o = new URL(origin).host;
    return o === host || o === "sparkpowered.com" || o === "www.sparkpowered.com";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const h = await headers();
  if (!sameSite(h.get("origin"), h.get("host"))) {
    return Response.json({ status: "invalid", message: "Not allowed." }, { status: 403, headers: NO_STORE });
  }
  let body: unknown = null;
  try {
    const text = await req.text();
    if (text.length > 20_000) return Response.json({ status: "invalid", message: "That message is too long." }, { status: 413, headers: NO_STORE });
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  const result = await ask(body, visitorKey(clientIp(h) ?? "unknown"), liveDeps());
  const code = result.status === "invalid" ? 400 : result.status === "limited" ? 429 : 200;
  return Response.json(result, { status: code, headers: NO_STORE });
}
