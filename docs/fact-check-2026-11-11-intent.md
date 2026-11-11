# Fact-check log: buyer-intent pages, 2026-11-11

Two pieces of work: "what it runs" pages for five power stations, and fuller incentive sections on ten state pages.
Every claim below was read on the source listed on the date shown. Nothing was filled in from memory.

## 1. Power station "what it runs" pages

Pages: /power-stations/<id>/what-it-runs for anker-solix-c1000-gen-2, bluetti-ac180, bluetti-elite-200-v2,
anker-solix-c2000-gen-2, bluetti-elite-300 (src/lib/can-it-run.ts, src/app/power-stations/[id]/what-it-runs/page.tsx).

### Why these models (search demand, read 2026-11-11)

Google search suggestions (suggestqueries.google.com, hl=en, gl=us), read 2026-11-11:

| Model | Suggestions found |
|---|---|
| Anker SOLIX C1000 (Gen 2) | "anker c1000 run time", "anker solix c1000 run a refrigerator", "how long will anker c1000 run a refrigerator", "anker solix c1000 tv run time", "anker solix c1000 space heater", "anker solix c1000 gen 2 space heater", "anker c1000 cpap", "anker solix c1000 sump pump", "anker solix c1000 gen 2 sump pump", "anker solix c1000 gen 2 how long does it last", "how long can anker solix c1000 run a refrigerator" |
| Bluetti AC180 | "bluetti ac180 run time", "bluetti ac180 run a fridge", "bluetti ac180 run air conditioner", "can bluetti ac180 run a refrigerator", "bluetti ac180 fridge run time", "will a bluetti ac180 run a microwave", "how long can bluetti ac180 run a refrigerator", "what will a bluetti ac180 run", "what can a bluetti ac180 run", "bluetti ac180 cpap", "bluetti ac180 space heater" |
| Bluetti Elite 200 V2 | "bluetti elite 200 v2 run time", "how long will a bluetti elite 200 v2 run a refrigerator", "bluetti elite 200 v2 refrigerator" |
| Anker SOLIX C2000 Gen 2 | "anker solix c2000 run time", "anker solix c2000 refrigerator" |
| Bluetti Elite 300 | "bluetti elite 300 run time", "how long will a bluetti elite 300 run a refrigerator", "bluetti elite 300 refrigerator" |
| Bluetti Elite 100 V2 (no page) | "bluetti elite 100 v2 run a refrigerator", "bluetti elite 100 v2 run time" |

No run/appliance suggestions came back for Anker F3000, ALLPOWERS R1500 / S2000 Pro / R3500 or Growatt Helios 3600 /
Infinity 2000 Pro, so they got no page. Nature's Generator excluded (payment risk). The Elite 100 V2 has demand but the
same 1,024 Wh as the C1000 Gen 2 and an identical table, so it is compared on the C1000 Gen 2 page instead of getting a
near-copy. Google People Also Ask could not be read without a browser session; suggestions only.

### In stock (read 2026-11-11)

| Model | Check | Result |
|---|---|---|
| Bluetti AC180, Elite 200 V2, Elite 300, Elite 100 V2 | bluettipower.com/products/<handle>.js (Shopify product JSON) | available: true at $499, $899, $1,199, $499 (matches products.ts) |
| Anker SOLIX C1000 Gen 2 | https://www.ankersolix.com/products/c1000-gen2 | "Add to Cart"; "Units Only ... Available, ships as soon as possible" |
| Anker SOLIX C2000 Gen 2 | https://www.ankersolix.com/products/c2000-gen2 | "Add to Cart"; "Units Only ... Available, ships as soon as possible" |

Prices and specs on the pages come unchanged from src/data/products.ts, each shown with its own `retrieved` date.
The C1000 Gen 2 and C2000 Gen 2 records still carry a note that Anker said orders ship from Nov 21; on 2026-11-11 Anker's
page said units ship as soon as possible. products.ts was not changed (out of scope); worth refreshing on the next product check.

### Appliance watts

