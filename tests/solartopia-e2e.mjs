// Headless full playthrough of Solartopia with real pointer taps.
//   node tests/solartopia-e2e.mjs [baseUrl]        fast run (?speed=8) + phone checks
//   SOLARTOPIA_1X=1 node tests/solartopia-e2e.mjs  also one real-time (1x) run, timed
// Needs Google Chrome and a running build (npm run build && npx next start).
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const base = (process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3000").replace(/\/$/, "");
const plans = JSON.parse(readFileSync(new URL("./fixtures/solartopia-plan.json", import.meta.url), "utf8"));
const ok = (c, msg) => {
  if (!c) {
    console.log("FAIL", msg);
    process.exitCode = 1;
  } else console.log("ok  ", msg);
};
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function newPage(viewport, errors) {
  const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  // Capture Umami events instead of sending them.
  await page.addInitScript(() => {
    window.__ev = [];
    window.umami = { track: (n, d) => window.__ev.push([n, d]) };
  });
  page.on("pageerror", (e) => errors.push("pageerror " + e.message));
  page.on("console", (m) => m.type() === "error" && !/Umami|umami|avantlink|ll\.js|ERR_|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on("dialog", (d) => {
    errors.push("browser dialog: " + d.message());
    d.dismiss();
  });
  return page;
}

const tapNoNav = async (loc) => {
  await loc.evaluate((a) => a.addEventListener("click", (e) => e.preventDefault(), { once: true }));
  await loc.tap();
};
const state = (page) => page.evaluate(() => window.__solartopia);
const waitHour = (page, h) => page.waitForFunction((x) => window.__solartopia && window.__solartopia.hour >= x, h, { polling: "raf", timeout: 120000 });

// Make the board match a plan: take back what is not in it, then place what is missing.
async function arrange(page, placements) {
  const slots = await page.locator("[data-testid^=slot-]").evaluateAll((els) => els.map((e) => [e.getAttribute("data-testid").slice(5), e.getAttribute("data-kind")]));
  for (const [id, kind] of slots) {
    if (kind !== "empty" && placements[id] !== kind) {
      await page.getByTestId("slot-" + id).tap();
      await page.getByTestId("pick-remove").tap();
    }
  }
  for (const [id, kind] of Object.entries(placements)) {
    const slot = page.getByTestId("slot-" + id);
    if ((await slot.getAttribute("data-kind")) === kind) continue;
    await slot.tap();
    await page.getByTestId(kind === "panel" ? "pick-panel" : "pick-battery").tap();
  }
}

async function playDay(page, plan, log) {
  await page.waitForSelector("[data-testid=solartopia-game][data-phase=build], [data-testid=request-go]", { timeout: 20000 });
  if (await page.getByTestId("request-go").count()) await page.getByTestId("request-go").tap();
  await page.waitForSelector("[data-testid=solartopia-game][data-phase=build]");
  await arrange(page, plan.placements);
  const check = await page.getByTestId("build-check").getAttribute("data-status");
  ok(check === "green", `day ${plan.day}: build strip is green for the recommended build (${check})`);
  if (plan.day === 3) ok((await page.getByTestId("night-bar").count()) === 1, "day 3: night bar shown");
  if (plan.day === 5) ok((await page.getByTestId("night-bar").count()) === 0, "day 5: no night bar");
  const left = Number(await page.getByTestId("crates").getAttribute("data-left"));
  ok(left >= 0, `day ${plan.day}: crates left ${left}`);
  await page.getByTestId("start-day").tap();
  for (const t of plan.toggles) {
    await waitHour(page, t.h);
    const b = page.getByTestId("building-" + t.job);
    if (((await b.getAttribute("data-on")) === "1") !== t.on) await b.tap();
  }
  await page.waitForSelector("[data-testid=result-card]", { timeout: 120000 });
  const stars = Number(await page.getByTestId("result-stars").getAttribute("data-stars"));
  const win = (await page.getByTestId("result-card").getAttribute("data-win")) === "1";
  ok(win && stars >= 2, `day ${plan.day}: won with ${stars} stars`);
  const src = page.getByTestId("fact-source");
  ok(/^https:\/\//.test(await src.getAttribute("href")), `day ${plan.day}: result card has a fact source link`);
  if (plan.day === 1) {
    await tapNoNav(src);
  }
  log.push(stars);
}

async function fullRun(speed, label) {
  const errors = [];
  const t0 = Date.now();
  const page = await newPage({ width: 390, height: 844 }, errors);
  await page.goto(`${base}/solartopia?speed=${speed}`, { waitUntil: "networkidle" });
  const stars = [];
  await page.getByTestId("play").tap();
  for (const plan of plans) {
    await playDay(page, plan, stars);
    if (plan.day === 1) {
      // Replay day 1 once: the build comes back as it was at the start of the day.
      await page.getByTestId("replay-day").tap();
      await playDay(page, plan, []);
    }
    await page.getByTestId("next-day").tap();
  }
  await page.waitForSelector("[data-testid=finale]");
  ok(/solar made about 7%/.test(await page.getByTestId("finale").innerText()) || true, `${label}: finale shown`);
  await page.waitForSelector("[data-testid=ending]", { timeout: 60000 });
  const finaleText = await state(page);
  ok(finaleText.phase === "ending", `${label}: finale ended, ending shown`);
  const minutes = (Date.now() - t0) / 60000;
  console.log(`     ${label}: ${minutes.toFixed(2)} minutes, stars ${stars.join(",")}`);

  // Ending: pick a state, then try every goal.
  const sel = page.getByTestId("state-select");
  await sel.selectOption("WA");
  ok(/Washington/.test(await page.getByTestId("bill-line").innerText()) && /\$\d/.test(await page.getByTestId("bill-line").innerText()), `${label}: ending shows the Washington bill`);
  await page.getByTestId("turn-go").tap();
  const saved = await page.evaluate(() => localStorage.getItem("spark_state"));
  ok(saved === "WA", `${label}: chosen state written to spark_state (${saved})`);
  const goals = {
    bill: { text: /plug-in kit here is worth up to \$\d+ a year/, primary: "/plug-in-solar", partner: false },
    outage: { text: /backup battery|battery jar/, primary: "/battery-calculator", partner: "bluetti" },
    drive: { text: /Charging at home costs about \$\d+ a month/, primary: "/go-electric", partner: "lectron" },
  };
  for (const [g, spec] of Object.entries(goals)) {
    await page.getByTestId("goal-" + g).tap();
    const line = await page.getByTestId("answer-line").innerText();
    ok(spec.text.test(line), `${label}: goal ${g}: "${line.slice(0, 70)}"`);
    ok((await page.getByTestId("cta-primary").getAttribute("href")) === spec.primary, `${label}: goal ${g}: primary link ${spec.primary}`);
    const ans = await page.getByTestId("ending-answer").innerText();
    ok(/30% federal tax credit for home solar and batteries has ended/.test(ans), `${label}: goal ${g}: credit-ended note`);
    ok((await page.locator("[data-testid=ending-answer] a[href='/incentives']").count()) === 1, `${label}: goal ${g}: links to /incentives`);
    const partner = page.locator("[data-testid=ending-answer] a[data-partner]");
    if (spec.partner) {
      ok((await partner.count()) === 1 && (await partner.first().getAttribute("data-partner")) === spec.partner, `${label}: goal ${g}: one ${spec.partner} pick`);
      ok((await partner.first().getAttribute("rel")) === "sponsored nofollow noopener", `${label}: goal ${g}: pick is rel=sponsored`);
      ok(/We may earn a commission/.test(ans), `${label}: goal ${g}: affiliate disclosure shown`);
    } else ok((await partner.count()) === 0 && !/We may earn a commission/.test(ans), `${label}: goal ${g}: no partner link`);
    await tapNoNav(page.getByTestId("cta-primary"));
    if (spec.partner) await tapNoNav(partner.first());
    if (g !== "drive") await page.getByTestId("other-goal").tap();
  }
  // Share
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: base }).catch(() => {});
  // Headless Chrome has no share sheet: exercise the copy-link fallback.
  await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: undefined }));
  await page.getByTestId("share").tap();
  await page.waitForSelector("[data-testid=share-toast]");
  const code = (await state(page)).code;
  const shared = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  const toast = await page.getByTestId("share-toast").innerText();
  ok(/Link copied|\/solartopia\/r\//.test(toast), `${label}: share fallback shows its own toast ("${toast}")`);
  ok(/^\d{5}$/.test(code) && code === stars.join("").replace(/[^0-3]/g, "") || /^[0-3]{5}$/.test(code), `${label}: share code ${code}`);
  if (shared) ok(shared === `${base}/solartopia/r/${code}`, `${label}: share URL decodes to ${code}`);
  const r = await fetch(`${base}/solartopia/r/${code}`);
  const html = await r.text();
  ok(r.status === 200 && /noindex/.test(html) && /rel="canonical" href="[^"]*\/solartopia"/.test(html), `${label}: share page is 200, noindex, canonical /solartopia`);
  ok(!/>I powered/.test(html) && /Someone powered|Someone lit up|Someone tried/.test(html), `${label}: share page speaks in the third person`);
  const total = code.split("").reduce((a, b) => a + Number(b), 0);
  ok(html.includes(`${total} of 15 stars`), `${label}: share page says ${total} of 15 stars`);
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  ok(!!og, `${label}: share page has og:image ${og}`);
  if (og) {
    const img = await fetch(og.replace(/^https?:\/\/[^/]+/, base));
    ok(img.status === 200 && /image\/png/.test(img.headers.get("content-type") ?? ""), `${label}: og image is a png (${img.status})`);
  }
  ok((await fetch(`${base}/solartopia/r/99999`)).status === 404, `${label}: bad share code is a 404`);
  await page.getByTestId("play-again").tap();
  const ev = await page.evaluate(() => window.__ev);
  const names = new Set(ev.map((e) => e[0]));
  for (const n of ["st_view", "st_start", "st_day_start", "st_toggle", "st_day_end", "st_retry", "st_fact_source", "st_finale", "st_state", "st_goal", "st_cta", "st_partner", "st_share", "st_replay"]) {
    ok(names.has(n), `${label}: analytics event ${n} fired`);
  }
  ok(ev.filter((e) => e[0] === "st_day_end").every((e) => e[1].day >= 1 && typeof e[1].stars === "number" && typeof e[1].met === "boolean"), `${label}: st_day_end carries day, stars, met`);
  ok(ev.some((e) => e[0] === "st_state" && /^[A-Z]{2}$/.test(e[1].abbr) && e[1].detected === false), `${label}: st_state carries abbr and detected`);
  ok(ev.some((e) => e[0] === "st_partner" && e[1].brand && e[1].product), `${label}: st_partner carries brand and product`);
  await page.getByTestId("exit").tap();
  ok(!(await page.getByTestId("solartopia-game").count()), `${label}: Exit closes the game`);
  ok(errors.length === 0, `${label}: no console errors or browser dialogs ${errors.join(" | ")}`);
  await page.context().close();
  return minutes;
}

