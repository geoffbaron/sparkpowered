import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SOLAR_TO_BATTERY_VIDEO, videoLd } from "@/components/HowToVideo";

test("self-hosted how-to video files exist and the markup is complete", () => {
  const v = SOLAR_TO_BATTERY_VIDEO;
  const mp4 = fs.statSync(path.join(process.cwd(), "public/videos", `${v.slug}.mp4`)).size;
  const jpg = fs.statSync(path.join(process.cwd(), "public/videos", `${v.slug}.jpg`)).size;
  assert.ok(mp4 > 200_000 && mp4 < 4_000_000, `mp4 is ${mp4} bytes`);
  assert.ok(jpg > 10_000 && jpg < 400_000, `poster is ${jpg} bytes`);
  const ld = videoLd(v);
  for (const k of ["name", "description", "thumbnailUrl", "uploadDate", "contentUrl", "duration"] as const) assert.ok(ld[k], `missing ${k}`);
  assert.match(ld.contentUrl, /^https:\/\/.+\/videos\/solar-to-battery\.mp4$/);
});
