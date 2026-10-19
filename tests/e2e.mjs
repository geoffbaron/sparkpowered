// End-to-end checks of the interactive tools. Needs Google Chrome installed and
// a running build: npm run build && npm start, then npm run test:e2e.
import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const ok = (c, msg) => { if (!c) { console.log("FAIL", msg); process.exitCode = 1; } else console.log("ok  ", msg); };

// EV Finder
await page.goto(base + "/calculator", { waitUntil: "networkidle" });
for (const t of ["Under $35,000", "SUV / Crossover", "30–60 miles", "Best Value", "3–4 people"]) {
  await page.getByRole("button", { name: new RegExp(t.replace(/[$]/g, "\\$")) }).first().tap();
  await page.waitForTimeout(250);
}
await page.waitForSelector("text=Your");
const ev = await page.locator("main").innerText();
ok(/EPA range/.test(ev), "EV Finder results show EPA range");
ok(!/30% ITC|\$7,500 back/.test(ev), "EV Finder has no expired-credit claims");

// Battery sizer
await page.goto(base + "/battery-calculator", { waitUntil: "networkidle" });
for (const t of ["Power outage backup", "Essentials only", "12 hours", "No solar", "Under $5,000"]) {
  await page.getByRole("button", { name: new RegExp(t.replace(/[$]/g, "\\$")) }).first().tap();
  await page.waitForTimeout(400);
}
await page.waitForSelector("text=of storage");
const bat = await page.locator("main").innerText();
ok(/Listed price, this setup|Typical installed cost/.test(bat), "Battery results show a cost for each match");
const partner = page.locator("a[data-partner]");
ok((await partner.count()) >= 2, "Battery results link 2+ real products");
ok((await partner.first().getAttribute("rel")) === "sponsored nofollow noopener", "Product links are marked sponsored");
ok(/We may earn a commission/.test(bat), "Battery results show the affiliate disclosure");
ok(!/ITC/.test(bat) && !/payback/i.test(bat), "Battery results have no ITC/payback claims");

// Lithium RV battery picker
await page.goto(base + "/lithium-rv-battery", { waitUntil: "networkidle" });
const pick1 = await page.locator("[data-testid=rv-pick]").innerText();
ok(/Redodo 12V 100Ah/.test(pick1), "RV picker default pick: " + pick1);
await page.getByLabel(/CPAP machine/).check();
await page.getByLabel(/Laptop for work/).check();
await page.getByRole("button", { name: "A week" }).tap();
await page.waitForTimeout(300);
const pick2 = await page.locator("[data-testid=rv-pick]").innerText();
ok(pick2 !== pick1, "RV picker scales up: " + pick2);
const rd = page.locator("main a[data-partner=redodo]");
ok((await rd.count()) >= 6, "RV page links Redodo products");
ok(/awinmid=97969&awinaffid=3125360/.test(await rd.first().getAttribute("href")), "Redodo links carry the Awin IDs");
ok((await rd.first().getAttribute("rel")) === "sponsored nofollow noopener", "Redodo links are sponsored");
ok(/We may earn a commission/.test(await page.locator("main").innerText()), "RV page shows the affiliate disclosure");

// Autel home chargers on the EV charging cost page
await page.goto(base + "/ev-charging-cost", { waitUntil: "networkidle" });
const au = page.locator("main a[data-partner=autel]");
ok((await au.count()) >= 2, "EV charging page links Autel chargers");
ok(/awinmid=72577&awinaffid=3125360/.test(await au.first().getAttribute("href")), "Autel links carry the Awin IDs");
ok((await au.first().getAttribute("rel")) === "sponsored nofollow noopener", "Autel links are sponsored");

// Solar calculator
await page.goto(base + "/solar-calculator?state=AZ", { waitUntil: "networkidle" });
const solar = await page.locator("main [aria-live=polite]").innerText();
ok(/kW/.test(solar) && /panels/.test(solar), "Solar calculator renders results for AZ: " + solar.replace(/\s+/g, " ").slice(0, 80));

// Go Electric planner
await page.goto(base + "/go-electric?state=TX", { waitUntil: "networkidle" });
ok((await page.locator("#ge-state").inputValue()) === "TX", "Go Electric reads ?state=TX");
const before = await page.locator("#ge-total").innerText();
ok(/Save about \$[\d,]+ a year/.test(before), "Go Electric shows a yearly total: " + before);
await page.locator("#ge-car").selectOption("none");
await page.waitForTimeout(300);
const afterCar = await page.locator("#ge-total").innerText();
ok(afterCar !== before, "Changing the car changes the total: " + afterCar);
ok((await page.locator("main a[data-partner]").first().getAttribute("rel")) === "sponsored nofollow noopener", "Go Electric partner links are sponsored");
ok(/We may earn a commission/.test(await page.locator("main").innerText()), "Go Electric shows the affiliate disclosure");

// Myths page and the old URL
await page.goto(base + "/objections", { waitUntil: "networkidle" });
ok(page.url().endsWith("/myths"), "/objections redirects to /myths");
ok((await page.locator("main article").count()) >= 13, "Myths page lists the myths");

// News filters
await page.goto(base + "/news", { waitUntil: "networkidle" });
const newsBefore = await page.locator("main li").count();
await page.getByRole("button", { name: /Hide Tesla/ }).tap();
await page.waitForTimeout(300);
const newsAfter = await page.locator("main li").count();
ok(newsBefore > 5 && newsAfter <= newsBefore, `News list ${newsBefore} items, ${newsAfter} with Tesla hidden`);
ok((await page.locator("main img").count()) === 0, "News page republishes no images");

// State page link from calculator
await page.goto(base + "/states/ohio", { waitUntil: "networkidle" });
ok(await page.locator("h1").innerText() === "Electricity, EV charging and solar in Ohio", "State page H1");

ok(errors.length === 0, "No console/page errors " + errors.join(" | "));
await browser.close();