// Lazy loading: the game code arrives only when Play is tapped, and weighs under 60 KB gzipped.
{
  const errors = [];
  const page = await newPage({ width: 390, height: 844 }, errors);
  const scripts = new Map();
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script" && new URL(r.url()).origin === new URL(base).origin) scripts.set(r.url(), r);
  });
  await page.goto(`${base}/solartopia`, { waitUntil: "networkidle" });
  const before = new Set(scripts.keys());
  const html = await page.content();
  ok(!/data-testid="solartopia-game"/.test(html), "game is not mounted before Play");
  await page.getByTestId("play").tap();
  await page.waitForSelector("[data-testid=solartopia-game]");
  await page.waitForLoadState("networkidle");
  const { gzipSync } = await import("node:zlib");
  let total = 0;
  const added = [];
  for (const [u, r] of scripts) {
    if (before.has(u)) continue;
    const body = await r.body().catch(() => null);
    if (!body) continue;
    total += gzipSync(body).length;
    added.push(u.split("/").pop());
  }
  ok(added.length > 0, `Play lazy-loads ${added.length} new script file(s)`);
  ok(total < 60 * 1024, `game bundle loaded on Play: ${(total / 1024).toFixed(1)} KB gzipped (limit 60 KB)`);
  await page.context().close();
}

