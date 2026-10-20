// Builds src/data/us-ip-states.bin: a compact table of US IP ranges -> state.
//
// Source: the GeoLite2 city data that ships inside the geoip-lite npm package.
// It is installed only when refreshing (npm run data:ip), never on the server. Loading geoip-lite at runtime costs about 110 MB of
// memory; this table keeps only US ranges, merged by state, so the live site
// needs a few MB and no third-party calls.
//
// Run: npm run data:ip   (a few times a year, to pick up new GeoLite2 data)
//
// File layout (all big-endian):
//   "SPIP" magic, u8 version=1, u8 stateCount, stateCount x 2-byte codes,
//   u32 n4, n4 x (u32 start, u32 end, u8 state),
//   u32 n6, n6 x (u32 startHi, u32 startLo, u32 endHi, u32 endLo, u8 state)
// IPv6 ranges use the top 64 bits of the address, as geoip-lite does.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dataDir = join(dirname(require.resolve("geoip-lite/package.json")), "data");
const states = JSON.parse(readFileSync(new URL("../src/data/state-energy.json", import.meta.url), "utf8")).states.map((s) => s.abbr);
const stateIdx = new Map(states.map((a, i) => [a, i]));

const names = readFileSync(join(dataDir, "geoip-city-names.dat"));
const LOC = 88;
function stateOf(locId) {
  if (locId === 0xffffffff) return -1;
  const o = locId * LOC;
  if (names.toString("utf8", o, o + 2) !== "US") return -1;
  const region = names.toString("utf8", o + 2, o + 5).replace(/\0.*$/, "");
  return stateIdx.has(region) ? stateIdx.get(region) : -1;
}

// IPv4: 24-byte records (start, end, locId, lat, lon, area).
const v4 = readFileSync(join(dataDir, "geoip-city.dat"));
const r4 = [];
for (let off = 0; off < v4.length; off += 24) {
  const s = stateOf(v4.readUInt32BE(off + 8));
  if (s < 0) continue;
  const start = v4.readUInt32BE(off);
  const end = v4.readUInt32BE(off + 4);
  const last = r4[r4.length - 1];
  if (last && last[2] === s && last[1] + 1 === start) last[1] = end;
  else r4.push([start, end, s]);
}

// IPv6: 48-byte records (start 16 bytes, end 16 bytes, locId, ...); compare the top 64 bits.
const v6 = readFileSync(join(dataDir, "geoip-city6.dat"));
const r6 = [];
const big = (b, o) => (BigInt(b.readUInt32BE(o)) << 32n) | BigInt(b.readUInt32BE(o + 4));
for (let off = 0; off < v6.length; off += 48) {
  const s = stateOf(v6.readUInt32BE(off + 32));
  if (s < 0) continue;
  const start = big(v6, off);
  const end = big(v6, off + 16);
  const last = r6[r6.length - 1];
  if (last && last[2] === s && last[1] + 1n === start) last[1] = end;
  else r6.push([start, end, s]);
}

const size = 4 + 2 + states.length * 2 + 4 + r4.length * 9 + 4 + r6.length * 17;
const out = Buffer.alloc(size);
let p = out.write("SPIP", 0, "latin1");
p = out.writeUInt8(1, p);
p = out.writeUInt8(states.length, p);
for (const a of states) p += out.write(a, p, "latin1");
p = out.writeUInt32BE(r4.length, p);
for (const [s, e, i] of r4) {
  p = out.writeUInt32BE(s, p);
  p = out.writeUInt32BE(e, p);
  p = out.writeUInt8(i, p);
}
p = out.writeUInt32BE(r6.length, p);
const M = 0xffffffffn;
for (const [s, e, i] of r6) {
  p = out.writeUInt32BE(Number(s >> 32n), p);
  p = out.writeUInt32BE(Number(s & M), p);
  p = out.writeUInt32BE(Number(e >> 32n), p);
  p = out.writeUInt32BE(Number(e & M), p);
  p = out.writeUInt8(i, p);
}
writeFileSync(new URL("../src/data/us-ip-states.bin", import.meta.url), out);
console.log(`us-ip-states.bin: ${r4.length} IPv4 and ${r6.length} IPv6 ranges, ${(size / 1e6).toFixed(1)} MB`);
