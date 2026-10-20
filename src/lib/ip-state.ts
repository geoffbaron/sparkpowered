import { readFileSync } from "node:fs";
import { isIPv4, isIPv6 } from "node:net";
import { join } from "node:path";

/**
 * Estimates a visitor's US state from their IP address using the offline table
 * in src/data/us-ip-states.bin (built by scripts/build_ip_states.mjs from the
 * GeoLite2 data in geoip-lite). Nothing is sent anywhere, and the IP is never
 * stored or logged: it is looked up and dropped.
 */

export interface IpTable {
  states: string[];
  v4: { start: Uint32Array; end: Uint32Array; state: Uint8Array };
  v6: { start: BigUint64Array; end: BigUint64Array; state: Uint8Array };
}

export function parseTable(buf: Buffer): IpTable {
  if (buf.toString("latin1", 0, 4) !== "SPIP" || buf.readUInt8(4) !== 1) throw new Error("us-ip-states.bin: bad header");
  const count = buf.readUInt8(5);
  let p = 6;
  const states: string[] = [];
  for (let i = 0; i < count; i++, p += 2) states.push(buf.toString("latin1", p, p + 2));
  const n4 = buf.readUInt32BE(p);
  p += 4;
  const v4 = { start: new Uint32Array(n4), end: new Uint32Array(n4), state: new Uint8Array(n4) };
  for (let i = 0; i < n4; i++, p += 9) {
    v4.start[i] = buf.readUInt32BE(p);
    v4.end[i] = buf.readUInt32BE(p + 4);
    v4.state[i] = buf.readUInt8(p + 8);
  }
  const n6 = buf.readUInt32BE(p);
  p += 4;
  const v6 = { start: new BigUint64Array(n6), end: new BigUint64Array(n6), state: new Uint8Array(n6) };
  for (let i = 0; i < n6; i++, p += 17) {
    v6.start[i] = buf.readBigUInt64BE(p);
    v6.end[i] = buf.readBigUInt64BE(p + 8);
    v6.state[i] = buf.readUInt8(p + 16);
  }
  return { states, v4, v6 };
}

function find<T extends number | bigint>(start: ArrayLike<T>, end: ArrayLike<T>, ip: T): number {
  let lo = 0;
  let hi = start.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (ip < start[mid]) hi = mid - 1;
    else if (ip > end[mid]) lo = mid + 1;
    else return mid;
  }
  return -1;
}

function v4ToInt(ip: string): number {
  return ip.split(".").reduce((n, o) => n * 256 + Number(o), 0);
}

/** Top 64 bits of an IPv6 address. */
function v6Prefix(ip: string): bigint {
  const [head, tail = ""] = ip.split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...h, ...Array(8 - h.length - t.length).fill("0"), ...t] : h;
  return groups.slice(0, 4).reduce((n, g) => (n << BigInt(16)) | BigInt(parseInt(g || "0", 16)), BigInt(0));
}

/** Cleans one client address: strips ports, brackets and the IPv4-mapped IPv6 prefix. */
export function normalizeIp(raw: string | null | undefined): string | null {
  let ip = (raw ?? "").trim();
  if (!ip) return null;
  const bracket = ip.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracket) ip = bracket[1];
  else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.replace(/:\d+$/, "");
  ip = ip.replace(/%.*$/, "");
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) ip = mapped[1];
  return isIPv4(ip) || isIPv6(ip) ? ip : null;
}

/** The client address from proxy headers (Railway's edge sets X-Forwarded-For). */
export function clientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = normalizeIp(xff.split(",")[0]);
    if (first) return first;
  }
  return normalizeIp(headers.get("x-real-ip"));
}

export function stateForIp(table: IpTable, rawIp: string | null | undefined): string | null {
  const ip = normalizeIp(rawIp);
  if (!ip) return null;
  if (isIPv4(ip)) {
    const i = find(table.v4.start, table.v4.end, v4ToInt(ip));
    return i < 0 ? null : table.states[table.v4.state[i]];
  }
  const i = find(table.v6.start, table.v6.end, v6Prefix(ip));
  return i < 0 ? null : table.states[table.v6.state[i]];
}

let cached: IpTable | null = null;

export function ipTable(): IpTable {
  cached ??= parseTable(readFileSync(join(process.cwd(), "src/data/us-ip-states.bin")));
  return cached;
}

export function lookupState(rawIp: string | null | undefined): string | null {
  return stateForIp(ipTable(), rawIp);
}
