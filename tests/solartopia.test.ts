import { test } from "node:test";
import assert from "node:assert/strict";
import plans from "./fixtures/solartopia-plan.json";
import { BUILDINGS, DAYS, JOBS, SIM, SLOTS, SLOT_BY_ID, type JobId } from "../src/data/solartopia";
import {
  DT, TOTAL_STEPS, advance, batteryFraction, buildCheck, cloudSlotIds, create, rng, runDay, slotsForDay, sunAt, type Placements, type Toggle,
} from "../src/lib/solartopia/sim";
import { decodeStars, encodeStars, shareSentence, totalStars } from "../src/lib/solartopia/share";

type Plan = { day: number; placements: Placements; toggles: Toggle[] };
const PLANS = plans as unknown as Plan[];

test("sun curve adds up to about 7.64 per panel per day", () => {
  let total = 0;
  for (let i = 0; i < TOTAL_STEPS; i++) total += sunAt(6 + (i + 0.5) * DT) * DT;
  assert.ok(Math.abs(total - 24 / Math.PI) < 0.01, `total ${total}`);
  assert.equal(sunAt(3), 0);
  assert.equal(sunAt(20), 0);
  assert.ok(Math.abs(sunAt(12) - 1) < 1e-9);
  assert.equal(TOTAL_STEPS, 240);
});

test("30 slots, 16 crates by day 5, cells are unique and clear of the buildings", () => {
  assert.equal(SLOTS.length, 30);
  assert.equal(DAYS[4].crates, 16);
  assert.deepEqual(DAYS.map((d) => d.crates), [4, 8, 10, 12, 16]);
  assert.deepEqual(DAYS.map((d) => d.startCharge), [0.5, 0.5, 0.25, 0.25, 0.25]);
  assert.equal(SIM.breakerFloor, 0.15);
  assert.equal(SLOTS.filter((s) => s.chapter === "village" && s.kind === "roof").length, 6);
  assert.equal(SLOTS.filter((s) => s.chapter === "village" && s.shaded).length, 2);
  assert.equal(SLOTS.filter((s) => s.chapter === "village" && s.kind === "ground").length, 4);
  assert.equal(SLOTS.filter((s) => s.chapter === "town").length, 8);
  assert.equal(SLOTS.filter((s) => s.chapter === "city" && s.kind === "roof").length, 10);
  assert.equal(SLOTS.filter((s) => s.chapter === "city" && s.kind === "ground").length, 2);
  const cells = [...SLOTS.map((s) => `${s.c},${s.r}`), ...Object.values(BUILDINGS).map((b) => `${b.c},${b.r}`), "2,2", "6,4"];
  assert.equal(new Set(cells).size, cells.length);
  for (const s of SLOTS) assert.ok(s.c >= 0 && s.c <= 6 && s.r >= 0 && s.r <= 5);
});

test("seeded random is deterministic", () => {
  const a = rng(42);
  const b = rng(42);
  for (let i = 0; i < 50; i++) assert.equal(a(), b());
  assert.notEqual(rng(1)(), rng(2)());
});

test("same plan, same day, byte for byte", () => {
  for (const p of PLANS) {
    const a = runDay(p.day, p.placements, p.toggles);
    const b = runDay(p.day, p.placements, p.toggles);
    assert.deepEqual(a.result, b.result);
    assert.equal(JSON.stringify(a.state), JSON.stringify(b.state));
  }
});

