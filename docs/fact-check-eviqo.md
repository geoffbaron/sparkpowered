# Fact check: EVIQO home chargers (Oct 31 2026)

EVIQO approved Spark Powered as an affiliate on Oct 31 2026 (GoAffPro, portal partners.eviqo.io, ref code `zycwdczj`).
Every EVIQO figure on the site comes from the live eviqo.io product pages and their Shopify product data (`/products/<handle>.js`, `/products.json`), read on **Oct 31 2026**.
Data: `src/data/chargers.ts` (ids `eviqo-*`). Link: `src/data/affiliates.ts` (`eviqo.refParam`), which appends `?ref=zycwdczj` to the product URL.

## What EVIQO sells (US home Level 2), Oct 31 2026

Prices are for the "3-year (standard)" warranty option. A 4-year extended option costs more and is not used on the site.

| Site id | EVIQO's product title | Plug | Amps | Install | Price (list) | Source |
|---|---|---|---|---|---|---|
| eviqo-l2-j1772 | EVIQO Level 2 EV Charger, if Plug-In 40A (9.6kW) or if Hardwired 48A (11.5kW), 240V, J1772 for Non-Tesla EVs | J1772 | 40 plug-in / 48 hardwired | NEMA 14-50 plug-in or hardwired | $299.00 ($499.00, "Save 40%") | https://eviqo.io/products/eviqo_level2_ev_charger |
| eviqo-gen2-j1772-40a | EVIQO Level 2 EV Charger, 40A (9.6kW), 240V, NEMA 14-50 Plug-in, J1772 for Non-Tesla EVs (page heading: "Gen2") | J1772 | 40 | NEMA 14-50 plug-in | $450.99 ($579.99) | https://eviqo.io/products/eviqo-level-2-ev-charger-gen-2-14-50-nema-plug-in-240v |
| eviqo-j1772-hardwired-48a | EVIQO Level 2 EV Charger, 48A (50A Max), 240V, Hardwired, J1772 for Non-Tesla EVs | J1772 | 48 (50 via switch on a 70 A circuit) | Hardwired, 60 A circuit | $450.99 ($579.99) | https://eviqo.io/products/eviqo-level-2-ev-charger-hardwire-version-240v-48-amp-home-charging-station-25-cable-40-input-cable |
| eviqo-nacs-40a | EVIQO NACS Level 2 EV Charger, 40A (9.6kW), 240V, NEMA 14-50 Plug In, for Tesla EVs | NACS | 40 | NEMA 14-50 plug-in | $480.99 ($599.00) | https://eviqo.io/products/eviqo-level-2-ev-charger-nacs-charger-compatible-with-tesla |
| eviqo-nacs-hardwired-48a | EVIQO NACS Level 2 EV Charger, 48A (50A Max), 240V, Hardwired, for Tesla EVs | NACS | 48 | Hardwired, 60 A minimum circuit | $480.99 ($599.00) | https://eviqo.io/products/eviqo-level-2-ev-charger-hardwired-nacs-charger-compatible-with-tesla |

All five are listed on https://eviqo.io/collections/all and the home page, all "available" in the product data, and each page says "Ships in 1-2 business days".
Not listed on the site: the gift card, the free installation quote, and EVIQO's commercial chargers.

## Specs, and where each one is stated

