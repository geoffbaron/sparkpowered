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

## Price recheck (Grant request, Nov 14 2026)

| Claim | Source | Read |
|---|---|---|
| Anker BP3000 expansion battery in stock ("Estimated dispatch within 7 days", Add to Cart): $1,299.99 regular, $999.99 after $300 auto code. products.ts F3000 add-on updated (was $1,199.99 and noted sold out from Nov 6) | ankersolix.com/products/bp3000-expansion-battery-for-f3000 | 2026-11-14 |
| Anker F3000 unchanged: $1,699.99 after $200 code, in stock | ankersolix.com/products/f3000 | 2026-11-14 |

## /compare/growatt-helios-3600-vs-bluetti-apex-300

Query: "growatt helios 3600 vs bluetti apex 300" (Nov 14 2026):
1. diysolarforum.com, Bluetti vs Growatt: am I setting myself up for pain
2. dannycamping.com, best 240 V portable power stations 2026
3. thegeneratorinsider.com, 15 best solar generators for home backup
4. youtube.com, top 5 whole-house solar generators
5. reddit.com r/preppers, Growatt HELIOS 3600 opinions
6. yahoo.com (AT&T), Amazon blowing out solar generators
7. blackoutsizer.com, Growatt: 4 models, specs and comparisons
8. homebackupwatts.com, Growatt portable power station buyer's guide
Verdict: no direct head-to-head; spec-only listicles and forums. Build, built on the 240 V question.

| Claim | Source | Read |
|---|---|---|
| "Support 240V whole-home power when parallel two HELIOS 3600s" | growattportable.com HELIOS 3600 page | 2026-11-14 |
| HELIOS 3600 $1,599 in stock; Extra Battery $1,589 sold out; "HELIOS 3600*2 + Double Voltage Hub" $3,337 in stock | same page, /products/...js variants | 2026-11-14 |
| Double Voltage Power Hub $139; 7,200 W from two units; one NEMA 6-20, two NEMA L14-30 | growattportable.com/products/growatt-double-voltage-power-hub | 2026-11-14 |
| Apex 300 $1,499 in stock; 14-50R 16 A at 240 V on battery, 50 A bypass | Bluetti store .js; Apex 300 manual V3.1 | 2026-11-14 |
| Price log: Apex 300 Oct 15 $1,599, Oct 26 $1,599, Nov 6 $1,499, Nov 14 $1,499; HELIOS Nov 4 $1,599, Nov 14 $1,599 | deals.ts log + products.ts | 2026-11-14 |
| NOT used: deals.ts shows a Growatt Black Friday price of $1,198.98 for the HELIOS 3600 (Nov 10-30). Growatt's product page on Nov 14 showed $1,599 with no code shown; flagged to Grant, not repeated on this page | growattportable.com | 2026-11-14 |

Safety pass done (Nov 14 2026): 240 V into house circuits only via inlet+interlock, transfer switch or maker panel, licensed electrician and permit; no wiring steps.

## /home-backup/furnace (dropped)

Live Google check, 2026-11-14, query "power station for gas furnace blower" (google.com, hl=en, gl=us). 7 organic results with titles:
1. reddit.com/r/preppers: "Powering Whole Home Gas Furnace with Portable ..."
2. ecoflow.com/us/blog: "Portable Power Station for Gas Furnace: How to Choose ..." (maker blog)
3. udpwr.com/blogs: "Gas Furnace Battery Backup: Power Station Sizing & ..." (maker blog)
4. generatorchecker.com/best-for/gas-furnace-blower: "Best Power Station for a Gas Furnace Fan (Blower) (2026)"
5. iallpowers.com/blogs: "Can a Portable Power Station Run a Gas Furnace?" (maker blog)
6. homedepot.com: "Portable Power Stations" (category page)
7. backuppowerhub.com: "Best Power Stations for HVAC: Complete Guide (2026)"
Verdict: one forum out of seven; page 1 is three makers' blogs, two spec sites and a retailer. The plan's condition (build only if page 1 is mostly forums) is not met. Dropped; entry removed from src/data/home-backup.ts. The outage calculator keeps its furnace-blower load.

## /home-backup/well-pump

Live Google check, 2026-11-14, query "power station for well pump 240v". 7 organic results with titles:
1. backuppowerhub.com: "Best Power Stations for Well Pump Backup"
2. reddit.com/r/SolarDIY: "Best way to provide 240V for well pump?"
3. generatorchecker.com/best-for/well-pump-1hp: "Best Power Station for a Well Pump (2026)"
4. pvbat.com: "240V Well Pump Battery Backup | Split-Phase & Surge ..."
5. amazon.com: "240v Portable Power Station" (search page)
6. facebook.com/groups/offgridlivingsurvival: "240v backup power setup for water well pump"
7. signaturesolar.com: "SoftStartUSA | SoftStart Well Pump" (retailer)
Verdict: forums, spec sites and retailers; no page computes starting watts from the pump's own nameplate against in-stock models. Built.