test("battery stays within bounds and nothing is NaN, whatever the player does", () => {
  const r = rng(7);
  const flex = Object.values(JOBS).filter((j) => j.kind === "flex").map((j) => j.id);
  for (let trial = 0; trial < 60; trial++) {
    const day = 1 + Math.floor(r() * 5);
    const slots = slotsForDay(day);
    const placements: Placements = {};
    let crates = DAYS[day - 1].crates;
    for (const s of slots) {
      if (r() < 0.6 && crates > 0) {
        const battery = r() < 0.3 && crates >= 2;
        placements[s.id] = battery ? "battery" : "panel";
        crates -= battery ? 2 : 1;
      }
    }
    const s = create(day, placements);
    while (s.step < TOTAL_STEPS) {
      if (r() < 0.08) {
        const id = flex[Math.floor(r() * flex.length)] as JobId;
        if (s.active.includes(id)) {
          const j = s.jobs[id];
          if (!j.done) {
            j.tripped = false;
            j.on = !j.on;
            j.order = ++s.switchCount;
          }
        }
      }
      advance(s);
      assert.ok(Number.isFinite(s.battery) && s.battery >= -1e-9 && s.battery <= s.cap + 1e-9, `battery ${s.battery} of ${s.cap}`);
      for (const k of Object.keys(s.jobs) as JobId[]) assert.ok(Number.isFinite(s.jobs[k].progress) && Number.isFinite(s.jobs[k].powered));
      assert.ok(Number.isFinite(s.flow.toLoads) && Number.isFinite(s.wasted) && Number.isFinite(s.lost));
    }
    assert.ok(batteryFraction(s) >= 0 && batteryFraction(s) <= 1 + 1e-9);
  }
});

test("the recommended plan earns 1 and 2 stars every day, within the 75% margin", () => {
  for (const p of PLANS) {
    const crates = Object.values(p.placements).reduce((n, k) => n + (k === "panel" ? SIM.panelCost : SIM.batteryCost), 0);
    assert.ok(crates <= DAYS[p.day - 1].crates, `day ${p.day} spends ${crates} of ${DAYS[p.day - 1].crates}`);
    const open = new Set(slotsForDay(p.day).map((s) => s.id));
    for (const id of Object.keys(p.placements)) assert.ok(open.has(id), `day ${p.day}: slot ${id} is not open yet`);
    const { result } = runDay(p.day, p.placements, p.toggles);
    assert.ok(result.met, `day ${p.day} requirements: ${JSON.stringify(result.requirements)}`);
    assert.ok(result.stars >= 2, `day ${p.day} stars ${result.stars}`);
    assert.equal(result.breakerTrips, 0);
    assert.ok(result.utilisation <= SIM.marginRule, `day ${p.day} used ${(result.utilisation * 100).toFixed(0)}% of panel energy`);
    if (p.day >= 3) assert.ok(result.utilisation >= SIM.marginFloor, `day ${p.day} used only ${(result.utilisation * 100).toFixed(0)}% (build is oversized)`);
    assert.equal(result.stars, 3, `day ${p.day}: a staggered, thoughtful plan earns 3 stars`);
  }
});

const FLEX: Record<number, JobId[]> = { 1: ["pump"], 2: ["pump"], 3: ["pump"], 4: ["pump", "irrigation"], 5: ["pump", "irrigation", "bus"] };
const allAt = (day: number, h: number): Toggle[] => FLEX[day].map((job) => ({ h, job, on: true }));

test("careless plans never warm the fridge, and on days 3-5 they earn at most 1 star", () => {
  for (const p of PLANS) {
    for (const h of [6, 12]) {
      const { state, result } = runDay(p.day, p.placements, allAt(p.day, h));
      assert.equal(state.jobs.fridge.darkHours, 0, `day ${p.day}, everything on at ${h}:00`);
      if (p.day >= 3) assert.ok(result.stars <= 1, `day ${p.day}, everything on at ${h}:00 got ${result.stars} stars`);
    }
  }
  // Everything on at sunrise trips the breaker on the later days.
  for (const p of PLANS.slice(2)) assert.ok(runDay(p.day, p.placements, allAt(p.day, 6)).state.breakerTrips >= 1, `day ${p.day}`);
});

test("days 1 and 2 stay gentle", () => {
  for (const p of PLANS.slice(0, 2)) {
    assert.ok(runDay(p.day, p.placements, allAt(p.day, 6)).result.stars >= 2);
    assert.ok(runDay(p.day, p.placements, allAt(p.day, 12)).result.stars >= 2);
  }
});