| Claim | Applies to | Where on EVIQO's page |
|---|---|---|
| Cable 25 ft | all five | Comparison table on every page: "Cable length 25 ft"; NACS descriptions "EXTRA-LONG 25FT CHARGING CABLE"; J1772 page headings "25' Cable" / "25' Cord" |
| Weatherproof IP66 / NEMA 4, outdoor OK, -22°F to 122°F | all five | Description "IP66/NEMA-4 weatherproof enclosure"; FAQ "Can I mount it outdoors? Yes. IP66 + NEMA 4 rated"; spec table (J1772 $299 page) "-22°F to 122°F" |
| Warranty 3 years (4 years optional, extra cost) | all five | "3-year manufacturer warranty standard, extendable to 4 years at checkout" (FAQ); variant names |
| UL/ETL listed, ENERGY STAR, FCC | all five | Description "UL/ETL/FCC/Energy Star certified"; comparison table "UL & ETL listed". The FAQ says "Certified by ETL, Energy Star, and FCC". We write "UL/ETL listed (EVIQO's wording)" rather than name a standard |
| App: start/stop, set current, scheduling, usage/cost tracking; needs 2.4 GHz Wi-Fi | all five | Description "SMART APP CONTROL ... set 6-40A current" (6-48A on hardwired), "Schedule charging during off-peak night hours in the app" (Gen 2, both NACS, J1772 hardwired); comparison table on the $299 page "WiFi app included — scheduling & energy stats" |
| Adjustable: switch sets max 16 / 32 / 40 / 48 A, app fine-tunes from 6 A | all five (FAQ shown on every page) | FAQ "Hardware dip switch sets max amperage (16A / 32A / 40A / 48A). Then fine-tune with the app slider from 6A". Used by the picker for 32 A (40 A circuit) setups |
| Up to 38 miles of range an hour plugged in at 40 A; 46 hardwired at 48 A | $299 J1772; 38 also on NACS plug-in | $299 description "plug-in (40A, up to 38 miles of range per hour) or hardwired (48A, up to 46 miles...)"; NACS plug-in "approximately 38 miles per hour" |
| Plug-in works on a NEMA 14-50 (40 A or 50 A circuit); hardwired 48 A needs a dedicated 60 A circuit; 50 A needs 70 A | as listed | Product descriptions |
| Teslas need a J1772-to-NACS adapter for the J1772 models; NACS connector button opens a Tesla's charge port | as listed | Product descriptions |
| Gen 2 adds a fluorescent holster and side reset button | Gen 2 plug-in, J1772 hardwired, both NACS | Descriptions "NEW FLUORESCENT HOLSTER", "EASY-ACCESS SIDE RESET BUTTON" (not in the $299 model's description) |

Not claimed (deliberately): EVIQO's "30% Federal Tax Credit" line (the site follows the IRS: the 30C credit is not allowed for property placed in service after June 30, 2026), its "#1 Best Seller" and review counts, its savings calculator, any coupon code.

## Affiliate link check

- `https://eviqo.io/?ref=zycwdczj` and `https://eviqo.io/products/<handle>?ref=zycwdczj` both return 200 with the parameter kept (no redirect strips it).
- Product pages load the GoAffPro script (`goaffpro.com/loader.js?shop=eaddfc.myshopify.com`), which reads `?ref=` and sets the 60-day cookie.
- Still to confirm by hand: a test click shows up as a visit in the partners.eviqo.io dashboard.

## How EVIQO is ranked (price and spec, not commission)

- **J1772:** the $299 model is the lowest-priced charger we carry and matches or beats Lectron (no app, 23 ft) and Autel ($559) on cable, app and adjustability, so it leads every J1772 answer in the picker and is "Best for most homes" on /best-home-ev-charger. Grizzl-E Classic ($299.99, plain link) is $0.99 more.
- **NACS plug-in:** Lectron NEXUS NACS ($419.99, no app) stays first; EVIQO NACS ($480.99) is second, or first when the reader wants app scheduling.
- **NACS on a 40 A circuit:** Lectron portable ($319.99, pre-order) first; EVIQO NACS set to 32 A second, or first with app scheduling.
- **Hardwired J1772:** EVIQO $299 (up to 48 A) first, Autel 50 A ($599) second.
- **Hardwired NACS:** EVIQO NACS 48 A ($480.99) — previously the picker had no product for this and showed only a spec.
- **Renters with a NACS car:** Lectron portable first; second is Lectron NEXUS NACS, or EVIQO NACS with app scheduling.
- **Dryer outlet (24 A):** still no product. EVIQO can be turned down, but its plug is a NEMA 14-50, not a dryer plug.
- The Gen 2 J1772 plug-in and the J1772 48 A hardwired model ($450.99 each) appear in the comparison table and Ask Spark but are not picked: the $299 model does the same jobs for less.

Commission: 10% (12% at 50+ sales a month, 14% at 101+), 60-day cookie, PayPal payouts. "We earn a commission if you buy through this link." sits right next to every EVIQO link (unit test `tests/eviqo-disclosure.test.ts`, e2e check in `tests/e2e.mjs`).