| Claim | Source | Read |
|---|---|---|
| 4-inch single-phase motors (without G suffix): 1/2 HP 115 V 2-wire max 12.0 A / 960 W, LRA 64.4; 1/2 HP 230 V 2-wire 6.0 A / 960 W, LRA 32.2; 3/4 HP 8.0 A / 1,310 W, LRA 40.7; 1 HP 10.4 A / 1,600 W, LRA 48.7; 1.5 HP 13.1 A / 2,280 W, LRA 66.2; 3-wire (standard control box) 1/2 HP 115 V Y12.0 / 960 W, LRA 50.5; 1/2 HP 230 V Y6.0 / 960 W, LRA 23; 3/4 HP Y8.0 / 1,310 W, LRA 34.2; 1 HP 10.4 / 1,600 W, LRA 41.8; 1.5 HP Y11.5 / 2,080 W, LRA 51.4; 2 HP Y13.2 / 2,555 W, LRA 53.1; 3 HP Y17.0 / 3,400 W, LRA 83.4 | Franklin Electric AIM Manual, 60 Hz Submersible Systems, 2026 edition (M1311 06-26), 4-inch single-phase motor specifications table, https://dwee.nebraska.gov/sites/default/files/water/2026_60Hz_AIM_Manual_Submersible_Systems.pdf | 2026-11-14 |
| "The motor current goes from zero to locked rotor amps, then drops to running amps at full speed" | same, Reduced Voltage Starters section | 2026-11-14 |
| Transfer switches "must be used any time a generator is used as standby or back up on power lines" | same, Generator Operation section | 2026-11-14 |
| Single-phase encapsulated submersible motors "can only be used with the appropriate Franklin Electric constant pressure controller" (drives); soft starts "may not be compatible with SubMonitor/SubMonitor-Plus" | same, variable frequency drive and reduced voltage starter sections | 2026-11-14 |
| Watts = volts × amps when a label gives amps | US DOE Energy Saver, Estimating appliance energy use (archived copy), already cited site-wide | 2026-11-14 |
| Starting method: running watts plus the biggest motor's extra starting watts; water well pump 1/3 HP 1,000 W + 2,000 W | EWEB generator sizing sheet (pdftotext of the PDF) | 2026-11-14 |
| Apex 300: "Power Lifting Mode ... power up to 7,680W pure resistive loads like kettles, electric blankets, hairdryers"; "This mode is only for pure resistive loads rated 3,840W-7,680W"; UPS 0 ms (240 V, specific outlets) or ≤20 ms. Data fix: products.ts Apex 300 now carries the heating-only note (motor surge = 3,840 W) and upsMs 20 | BLUETTI Apex 300 user manual (US EN), section 5.3 and UPS section, https://cdn.shopify.com/s/files/1/0550/5620/3836/files/Apex_300_User_Manual_US_EN.pdf; product page lists "Lifting Power 7,680W", no separate surge figure | 2026-11-14 |
| Apex 300 $1,499 (compare-at $1,699), in stock; pure sine wave | bluettipower.com/products/apex-300-home-battery-backup (.js and page) | 2026-11-14 |
| Pick rule (computed): tracked, in-stock station that runs the most Franklin 230 V motors, then starts the most, then cheapest -> Apex 300 (only in-stock tracked 240 V model; starts none on paper). 120 V 1/2 HP 3-wire start (5,808 W) covered on paper by Anker F3000, ALLPOWERS R3500, EcoFlow DELTA 3 Max Plus | computed from products.ts | 2026-11-14 |

Safety pass done (2026-11-14): pump is wired in, so transfer switch or inlet + interlock by a licensed electrician with a permit (shared ElectricianRule box); backfeeding through dryer outlet or double-ended cord stated as illegal and deadly; don't open the control box; soft starter fitted by electrician or pump installer, matched to the motor maker's rules.

## /home-backup/pellet-stove

Live Google check, 2026-11-14, query "power station for pellet stove". 8 organic results:
1. ecoflow.com/us/blog: "Pellet Stove Backup Power: Solutions for Power Outages" (maker blog)
2. reddit.com/r/PelletStoveTalk: "What's your power back up for your stove?"
3. secamerica.com: "SF512, Pellet Stove Battery Backup" (product)
4. amazon.com: "Pellet Stove Battery Backup" (search page)
5. hearth.com forums: "Pellet stove with battery back up?"
6. facebook.com group: "What portable power stations work for pellet stoves?"
7. jackery.com/blogs: "5 Best Pellet Stove Battery Backup for Power Outages" (maker blog)
8. firewoodhoardersclub.com forums: "Battery Station for Pellet Stove"
Verdict: four forums, two maker blogs selling their own units, a product page and a search page. Built.