test("charging the buses in the sun earns 3 stars; charging them at night drains the jar (the trap)", () => {
  const p = PLANS[4];
  const run = (busAt: number) =>
    runDay(5, p.placements, [
      { h: 8, job: "pump", on: true },
      { h: 10, job: "irrigation", on: true },
      { h: busAt, job: "bus", on: true },
    ]).result;
  assert.equal(run(12).stars, 3);
  const night = run(22);
  assert.ok(night.batteryEnd < SIM.threeStarBattery, `jar ended at ${night.batteryEnd}`);
  assert.ok(night.stars < 3);
});

test("clouds never cover more than half the slots", () => {
  for (const d of DAYS) {
    if (!d.cloud) continue;
    const ids = slotsForDay(d.n).map((s) => s.id);
    const covered = cloudSlotIds(d.n, ids);
    assert.ok(covered.length > 0 && covered.length <= ids.length / 2, `day ${d.n}: ${covered.length} of ${ids.length}`);
    for (const id of covered) assert.ok(d.cloud.cols.includes(SLOT_BY_ID[id].c));
  }
  assert.deepEqual(DAYS[3].cloud && [DAYS[3].cloud.start, DAYS[3].cloud.end], [13, 16]);
  assert.deepEqual(DAYS[4].cloud && [DAYS[4].cloud.start, DAYS[4].cloud.end], [10, 11.5]);
});

test("the breaker trips instead of draining the jar to zero", () => {
  const placements: Placements = { v1: "panel", g3: "battery", g4: "battery" };
  const { state, result } = runDay(3, placements, [{ h: 6, job: "pump", on: true }]);
  assert.ok(state.battery >= SIM.breakerFloor * state.cap - 1e-6 || state.jobs.fridge.darkHours > 0);
  assert.ok(state.breakerTrips >= 1);
  assert.ok(result.stars < 2);
});

test("share codes round trip and reject junk", () => {
  assert.equal(encodeStars([3, 3, 2, 3, 3]), "33233");
  assert.deepEqual(decodeStars("33233"), [3, 3, 2, 3, 3]);
  for (const bad of ["", "3323", "332334", "33a33", "44444", "-3233"]) assert.equal(decodeStars(bad), null);
  assert.equal(totalStars([3, 3, 2, 3, 3]), 14);
  assert.match(shareSentence([3, 3, 2, 3, 3]), /14 of 15 stars/);
});

test("the build strip tells the truth: green for the good builds, red for empty or jarless ones", () => {
  for (const p of PLANS) assert.equal(buildCheck(p.day, p.placements).status, "green", `day ${p.day}`);
  assert.equal(buildCheck(1, {}).status, "red");
  const noJar: Placements = { v1: "panel", v4: "panel", v5: "panel", v6: "panel", g1: "panel", g2: "panel" };
  const c = buildCheck(2, noJar);
  assert.equal(c.status, "red");
  assert.match(c.text, /fridge goes dark|No battery jar/);
  const one = buildCheck(3, { ...PLANS[2].placements, g4: "panel" });
  assert.ok(one.nightHours >= 0 && one.nightHours <= 12 && Number.isFinite(one.sunCover));
  assert.equal(buildCheck(3, PLANS[2].placements).showNight, true);
  assert.equal(buildCheck(5, PLANS[4].placements).showNight, false);
});

test("share and ending wording follows what the player achieved", () => {
  assert.match(shareSentence([3, 3, 3, 3, 3]), /village of 1,200 people, then a town of 12,000 and a city of 400,000\. 15 of 15 stars/);
  assert.match(shareSentence([2, 1, 0, 0, 0]), /lit up 2 of 5 days.*3 of 15 stars/);
  assert.match(shareSentence([0, 0, 0, 0, 0]), /tried Solartopia.*0 of 15/);
  assert.match(shareSentence([3, 3, 3, 3, 3], "third"), /^Someone powered/);
  assert.doesNotMatch(shareSentence([0, 0, 0, 0, 0]), /powered/);
});
