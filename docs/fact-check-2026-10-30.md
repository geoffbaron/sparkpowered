# Fact check, 30 October 2026

Every new fact added to the site on this date, with the official source it was read from.
Re-check before changing a figure; drop a program once its own page says it has closed.

## State pages: local facts (src/data/state-local.ts)

| State | Fact | Source | Supporting text on the source |
|---|---|---|---|
| All 5 + US | Average residential price, August 2026 vs August 2025 (cents/kWh): IL 19.32 / 18.03, HI 47.18 / 38.53, CO 17.17 / 16.21, KS 15.47 / 14.65, OH 19.38 / 17.55, US 18.16 / 17.57 | EIA Electric Power Monthly Table 5.6.A, released 23 Oct 2026 (2026 preliminary) https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a | Table values |
| IL | ComEd and Ameren Illinois are the two big investor-owned utilities; MidAmerican and Mt. Carmel also listed | ICC https://www.icc.illinois.gov/authority/electric-utility | Utility list |
| IL | IEPA EV rebate cycle 1 Aug to 31 Dec 2026; $2,000 all-electric car, $4,000 low-income, $1,500 electric motorcycle; Illinois dealer, price $80,000 or less, funds permitting | https://epa.illinois.gov/topics/ceja/electric-vehicle-rebates.html | "opened on August 1, 2026 and is open until December 31, 2026" |
| IL | Illinois Shines covers home (distributed generation) systems up to 25 kW; incentive paid to Approved Vendors, may be passed on | https://illinoisshines.com/small-distributed-generation/ and https://illinoisshines.com/ | "projects up to and including 25 kW in size"; "may be passed on to customers as savings" |
| HI | Hawaiian Electric serves about 95% of residents on Oahu, Maui, Molokai, Lanai, Hawaii Island; KIUC serves Kauai | https://www.hawaiianelectric.com/about-us/power-facts ; https://www.kiuc.coop/about-us | "provides electricity for 95% of residents" |
| HI | State income tax credit for solar electric on single-family home: lesser of 35% of cost or $5,000; solar water heater lesser of 35% or $2,250; utility rebates subtracted first | Form N-342 instructions Rev. 2025 https://files.hawaii.gov/tax/forms/2025/n342ins.pdf | "The lesser of 35% of the actual cost of the system or $5,000" |
| HI | Hawaii Energy: up to $700 instant in-store rebate on a qualifying ENERGY STAR heat pump water heater; not on Kauai; funds permitting | https://hawaiienergy.com/for-homes/water-heating/heat-pump ; https://hawaiienergy.com/for-homes/rebates | "up to a $700 instant in-store rebate" |
| CO | PUC regulates two investor-owned electric utilities, Xcel Energy and Black Hills; co-ops and municipal utilities serve others | https://puc.colorado.gov/electric-rate-cases | "regulates electric rates for two investor-owned utilities" (read via search preview; page blocked automated fetch) |
| CO | EV credit for 2026 purchase or lease: $750; extra $2,500 if MSRP under $35,000 (tax years 2024-2028); no credit if MSRP over $80,000 | Colorado DOR, Innovative Motor Vehicle Credit (Nov 2025) https://tax.colorado.gov/sites/tax/files/documents/ITT_Innovative_Motor_Vehicle_Credit_Nov_2025.pdf | 2026 row "$750 / $750"; "additional credit of $2,500 ... MSRP under $35,000" |
| KS | Evergy and Empire District are the two IOUs and must offer net metering; co-ops and municipals are not mandated | KCC https://www.kcc.ks.gov/electric/net-metering-in-kansas | "Electric cooperatives and municipal electric providers are not mandated to offer net metering by statute." |
| OH | Main utilities: AEP Ohio (Ohio Power), FirstEnergy, Duke Energy Ohio, AES Ohio | OCC https://occ.ohio.gov/factsheet/electric-bill-made-easy | Sample-bill list |
| OH | Customers can choose their electricity supplier; compare with the Price to Compare | OCC https://www.occ.ohio.gov/factsheet/energy-choice-how-make-wise-energy-choices | "they can choose the supplier for the electricity" |

### Checked but left out (could not confirm on an official page today)
- Colorado heat pump tax credit amount for 2026 (Colorado Energy Office page blocked).
- Xcel Energy Colorado heat pump and EV charger rebates (only a 2024 sheet found).
- Evergy Kansas heat pump rebates (evergy.com blocked; search snippets only).
- ComEd and Ameren Illinois heat pump discounts (pages empty or blocked).
- Whether Illinois Shines residential capacity is open right now (no live status page).
- Any Ohio state or utility rebate open today (none confirmed).
- Kansas 150 kW export limit wording (ambiguous on KCC page).
- Service-area split for ComEd / Ameren (not on the ICC page).

## Retitles (no new facts)
- /solar-calculator: "Solar Panel Savings Calculator: Panels You Need and What They Save". Page already shows value per year and break-even price per watt.
- /ev-charging-cost: "Cost to Charge an Electric Car at Home, by State (2026 Calculator)".
- /compare/ecoflow-vs-bluetti and /compare/anker-solix-vs-ecoflow: retitled to lead with "EcoFlow vs ..."; each now links to the other so the "how Anker SOLIX / Bluetti compares" line in the description is true.

## Question pages: worked examples (src/data/questions.ts, EXAMPLES)

All 34 examples are arithmetic on figures the site already sources and dates (see the header of
src/data/questions.ts and ~/Grant/marketing/sparkpowered-questions/fact-check.md): EIA prices and
usage, PVWatts output, EPA efficiency, EnergySage solar and battery prices, makers' spec sheets
(Tesla, Enphase, Bluetti, Minn Kota, Redodo, Renogy, ePropulsion, Lectron), ChargePoint's circuit
table, the IRS 25D/30C/30D FAQ and federal efficiency standards. The numbers are computed in code
from those datasets, so the page and the data cannot drift. Each example names its one source and
links the matching calculator. A test (tests/questions.test.ts) checks that every question has one.

New external fact used in an example: the Illinois EPA EV rebate (state-rebates), sourced above.
Stated assumptions, labelled as such on the page: 10 hours of Level 1 charging a night; a 6 kW
Ohio system; 300 kWh a month exported (net metering); 8-hour overnight charging windows.
