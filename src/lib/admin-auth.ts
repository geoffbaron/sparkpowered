/**
 * Admin session token. The cookie used to hold the admin password itself; it
 * now holds an HMAC derived from it, so a leaked cookie or log line never
 * reveals the password. Changing ADMIN_PASSWORD signs everyone out.
 */
export const ADMIN_COOKIE = "admin_auth";

export async function adminToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("spark-powered-admin-v1"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Length-safe constant-time string comparison. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAdminToken(token: string | undefined) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  return safeEqual(token, await adminToken(password));
}

/** Only allow same-site relative redirects after login (blocks open redirects). */
export function safeNext(next: string | null) {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}