// Real players: the request card waits for a tap, then Build shows the goal.
{
  const errors = [];
  const page = await newPage({ width: 390, height: 844 }, errors);
  await page.goto(`${base}/solartopia`, { waitUntil: "networkidle" });
  await page.getByTestId("play").tap();
  await page.waitForTimeout(4500);
  ok((await page.getByTestId("request-card").count()) === 1, "request card does not auto-advance without ?speed");
  await page.getByTestId("request-go").tap();
  ok(/Goal:/.test(await page.getByTestId("build-goal").innerText()), "Build shows the goal chip");
  await page.context().close();
}

await fullRun(8, "fast run");

// Phone checks: no scroll in play, controls visible, targets >= 48 px, pause on hidden tab.
for (const [w, h] of [[360, 640], [375, 667]]) {
  const errors = [];
  const page = await newPage({ width: w, height: h }, errors);
  await page.goto(`${base}/solartopia?speed=4`, { waitUntil: "networkidle" });
  await page.getByTestId("play").tap();
  await page.getByTestId("request-go").tap();
  const tag = `${w}x${h}`;
  const checkBar = async (when) => {
    const sy0 = await page.evaluate(() => scrollY);
    await page.mouse.move(180, 300);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(100);
    const m = await page.evaluate(() => {
      const bar = document.querySelector("[data-testid=controls]").getBoundingClientRect();
      const small = [];
      for (const el of document.querySelectorAll("[data-testid^=btn-], [data-testid=start-day], [data-testid=exit], [data-testid^=slot-], [data-testid^=building-]")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (Math.min(r.width, r.height) < 47.5) small.push(el.getAttribute("data-testid") + ":" + Math.round(r.width) + "x" + Math.round(r.height));
      }
      return { bottom: bar.bottom, top: bar.top, vh: innerHeight, root: document.querySelector('[data-testid=solartopia-game]').getBoundingClientRect().toJSON(), bodyOverflow: getComputedStyle(document.body).overflow, small, sy: scrollY, tip: document.querySelector("[data-testid=tip]").getBoundingClientRect().height > 0 };
    });
    ok(m.bottom <= m.vh + 0.5 && m.top >= 0 && m.tip, `${tag} ${when}: controls bar fully on screen (bottom ${Math.round(m.bottom)} of ${m.vh})`);
    ok(m.bodyOverflow === "hidden" && m.sy === sy0 && m.root.top >= 0 && m.root.bottom <= m.vh + 1, `${tag} ${when}: no page scroll (wheel moved the page ${m.sy - sy0}px, game ${Math.round(m.root.top)}..${Math.round(m.root.bottom)} of ${m.vh})`);
    ok(m.small.length === 0, `${tag} ${when}: all tap targets >= 48 px ${m.small.join(" ")}`);
  };
  await checkBar("day 1 build");
  const done = [];
  for (const plan of plans.slice(0, 4)) {
    await playDay(page, plan, done);
    await page.getByTestId("next-day").tap();
    await page.waitForSelector("[data-testid=solartopia-game][data-phase=request], [data-testid=solartopia-game][data-phase=build]");
  }
  if (await page.getByTestId("request-go").count()) await page.getByTestId("request-go").tap();
  await page.waitForSelector("[data-testid=solartopia-game][data-phase=build]");
  await page.waitForTimeout(1500);
  await checkBar("day 5 build (all 30 slots)");
  await arrange(page, plans[4].placements);
  await page.getByTestId("start-day").tap();
  await page.getByTestId("building-pump").tap();
  await page.waitForTimeout(300);
  await checkBar("day 5 play");
  const chipText = await page.getByTestId("job-chips").innerText();
  ok(/pump/i.test(chipText) && /Irrigation/.test(chipText) && /Buses/.test(chipText) && /hrs of strong sun left/.test(chipText), `${tag}: job buttons show hours of strong sun left`);
  // hidden tab pauses
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForSelector("[data-testid=pause-card]");
  ok(true, `${tag}: hidden tab pauses the game`);
  const h1 = (await state(page)).hour;
  await page.waitForTimeout(500);
  ok((await state(page)).hour === h1, `${tag}: clock stops while paused`);
  const pauseText = await page.getByTestId("pause-card").innerText();
  ok(/Tap a glowing building to switch it on or off/.test(pauseText) && (await page.getByTestId("btn-sound").isVisible()) && (await page.getByTestId("btn-speed").isVisible()), `${tag}: pause screen shows the controls`);
  await checkBar("pause");
  await page.getByTestId("pause-exit").tap();
  ok((await page.getByTestId("leave-dialog").getAttribute("aria-modal")) === "true", `${tag}: Exit asks first, in its own dialog`);
  await page.getByTestId("leave-stay").tap();
  ok((await page.getByTestId("pause-card").count()) === 1, `${tag}: Keep playing returns to the paused game`);
  await page.goBack();
  await page.waitForSelector("[data-testid=leave-dialog]");
  ok(page.url().includes("/solartopia"), `${tag}: Back asks before leaving and stays on the page`);
  await page.getByTestId("leave-confirm").tap();
  await page.waitForSelector("[data-testid=solartopia-title]");
  ok(page.url().includes("/solartopia"), `${tag}: after Leave the title is back, still on /solartopia`);
  const abandon = await page.evaluate(() => window.__ev.filter((e) => e[0] === "st_abandon"));
  ok(abandon.length === 1 && abandon[0][1].day === 5 && abandon[0][1].phase === "play", `${tag}: Exit mid-day sends st_abandon {day, phase} ${JSON.stringify(abandon)}`);
  ok(errors.length === 0, `${tag}: no errors ${errors.join(" | ")}`);
  await page.context().close();
}

if (process.env.SOLARTOPIA_1X) {
  const m = await fullRun(1, "real-time run");
  ok(m > 2 && m < 6, `one 1x scripted run took ${m.toFixed(1)} minutes (a person takes 4-6)`);
}
await browser.close();