| Claim | Source | Read date |
|---|---|---|
| Refrigerator 700 W running, +2,200 W to start; sump pump 1/3 HP 800 W, +1,300 W; water well pump 1/3 HP 1,000 W, +2,000 W; furnace fan blower 1/3 HP 700 W, +1,400 W; window AC 12,000 BTU 3,250 W, +3,950 W; space heater 1,500 W; electric water heater 4,500 W; microwave 1,000 W; laptop 60 W | EWEB, Generator sizing considerations, https://www.eweb.org/documents/emergency-preparedness/generator-sizing-considerations.pdf | 2026-11-11 |
| Fridge 839 kWh a year (96 W average) | EIA RECS 2020 CE4.6.EL.ST (already in src/data/home-energy.json and lib/everyday.ts) | existing site source |
| Separate freezer 570 kWh a year; main TV 210 kWh a year | EIA RECS 2020 CE5.3b (existing LOAD_DEFS) | existing site source |
| CPAP 28 W with heated humidifier, 11 W without | ResMed battery guide (existing LOADS) | existing site source |
| Wi-Fi router 10 W; LED bulb 9 W; phone 15 Wh a charge | EnergySage; US DOE lighting fact sheet; TidBITS (existing LOADS) | existing site source |
| Closed fridge keeps food safe about 4 hours | FoodSafety.gov (existing OFFGRID_SOURCES) | existing site source |
| Generators outdoors, at least 20 ft from windows and doors | Ready.gov (existing OFFGRID_SOURCES) | existing site source |
| Wired-in furnace needs a transfer switch | NFPA tip sheet (existing OFFGRID_SOURCES) | existing site source |

### Formula (no new maths)

Run time = rated Wh x USABLE_FRACTION (0.85, lib/everyday.ts) / watts (DOE watts x hours, lib/offgrid.ts). Fridge, freezer
and TV use their all-day average from the EIA yearly kWh, as lifeTerms() and the outage calculator do. Start-up check is the
outage calculator's rule (running + biggest start <= surge, else continuous); a surge the maker labels for heating-type
loads only (Bluetti Power Lifting, noted in products.ts for the AC180 and Elite 200 V2) is not counted for motors.
tests/can-it-run.test.ts checks the fridge and CPAP figures equal lifeTerms().

## 2. State EV and energy incentives

Which pages Google shows: Search Console has "new hampshire ev tax credit" at position 26.6. The site has no NH incentive page;
the only page that matches is /states/new-hampshire, whose "Incentives in New Hampshire" section (id="incentives") says the
federal EV credits ended and links AFDC and DSIRE. So the state pages' incentives sections are what rank. They now carry a
program table, an "EV tax credit in 2026" FAQ (FAQPage markup) and, for these ten states, a title starting "<State> EV Tax
Credits & Rebates".

