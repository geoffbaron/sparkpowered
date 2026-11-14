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

## /home-backup (hub)

Query: "how to connect portable power station to house" (Nov 14 2026). Google showed 7 organic results:
1. reddit.com r/SolarDIY, connecting a power station to the entire house
2. energy.ecoflow.com blog, integrate a power station into your home
3. diysolarforum.com, can you plug a power station into a wall
4. popularmechanics.com, set up a portable solar generator to back up your house
5. smartenergyedge.com, connect a portable power station to a house safely
6. airforums.com, interior power connection for a portable power station
7. quora.com, can a portable power station be connected to the mains via a transfer switch
Verdict: forums plus one maker blog (EcoFlow, its own panel) and one magazine; no page lays out all four methods with costs and model support. Build.

| Claim | Source | Read |
|---|---|---|
| Backfeeding through a wall outlet can electrocute utility workers and neighbors on the same transformer and bypasses circuit protection | CPSC portable generator safety alert PDF (5123) | 2026-11-14 |
| Connect to a building's wiring only through a transfer switch installed by a qualified electrician; grounded 3-prong cords, undamaged, rated for the load | OSHA 3286 PDF | 2026-11-14 |
| Cord wattage rating must exceed the total of appliances on it | CPSC 5123 PDF | 2026-11-14 |
| Inlet box $20-$100; heavy-duty cord $30-$350; interlock installed $400-$850; manual transfer switch installed $400-$1,300; labor $200-$500; permit $50-$350 | HomeGuide generator transfer switch installation cost (page title says 2026; its markup dateModified is 2023-04-05, stated on the page) | 2026-11-14 |
| Anker Smart Home Power Kit $1,799.99 regular ($1,199.99 after auto code); licensed electrician required; 100 A breaker sold separately; Anker install service $2,000 without permit | ankersolix.com/products/smart-home-power-kit | 2026-11-14 |
| Anker 10-circuit manual transfer switch, 30 A: $789.99 regular ($549.99 after code); options "For F3800 Plus & 2x F3000" | ankersolix.com/products/home-backup-kit-for-f3000-2 | 2026-11-14 |
| Bluetti AT1 $1,299; automatic transfer panel for grid, generators, rooftop solar, Bluetti storage; compatible with Apex 300 systems (up to three via Hub A1) | bluettipower.com/products/at1 (+ /products/at1.js) | 2026-11-14 |
| "Listed transfer equipment or an approved interlock"; "Neutral bonding matters most: some generators bond the neutral, others expect transfer equipment that switches it"; permits/inspection under local rules | Bluetti blog, How to hook up a generator to the house (Bluetti Team, Oct 29 2026) | 2026-11-14 |
| Missing neutral and ground at the inlet box or transfer switch may damage appliances | Anker support, Can I connect the F3800 to the same transfer switch/inlet box... | 2026-11-14 |
| Panel-ready models: Apex 300 14-50R (Bluetti manual V3.1); F3800 Plus L14-30R (Anker support Q4); DELTA Pro 3 L14-30R and Jackery 5000 Plus 120/240 V (products.ts notes from their makers' pages); DELTA Pro Ultra needs Smart Home Panel 2 (products.ts note, EcoFlow page) | as listed | 2026-11-14 (products.ts dates for the others) |
| HELIOS 3600: 240 V only with two units; Double Voltage Power Hub $139, 7,200 W, one 6-20 and two L14-30 outlets | growattportable.com product pages (.js) | 2026-11-14 |
| Apex 300 $1,499 (compare-at $1,699), in stock | bluettipower.com/products/apex-300-home-battery-backup.js | 2026-11-14 |

Safety pass done (Nov 14 2026, standard: ~/Grant/marketing/threads/sparkpowered-seo-safety-review.md): every panel method says licensed electrician + permit in the method table and a red box above it; backfeeding/double-male cord mentioned only as illegal and deadly; cord advice carries OSHA/CPSC conditions; space heaters straight into the unit; no wiring steps.

## /home-backup/anker-solix-f3800-plus-hookup

Query: "anker solix f3800 plus transfer switch without home power panel" (Nov 14 2026):
1. ankersolix.com/products/f3800-plus
2. reddit.com r/anker, HPP or manual transfer switch? (F3800 + expansion)
3. support.ankersolix.com, F3800 & F3800 Plus: your top questions answered
4. ankersolix.com/f3800-plus
5. support.ankersolix.com, is the transfer switch supplied by Anker weatherproof?
6. diysolarforum.com, possible unsafe operation of the Anker F3800 Plus
7. shopsolarkits.com, Anker SOLIX manual transfer switch 6 or 10 circuit
8. reddit.com r/AnkerSOLIXCommunity, F3800 Plus and Home Power Panel experiences
Verdict: Anker's own pages rank but none compares the three options or says which switch version fits one unit; forums ask exactly that. Build.

| Claim | Source | Read |
|---|---|---|
| F3800 Plus sold out on Anker US (also Nov 6); shown at $2,399.99 after $600 auto code (regular $2,999.99) | ankersolix.com/products/f3800-plus (page text: "Sold Out", "Notify Me") | 2026-11-14 |
| F3800 Plus + Smart Home Power Kit in stock: $4,799.99 regular, $3,199.99 after code, "Estimated dispatch within 7 days", Add to Cart | ankersolix.com/products/f3800-plus-smart-home-power-kit | 2026-11-14 |
| One unit 6,000 W, 120 V/25 A or 240 V/25 A; two units + Double Power Hub 12,000 W, 50 A | Anker support, top questions Q3 | 2026-11-14 |
| HPP backs up subpanel automatically, 25 A one unit / 50 A two; grid-tied solar shuts off in outages and can't recharge until the grid returns; works with grid-tied solar <=100 A | Anker support, top questions Q1, Q5 | 2026-11-14 |
| F3800 Plus: L14-30R only (no 14-50R), TT-30R yes; F3800 Plus and a 240 V generator can connect to HPP at the same time | Anker support, top questions Q4 | 2026-11-14 |
| Works with a home transfer switch/inlet box; neutral and ground warning | Anker support, Can I connect the F3800 to the same transfer switch/inlet box... | 2026-11-14 |
| 50 A 10-circuit switch: "For F3800 or 2x F3800 Plus", "Not Suitable for Single F3800 Plus"; $859.99 regular ($599.99 after code); Reliance Pro/Tran 2, UL 1008, NEC 702; (6) 15 A 1-pole, (1) 20 A 2-pole, (1) 30 A 2-pole | ankersolix.com/products/home-backup-kit-for-f3800-10c | 2026-11-14 |
| HPP supports 120/240 V split-phase only, not 120/208 V | FAQ on the same Anker page | 2026-11-14 |
| 30 A 10-circuit switch for one F3800 Plus: $789.99 regular | ankersolix.com/products/home-backup-kit-for-f3000-2 | 2026-11-14 |
| BP3800 expansion battery in stock, $1,799.99 | ankersolix.com/products/bp3800-expansion-battery | 2026-11-14 |

Buy link: tracked Anker link to the in-stock F3800 Plus + Smart Home Power Kit bundle (the unit alone is sold out). Safety pass done (Nov 14 2026).

## /home-backup/bluetti-apex-300-hookup

Query: "bluetti apex 300 transfer switch" (Nov 14 2026):
1. reddit.com r/bluetti, Apex 300 and transfer switch
2. bluettipower.com blog, transfer switch for a portable generator: what to know
3. bluettipower.com, 100A manual transfer switch (for maintenance)
4. bluettipower.com, Apex 300 + B300K
5. diysolarforum.com, automatic transfer switch
6. pcmag.com, Bluetti Apex 300 review
7. youtube.com, Apex 300 home backup power kits explained
8. bluettipower.com, Apex 300 home battery backup
Verdict: Bluetti's pages sell the AT1 but don't compare it with an interlock or manual switch, and none states the 16 A on-battery limit or the neutral question. Build.

| Claim | Source | Read |
|---|---|---|
| 14-50R: 120/240 V 50 A in bypass mode; 16 A at 240 V discharge only; TT-30R 30 A at 120 V setting, 16 A at 240 V setting; 3,840 W max | Apex 300 user manual V3.1 (s4.bluettipower.com PDF), spec table | 2026-11-14 |
| Manual has no statement on neutral-ground bonding of the output (searched "neutral", "bond") | same manual | 2026-11-14 |
| Neutral bonding caveat, approved interlock, listed transfer equipment | Bluetti blog Oct 29 2026 (Bluetti Team) | 2026-11-14 |
| Old Bluetti forum thread on AC300 transfer switches and neutral (community.bluettipower.com/t/ac300-to-transfer-switch/2318) now 301s to forum.bluettipower.com home; not citable, not used | - | 2026-11-14 |
| Apex 300 $1,499, in stock; AT1 $1,299; Home Integration Kit $699 single / $799 parallel; Hub A1 package $699 (2 cables) | bluettipower.com product .js | 2026-11-14 |
| Home Integration Kit guide (Bluetti_Sub_Panel_1.pdf) is image-only; no claims taken from it | cdn.shopify.com PDF | 2026-11-14 |

Safety pass done (Nov 14 2026): electrician + permit on every option; neutral question sent to Bluetti support and the electrician, not answered by us; no wiring steps.