| Claim | Source | Read |
|---|---|---|
| US Stove 5660: "Electrical Rating 115-120 volts, 60 HZ, 3.0 Amps / Watts (operational) 180W / Watts (igniter running) 346W"; "A power surge protector is required"; "The heater will not operate during a power outage ... check the heater for smoke spillage and open a window" | US Stove 5660 owner's manual 851901T-0503J, https://www.usstove.com/wp-content/uploads/2023/05/5660-Owners-Manual.pdf (maker-hosted) | 2026-11-14 |
| US Stove US5522-W: "110-120 Volts AC, 60 HZ, 3.0 Amps / Watts (operational) 162 (approx.) / Watts (igniter running) 332 (approx.)" | US5522-W manual 854002-0606M, https://www.usstove.com/wp-content/uploads/2023/08/854002-US5522-W-EN_FR.pdf (maker-hosted) | 2026-11-14 |
| Harman P43/P61/P68: "120 VAC, 60 Hz, Start 4.2 Amps, Run 2.8 Amps" (= 504 W / 336 W at 120 V); "Some generator or battery back-up systems may not be compatible with the micro-processor electronics"; "A power failure will cause the combustion blower to stop running, which may lead to exhaust see[p]age into the room"; "The UPS provides safe shut-down only"; "Use only Harman® approved battery back-up devices"; "A surge protector is recommended" | Harman P-Series owner's manual 8390-044C, third-party copy https://assets.pellet-stove-parts-4less.com/website/manufacturers/harman/pellet/models/p43-c/harman-p43-c-owners-manual_mod_01.pdf (HHT's download server returned empty pages) | 2026-11-14 |
| PelPro PP130: "Electrical Rating (On High) ... 120 VAC, 60 Hz, Start 2.6 Amps, Run 2.3 Amps" (= 312 W / 276 W); "A good surge protector is recommended" | PelPro PP130 owner's manual 7086-171I (May 6 2015), third-party copy https://assets.pellet-stove-parts-4less.com/website/manufacturers/pelpro/pellet/models/pp130/pelpro-pp130-owners-manual_mod_01.pdf | 2026-11-14 |
| Harman back-up sheet: UPS "simply provide enough power for quick shut down"; APS1012SW "Pure Sine Wave Output", "No changes needed on pellet stove due to pure sine wave"; non-sine units "should be set to Continue Operation" | Harman Battery Backup Options HAR-0040U-0718, forum copy https://hearth.com/talk/attachments/har-battery-back-up-options-pdf.231401 (no Harman-hosted copy found) | 2026-11-14 |
| Englander 25-PDVC: power interrupted more than about three minutes -> unit "OFF" when power returns, otherwise back to Start-Up; "If you see smoke coming out of your unit into the room due to a power failure, DO NOT OPEN THE HOPPER OR DOOR"; no electrical rating printed | Englander manual 46313A (2023-01-17), https://cdn.shopify.com/s/files/1/0782/2077/files/25PVD.pdf (Shopify CDN; store owner not confirmed) | 2026-11-14 |
| Unverified, not used: Enviro Empress 500 W, Comfortbilt HP22 520/150 W, Breckwell SP1002 425/175 W (search snippets only; Enviro's own manuals behind a bot check) | - | 2026-11-14 |
| Runtime = usable Wh (85%) ÷ running watts; switchover = each product's upsMs | src/lib/can-it-run.ts usableWh, products.ts | 2026-11-14 |
| ALLPOWERS R3500 $1,199 (compare-at $2,099), in stock; "3200W Pure Sine Wave Inverter (6000W peak)"; UPS "only 15ms" | iallpowers.com/products/allpowers-r3500-portable-power-station-3200w-3168wh (.js and page) | 2026-11-14 |
| Pick rule (computed): most usable Wh per dollar among in-stock tracked stations with a stated switchover -> ALLPOWERS R3500 | computed from products.ts | 2026-11-14 |
| CO alarms on every level | Ready.gov, Power outages (OFFGRID_SOURCES.readyOutage) | 2026-11-14 |

Safety pass done (2026-11-14): smoke on power loss (Harman, US Stove, Englander quoted), CO alarms on every level, plug straight into the station through the surge protector the manual calls for, no extension cord, station outside the stove's clearances, no backfeeding (charging from the wall is fine; feeding output into house wiring is illegal), transfer switch by a licensed electrician for any hard-wiring; no claim that a station rides through an outage mid-burn.

## /home-backup/bluetti-elite-200-v2-solar-panels

Live Google check, 2026-11-14, query "bluetti elite 200 v2 solar panel compatible". 8 organic results:
1. reddit.com/r/bluetti: "Bluetti Elite 200 V2 – what solar panels can I safely add?"
2. amazon.com: BLUETTI store "Solar Panel"
3. generatorchecker.com/compatibility/solar/bluetti-elite-200-v2
4. stationarena.com/products/bluetti-elite-200-v2/solar-panels
5. backuppowerhub.com: "Bluetti Solar Panel Compatibility: Wiring Guide (2026)"
6. bluettipower.com/collections/solar-panels
7. bluettipower.com/products/elite-200-v2-portable-power-station
8. bluettipower.com/products/bluetti-sp200l-solar-panel-200w
Verdict: Bluetti's own pages list specs but no layouts or cold check; the rest are a forum question and spec sites. Built (homepage pick).

| Claim | Source | Read |
|---|---|---|
| "Do not use solar panels with open circuit voltage higher than 60V. Solar input voltage range for the unit is 12V-60V"; "Voc: 12V-60V Current: 20A Max. Power: 1,000W Max."; both MC4 sets "will be connected in parallel ... if one set has two 200W (20V/10A) panels in series, the other set should also have two"; DC Input (XT60PM-M) 1,000W, 12-60V, 20A; MC4-XT60 solar cable in the box; PV setting: non-advanced 11-30 V I ≤ 8.2 A, 30-60 V I ≤ 20 A; advanced 11-16 V ≤ 8.2 A, 16-60 V ≤ 20 A; E033 PV overvoltage; "The unit is for off-grid use only. Do not connect its AC output to the grid"; third-party panels OK with Voc 12-60 V and MC4, avoid mixing; full in about 2.4 hours at 1,000 W | BLUETTI Elite 200 V2 user manual V1.0, https://s4.bluettipower.com/bluetti_lgf/support/2025/05/2e595f43-44bf-471a-8eff-da42abfbbcca.pdf | 2026-11-14 |
| Product page: Solar Input 1,000W Max., 12V to 60V, 20A Max.; UPS ≤15ms; Inverter Type Pure Sine Wave; $899, in stock | bluettipower.com/products/elite-200-v2-portable-power-station (.js and page) | 2026-11-14 |
| SORA 500: Voc 49.1 V, Isc 13.31 A, Vmp 40.92 V, Imp 10.22 A, MC4 | bluettipower.com/products/500w-portable-solar-panel | 2026-11-14 |
| 350W: spec table Voc 44 V, Isc 11.4 A, Vmp 37 V, Imp 9.5 A; marketing line on the same page says "33V open-circuit voltage" (conflict; we use 44 V and say so) | bluettipower.com/products/350w-solar-panel | 2026-11-14 |
| SP200L: OCV 24.6 V, Isc 10.8 A, MC4. SP100L: OCV 24.62 V, Isc 5.13 A, MC4. PV100 FX: Voc 41.4 V, Isc 3.05 A, MC4. SORA 60: OCV 27.5 V, Isc 2.76 A, DC5521 connector | each panel's bluettipower.com product page | 2026-11-14 |
| Voc(cold) = Voc(STC) × (1 + (coefficient/100) × (Tmin − 25)); worked example 45 V, −0.36%/°C, −10°C -> 50.67 V; Table 690.7(A) factors range 1.02 at 24°C to 1.25 at −40°C; 1.18 at −17°C | John Wiles, PV Systems Math: Sample Calculations, IAEI Magazine Sept/Oct 2019, https://iaeimagazine.org/columns/photovoltaic/pv-systems-math-sample-calculations/ | 2026-11-14 |
| Layout math (computed): 2 × SP200L series 49.2 V, 58.1 V at ×1.18, 61.5 V at ×1.25; 1 × SORA 500 57.9 / 61.4 V; 2 × 350W parallel Isc 22.8 A | src/lib/offgrid.ts pvLayout, tests/home-backup-loads.test.ts | 2026-11-14 |

Safety pass done (2026-11-14): 60 V limit and E033 stated with the cold check; Bluetti's off-grid-only rule quoted; backfeeding through a wall or dryer outlet or double-ended cord stated as illegal; transfer switch by a licensed electrician with a permit for house circuits.

Data discrepancies found, not fixed here (outside these pages): Bluetti's pages give the Elite 400 "3,900 W Lifting Power" (products.ts surgeW 5,200) and the Elite 100 V2 "Surge 2,700W" / "2,700W Lifting Power" (products.ts 3,600); the Elite 300 page shows both "Lifting Power: 4,800 W" and "Surge Power 4,800 W". Bluetti's surge figures look like heating-only Power Lifting across the range; worth a products.ts pass.