Which ten states: Google suggestions for "<state> ev tax credit" (read 2026-11-11) return the full 10 suggestions with
"2026" variants for the large EV markets. Picked: New Hampshire (the query we already rank for), plus California, Texas,
Florida, New York, New Jersey, Massachusetts, Colorado, Washington and Illinois (full suggestion lists, e.g. "california ev
tax credit 2026", "texas ev tax credit 2500", "colorado ev tax credit 2027", "illinois ev tax credit income limit").

### Federal credits

| Claim | Source | Read date |
|---|---|---|
| 30D and 25E: not allowed for vehicles acquired after September 30, 2025; 30C: property placed in service after June 30, 2026; 25D: expenditures after December 31, 2025; 25C: property placed in service after December 31, 2025 | IRS FAQs on Public Law 119-21 (FS-2025-05, Aug 21 2025), https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb | 2026-11-11 |

### State programs (src/data/state-incentives.ts)


### New Hampshire

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| EV registration surcharge | in-force; $100 a year for a battery EV, $50 for a plug-in hybrid, on top of normal registration; ends: No end date published | https://afdc.energy.gov/laws/13348 (via US DOE AFDC summary; the NH statute site would not load for us) | 2026-11-11 |
| NHSaves ducted air-source heat pump rebate (Eversource, Liberty, Unitil, NH Electric Co-op) | open; $250 per ton; $2,000 per ton when replacing electric resistance heat; up to 5 tons per account (Eversource, Liberty, Unitil); ends: Eversource, Liberty and Unitil: install by Dec 30, 2026 and postmark by Jan 30, 2027 | https://nhsaves.com/residential/electric-heating-cooling-equipment/ | 2026-11-11 |
| NHSaves heat pump water heater rebate | open; $900, instant at retailers or by mail; ends: Buy by Dec 31, 2026; submit by Jan 31, 2027 | https://nhsaves.com/residential/heat-pump-water-heater-2/ | 2026-11-11 |
| Home Electrification and Appliance Rebates (HEAR), NH Department of Energy | coming; Up to $8,000 for a heat pump, $1,750 for a heat pump water heater, $4,000 for a panel; $14,000 per household; ends: Expected to launch fall 2026 (page updated July 29, 2026); not retroactive | https://www.energy.nh.gov/funding-opportunities/funding-opportunities-homeowners/home-electrification-and-appliance-rebates | 2026-11-11 |
| NH Electric Co-op home charger rebate and off-peak EV rate | unstated; $300 after inspection of a Level 2 home charger; ends: No end date published | https://www.nhec.com/electric-vehicle-charging/ | 2026-11-11 |
| Liberty Utilities NH EV time-of-use rate | open; Cheaper overnight rate on a separately metered circuit (no dollar figure on the page); ends: No end date published | https://new-hampshire.libertyutilities.com/derry/residential/smart-energy-use/electric/electric-vehicle-residential-new-hampshire-liberty.html | 2026-11-11 |
| Eversource NH time-of-day rate (ROTOD-2) | open; Whole-house time-of-day rate; Eversource's NH EV page lists no charger rebate; ends: No end date published | https://www.eversource.com/residential/account-billing/manage-bill/about-your-bill/rates-tariffs/electric-delivery-rates/nh | 2026-11-11 |
| NH residential solar rebate | closed; Was $0.20 per watt, up to $1,000; ends: Permanently closed (repealed by SB 303 of 2024) | https://www.energy.nh.gov/renewable-energy/renewable-energy-rebates/residential-renewable-electrical-generation-rebate | 2026-11-11 |


### California

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| MyFirstEV instant rebate (California Air Resources Board) | open; $3,500 off a new EV; $1,750 off a used EV; ends: No end date published; one-time $135.5 million, while funding lasts | https://ww2.arb.ca.gov/resources/fact-sheets/myfirstev-frequently-asked-questions | 2026-11-11 |
| Clean Cars 4 All (Driving Clean Assistance Program, scrap and replace) | open; Amount not shown on the pages we could read; ends: No end date published; its separate financing option is closed | https://drivingcleanca.org/ | 2026-11-11 |
| PG&E Pre-Owned EV Rebate | open; $4,000 for income-qualified buyers; the $1,000 standard rebate ended Nov 11, 2026; ends: From Nov 12, 2026, income-qualified customers only | https://evrebates.pge.com/ | 2026-11-11 |
| PG&E Residential Charging Solutions Rebate | unstated; Up to 50% of a charger; income-qualified up to $2,000 for installation or $5,000 with a panel upgrade; ends: No end date published | https://www.pge.com/en/clean-energy/electric-vehicles/getting-started-with-electric-vehicles/residential-charging-solutions-rebate.html | 2026-11-11 |
| SGIP home battery rebates (Residential Solar and Storage Equity) | waitlist; $3.10 per watt of solar plus $1.10 per Wh of battery; ends: New applications due by June 30, 2028; utility-bill-funded budgets closed Dec 30, 2025 | https://www.selfgenca.com/home/program_metrics/ | 2026-11-11 |
| HEEHRA heat pump rebates, single-family (TECH Clean California) | waitlist; Varies by technology and income; ends: Fully reserved statewide since Feb 24, 2026 | https://techcleanca.com/incentives/single-family-incentives/ | 2026-11-11 |
| Road Improvement Fee (DMV) | in-force; $121 a year; ends: No end date published | https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/ | 2026-11-11 |


### Texas

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| TERP Light-Duty Motor Vehicle Purchase or Lease Incentive (TCEQ) | closed; Was $2,500 to buy or lease 3+ years; ends: Closed; the 2026 application deadline was Mar 6, 2026 | https://www.tceq.texas.gov/airquality/terp/ldplip | 2026-11-11 |
| Electric Vehicle Fee (TxDMV) | in-force; $200 a year at renewal; $400 up front on a new EV; ends: No end date published | https://www.txdmv.gov/motorists/register-your-vehicle | 2026-11-11 |
| Austin Energy Home EV Charger Rebate | open; Up to $500 or 50% of the charger price; ends: No end date published; first come, first served | https://austinenergy.com/green-power/plug-in-austin/home-charging | 2026-11-11 |
| Austin Energy Residential Solar Rebate | unstated; $4,000; ends: No end date published | https://austinenergy.com/green-power/solar-solutions/for-your-home | 2026-11-11 |
| Austin Energy Heat Pump Rebate | open; $650, $750 or $950 by efficiency; ends: No end date published; limited funding | https://austinenergy.com/energy-efficiency/rebates-incentives/residential/cooling-heating/ac | 2026-11-11 |


### Florida

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| Solar equipment sales tax exemption (Florida Department of Revenue) | in-force; Exempt from the 6% state sales tax; ends: No end date published | https://floridarevenue.com/taxes/taxesfees/pages/sales_tax_incent.aspx | 2026-11-11 |
| FPL EVolution Home (charger subscription) | open; $36 a month with installation, $27 equipment only, 10-year agreement; ends: No end date published | https://www.fpl.com/electric-vehicles/for-drivers/evolution-home.html | 2026-11-11 |
| FPL residential HVAC rebate | open; $200 per qualifying heat pump or central AC; ends: No end date published | https://www.fpl.com/content/dam/fplgp/us/en/save/pdf/residential-air-conditioning-program-standards.pdf | 2026-11-11 |
| OUC EV purchase or lease rebate (Orlando) | unstated; $200; ends: No end date published | https://www.ouc.com/solutions-programs/savings/rebates/electric-vehicle-purchase-lease/ | 2026-11-11 |


### New York

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| Drive Clean Rebate (NYSERDA) | open; $500 to $2,000 off a new EV at the dealer ($2,000 for 200+ miles of range; $500 if MSRP is over $42,000); ends: No end date published | https://www.nyserda.ny.gov/All-Programs/Drive-Clean-Rebate-For-Electric-Cars-Program | 2026-11-11 |
| Solar Energy System Equipment Credit (state income tax) | in-force; 25% of cost, up to $5,000; ends: No end date published | https://www.tax.ny.gov/pit/credits/solar_energy_system_equipment_credit.htm | 2026-11-11 |
| NY-Sun home solar incentive | open; Depends on size and location (not published on the consumer page); a new $200 million framework was announced Oct 14, 2026; ends: No end date published; incentives phase down over time | https://www.nyserda.ny.gov/All-Programs/NY-Sun/On-site-Solar/Homes/Paying-for-Solar | 2026-11-11 |
| Con Edison air-source heat pump incentives (NYS Clean Heat) | open; Up to $11,000 ($7,000 standard full replacement); ends: No end date published | https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-residential-customers/electric-heating-and-cooling-technology-for-renters-homeowners/save-on-a-central-air-source-heat-pump | 2026-11-11 |
| Con Edison SmartCharge NY | open; 10 cents per kWh charged midnight to 8am, plus bonuses; about $400 a year on average; ends: No end date published | https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-residential-customers/electric-vehicle-rewards | 2026-11-11 |


### New Jersey

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| Charge Up New Jersey (with income-based Charge Up+) | open; $1,500 at the dealer; up to $4,000 in all with Charge Up+; ends: No end date published; $50 million for fiscal 2026 and $30 million for fiscal 2027 | https://chargeup.njcleanenergy.com/ | 2026-11-11 |
| Charge Up in-home charger incentive | open; Up to $250; ends: No end date published | https://chargeup.njcleanenergy.com/ | 2026-11-11 |
| Zero-emission vehicle sales tax exemption | closed; Ended: EVs now pay the full 6.625% sales tax; ends: Ended June 30, 2025 | https://www.nj.gov/treasury/taxation/pdf/help/2025-update-handout.pdf | 2026-11-11 |
| Annual zero-emission vehicle fee (NJ MVC) | in-force; $250 a year from July 1, 2024, rising $10 a year for four years; ends: No end date published | https://www.nj.gov/mvc/vehicles/regfees.htm | 2026-11-11 |


### Massachusetts

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| MOR-EV rebates (Standard, Used, MOR-EV+, Trade-In) | open; $3,500 new; $3,500 used (income-qualified); +$1,500 MOR-EV+; +$1,000 for trading in a gas car; ends: No end date published | https://mor-ev.org/cars-overview | 2026-11-11 |
| Mass Save air-source heat pump rebates | open; Whole-home $2,650 per ton up to $8,500 in 2026; income-based up to $16,000; ends: Whole-home rate drops to $2,350 per ton (cap $7,500) for installs from Jan 1, 2027 | https://www.masssave.com/en/residential/rebates-offers-services/heating-and-cooling/heat-pumps/air-source-heat-pumps | 2026-11-11 |
| National Grid EV Charging Upgrade Program | open; Up to $700 for wiring; up to $1,000 in environmental justice areas or on the R-2 low-income rate; ends: Apply by Dec 10, 2026 | https://www.nationalgridus.com/electric-vehicle-hub/Programs/Massachusetts/EV-Charging-Upgrade-Program | 2026-11-11 |
| Eversource MA EV Charging Rebate | closed; Wiring and panel costs; ends: Closed for 2026: the deadline was Nov 1, 2026 | https://www.eversource.com/residential/save-money-energy/clean-energy-options/electric-vehicles/charging-stations/wma | 2026-11-11 |
| Residential Renewable Energy Income Tax Credit | in-force; 15% of net cost, up to $1,000; ends: No end date published | https://www.mass.gov/info-details/massachusetts-residential-property-tax-credits | 2026-11-11 |


### Colorado

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| Innovative Motor Vehicle Credit (Colorado Department of Revenue) | open; $750 in tax year 2026 ($3,500 in 2025); +$2,500 if MSRP is under $35,000; 2027-2028 amounts set by revenue forecasts; ends: The extra $2,500 runs through tax year 2028; no end date published for the base credit | https://tax.colorado.gov/income-tax-topics-innovative-motor-vehicle-credit | 2026-11-11 |
| Vehicle Exchange Colorado | open; $9,000 off a new EV; $6,000 off a used EV, at the dealer; ends: No end date published; subject to available funds | https://energyoffice.colorado.gov/vehicle-exchange-colorado | 2026-11-11 |
| Colorado Heat Pump Tax Credit (as a contractor discount) | open; 2026: air-source $1,000 credit with at least $333 off your bill; ground-source $2,000 / $667; heat pump water heater $250 / $83; ends: Amounts drop again in tax year 2029 | https://energyoffice.colorado.gov/hptc | 2026-11-11 |
| EV registration and road usage fees | in-force; $63.05 plug-in EV fee plus a $26 road usage fee for a battery EV ($13 PHEV), July 1, 2026 to June 30, 2027; ends: Schedule rises yearly through June 30, 2032 | https://dmv.colorado.gov/taxes-and-fees | 2026-11-11 |


### Washington

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| EV sales and use tax exemption | closed; Was up to $15,000 of a new EV's price ($16,000 used); ends: Expired July 31, 2025 | https://dor.wa.gov/content/clean-alternative-fuel-and-plug-hybrid-vehicles-salesuse-tax-exemptions | 2026-11-11 |
| WA EV Instant Rebate (Department of Commerce) | closed; Was $2,500 to $9,000 at the dealer; ends: Round 1 funds spent; a new program is planned for Jan to June 2027 | https://www.commerce.wa.gov/clean-transportation/ | 2026-11-11 |
| EV registration fees (Department of Licensing) | in-force; $225 a year: $100 + $50 electric car fees and a $75 transportation electrification fee; ends: No end date published | https://dol.wa.gov/vehicles-and-boats/vehicles/vehicle-registration/calculate-vehicle-tab-fees | 2026-11-11 |
| State Home Electrification and Appliance Rebates (HEAR) | open; Set by each of 40 local administrators ($39.3 million awarded); ends: No end date published | https://www.commerce.wa.gov/energy-incentives/hear/ | 2026-11-11 |


### Illinois

| Claim (program) | Status, amount, end date as shown | Source read | Read date |
|---|---|---|---|
| Illinois EPA Electric Vehicle Rebate | open; $4,000 low-income; $2,000 other eligible buyers; $1,500 electric motorcycle; ends: This cycle runs Aug 1 to Dec 31, 2026, while funds last; postmark within 180 days of purchase | https://epa.illinois.gov/topics/ceja/electric-vehicle-rebates.html | 2026-11-11 |
| ComEd Residential EV Charger and Installation Rebate | coming; Up to $2,500 low-income or in low-income communities; up to $750 others; ends: Next window Jan 1 to Dec 31, 2027 | https://www.comed.com/about-us/clean-energy/electric-vehicle-charger-and-installation-rebate | 2026-11-11 |
| Battery EV fee | in-force; $100 a year on top of registration; ends: No end date published | https://afdc.energy.gov/laws/12254 (via US DOE AFDC summary; the Secretary of State's site would not load for us) | 2026-11-11 |

### State "EV tax credit" one-liners

| State | Claim | Basis |
|---|---|---|
| NH | No state EV credit or rebate | NH Dept of Energy pages list none; AFDC NH summary (https://afdc.energy.gov/laws/state_summary?state=NH) shows no state purchase incentive |
| CA | No state EV tax credit; CVRP closed Nov 8, 2023; MyFirstEV launched Aug 7, 2026 | AFDC CA summary; https://cleanvehiclerebate.org/en; CARB MyFirstEV news release https://ww2.arb.ca.gov/news/california-launches-myfirstev-instant-rebate-program-first-time-buyers |
| TX | No state EV tax credit; TERP grant closed | AFDC TX summary; TCEQ program page ("Currently Closed") and 2026 RFGA (deadline Mar 6, 2026) |
| FL | No state EV credit or rebate; SB 804 ($250 EV fee) died Mar 13, 2026 | AFDC FL summary; https://www.flsenate.gov/Session/Bill/2026/804 |
| NY, NJ, MA | No state tax credit; the state offers are rebates | Agency pages describe rebates only (no tax-office page says outright there is no credit) |
| CO | Innovative Motor Vehicle Credit $750 in tax year 2026 ($3,500 in 2025), +$2,500 under $35,000 MSRP | Colorado DOR page in the table |
| WA | Sales tax exemption expired Jul 31, 2025; instant rebate funds spent; new $5M program RFP (proposals due Nov 20, 2026, Jan-Jun 2027) | WA DOR and Commerce pages in the table |
| IL | No tax credit; Illinois EPA rebate open Aug 1 to Dec 31, 2026 | Illinois EPA page in the table |

### Read but left out (could not confirm on an official page)

PSE&G (NJ) charger and heat pump rebates and JCP&L heat pumps (pages blocked); NJ DEP heat pump page (blank); NY-Sun per-watt
rates (only in search snippets); Unitil NH Ready2Charge (site blocked); AFDC's "Eversource NH Level 2 rebate" (Eversource's own
NH pages show none); NH HB 1594 weight-based EV fee from 2027 (could not open gc.nh.gov to confirm enactment); Xcel Colorado
charger rebate (no current amount on a page that loaded); Puget Sound Energy (geo-blocked); ComEd heat pump amounts and the
ComEd distributed-generation rebate (only a 2024 terms PDF); Duke Energy Florida and JEA credits (sites would not load);
CA Clean Cars 4 All amounts (administrator pages returned 403; row kept with "amount not shown"); SCE and CPUC (sites down).
