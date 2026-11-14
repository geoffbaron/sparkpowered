# Fact-check log: home-backup cluster (Nov 2026)

Shared log for the /home-backup pages. One section per page: the live Google top 8 for its query, then claim | source | read date.

## /home-backup/hookup-picker

Live Google check, 2026-11-14, query "how to connect power station to house panel" (google.com, hl=en, gl=us). Only 7 organic results carried a title on page 1:
1. reddit.com/r/SolarDIY: "Question regarding connecting powerstation to the entire ..."
2. energy.ecoflow.com/us/blog: "Integrate a Power Station into Your Home: Full Backup & ..." (maker blog)
3. facebook.com video: "How to hook in a power station to a breaker panel"
4. popularmechanics.com: "Home Power Station Installation and Setup" (EcoFlow Smart Home Panel 2)
5. powergenstore.com blog: "How to Connect a Power Station to Your Home: Transfer Switches, Inlet Boxes and Smart Panels"
6. quora.com: "Can a portable power station be connected to the Mains via a transfer switch"
7. generator-for-house.com: "How to connect a portable power station to your house"
Verdict: forums, a video, a retailer blog and one maker blog (EcoFlow, its own products only). No tool that sizes the battery and picks the method from your answers. Built as planned (it is the linkable tool regardless).

| Claim | Source | Read |
|---|---|---|
| (HomeGuide page title says 2026; its markup dates the figures 2023-04-05, shown on the page) Interlock kit $50-$150; power inlet box $20-$100; heavy-duty power cord $30-$350; job supplies $200-$400; labor $150-$300; interlock installed total $400-$850 | HomeGuide, Generator transfer switch installation cost (2026), https://homeguide.com/costs/generator-transfer-switch-installation-cost | 2026-11-14 |
| Manual transfer switch: 6-circuit $230-$360, 10-circuit $300-$670; installation labor $200-$500; manual switch installed $400-$1,300 | same HomeGuide page | 2026-11-14 |
| Electrical permit $50-$350; "most areas require a permit and inspection" for changes to the home's electrical system | same HomeGuide page | 2026-11-14 |
| 12-gauge outdoor extension cords: 25 ft 2-pack $76.99 ($38.50 each); 50 ft 12/3 SJTOW locking-end cord $65.99; 10 ft 12-gauge outdoor cord $38.99 | Iron Forge Cable US store (products.json on its own origin) | 2026-11-14 |
| Bluetti Apex 300 Home Integration Kit (single Apex 300) $699, in stock, "Compatible Models: Apex300", integrates the station with home circuits for vital loads in an outage; parallel kit $799 | bluettipower.com/products/apex-300-home-integration-kit (.js) | 2026-11-14 |
| Bluetti AT1 Smart Distribution Panel $1,299 (not used: Apex 300 compatibility not stated on its listing) | bluettipower.com/products/at1 | 2026-11-14 |
| Bluetti Apex 300 $1,499 (regular $1,699), in stock; B300K $1,099, in stock; Elite 200 V2 $899 in stock (unchanged from products.ts) | bluettipower.com product .js | 2026-11-14 |
| Anker SOLIX Home Power Panel kit $1,799.99; "works with the SOLIX F3800 Plus"; "Professional installation by a licensed electrician is required; a standard 100A circuit breaker is required and sold separately" | ankersolix.com/products/smart-home-power-kit | 2026-11-14 |
| Anker SOLIX Double Voltage Hub $289.99, Add to Cart shown; "Connect two F3000s ... 240V / 30A / 7,200W" | ankersolix.com/products/double-voltage-hub | 2026-11-14 |
| Anker 10-circuit manual transfer switch (for 2x F3000 + hub) $789.99 after a $240 code ending in 4 days: not used (sale price without a published end date on our side) | ankersolix.com/products/home-backup-kit-for-f3000-2 | 2026-11-14 |
| Anker BP3000 page shows $1,299.99 and Add to Cart (products.ts has $1,199.99 from Nov 6 and a note saying sold out); left for the Anker price pass | ankersolix.com/products/bp3000-expansion-battery-for-f3000 | 2026-11-14 |
| Growatt Double Voltage Power Hub $139, in stock; links two HELIOS 3600 for 7,200 W; one NEMA 6-20 and two NEMA L14-30 outlets | growattportable.com/products/growatt-double-voltage-power-hub (.js) | 2026-11-14 |
| Growatt HELIOS 3600 $1,599 in stock; Extra Battery $1,589 sold out (products.ts updated: addOn soldOut, retrieved 2026-11-14); 2x + hub bundle $3,337 | growattportable.com/products/growatt-helios-3600-portable-power-station (.js) | 2026-11-14 |
| HELIOS 3600 has a NEMA TT-30 outlet | same Growatt product page | 2026-11-14 |
| Bluetti Elite 300 has a TT-30 outlet | bluettipower.com/products/elite-300-portable-power-station | 2026-11-14 |
| Apex 300 50 A (14-50R) 120/240 V; F3000 TT-30, 120 V only, 240 V needs two units and the Double Voltage Hub | products.ts notes (maker pages, Nov 6) | 2026-11-06 |
| Backfeeding through a wall outlet can electrocute utility workers and neighbors on the same transformer | CPSC portable generator safety alert (PDF), as cited in src/data/questions.ts | 2026-10 (existing site source) |
| Connect to a building's wiring only through a properly installed transfer switch | OSHA 3286 (PDF), as cited in src/data/questions.ts | 2026-10 (existing site source) |
| Loads, daily Wh, running and starting watts; 85% usable | LOAD_DEFS / USABLE_FRACTION (EIA RECS 2020, EWEB, ResMed, DOE), src/lib/offgrid.ts and everyday.ts | existing |

Decisions logged:
- Interlocks are shown as an option with "some areas don't accept interlocks; your electrician and permit office decide" (OSHA and CPSC name only transfer switches; the Nov 12 safety review dropped "interlock" from a social post for that reason). The picker's default panel method is a manual transfer switch; interlock is the default only on the lowest budget.
- Nature's Generator and Himiway excluded (no new placements, Awin payment risk). EcoFlow, Jackery, DJI excluded (not tracked).
- Panel methods only show models whose 30 A+ outlet we read: Apex 300, F3000, HELIOS 3600, Elite 300, and the two-unit hubs. Elite 400 and ALLPOWERS R3500 outlets not confirmed, so they are offered with cords only.
- Two-unit setups are held to the hub's continuous 7,200 W for motor starts (no published pair surge figure).
- Safety pass done (2026-11-14, against ~/Grant/marketing/threads/sparkpowered-seo-safety-review.md): backfeeding named and refused (wall, dryer outlet, double-ended cord); every panel method says licensed electrician + permit in the result, the table and the FAQ; cords: heavy-duty outdoor three-prong rated for the load, one per appliance, no power strips; no wiring steps, breaker or wire sizing given to the reader; "we have not tested these units" stated.
