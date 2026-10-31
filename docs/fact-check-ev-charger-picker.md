# Fact check: /ev-charger-picker (Oct 31 2026)

Every number the picker or its page shows, where it comes from, and a second-pass re-check done the same day.
Code: src/lib/ev-charger-picker.ts (logic), src/lib/ev-charger-picker-data.ts (data passed in), src/components/EvChargerPicker.tsx, src/app/ev-charger-picker/page.tsx.

| # | Claim | Source | Pass 1 | Pass 2 (re-checked Oct 31) |
|---|---|---|---|---|
| 1 | Lectron NEXUS J1772 40A: $419.99 (list $479.99), 23 ft cable, IP66, NEMA 14-50, 3-yr warranty, up to 38 mi/hr | ev-lectron.com product page (+ .js product JSON) | Price read from Shopify JSON | WebFetch of the page: $419.99, list $479.99, IP66, 23 ft, 3-yr. List price was $469.99 on Oct 15; updated in src/data/chargers.ts. No adjustable-amp settings stated, so the picker never offers it for a 32 A or 24 A circuit |
| 2 | Lectron NEXUS NACS 40A: $419.99 | ev-lectron.com product page JSON | $419.99, list $479.99 | same |
| 3 | Lectron portable NACS: $319.99 (list $369.99), adjustable 8-40 A, ordinary outlet + NEMA 14-50 plugs, pre-order shipping mid-November | ev-lectron.com product page HTML | price 31999 / compare 36999, "SHIPS IN MID-NOVEMBER", "Pre-order" | same |
| 4 | Autel MaxiCharger AC Elite Home 40A: $559, NEMA 14-50, adjustable up to 40 A, 25 ft J1772 cable, indoor or outdoor, app scheduling | autelenergy.us product JSON | $559, description "adjustable charging up to 40 Amps", "installable indoors or outdoors" | same |
| 5 | Autel 50A hardwired: $599, adjustable up to 50 A, NEMA 4 enclosure, "Recommended hardwire for outdoor installation", 25 ft cable | autelenergy.us product page | $599, all specs found in page text | same |
| 6 | Autel sells no NACS version in the US | autelenergy.us (comparison table lists only J1772 models: 14-50, 6-50, hardwired) | yes | same |
| 7 | Circuit = 125% of charger draw: 24->30, 32->40, 40->50, 48->60 A; plug-in only on 40 or 50 A circuits (32 or 40 A); 24 A ~18 mi/hr; 40 A ~30 mi/hr | ChargePoint Home Flex installation FAQ table | matches existing /questions/ev-charging answers | Re-read table: 16/20, 24/30, 32/40, 40/50, 48/60, 50/70-80; plug-in 32 and 40 only. Confirmed |
| 8 | Hardwiring recommended where local code requires a GFCI breaker on the outlet; best option outdoors | ChargePoint Home Flex FAQ | yes | confirmed |
| 9 | 30 A dryer circuit -> 24 A charging; nothing else on it while charging; have an electrician check | ChargePoint table + existing site answer (dryer-outlet-ev) | yes | confirmed (24 A row = 30 A breaker) |
| 10 | Overnight window of 8 hours; Level 1 about 5 mi/hr, about 40 miles in 8 hours | DOE AFDC charging stations page | site already uses it | Re-read: "about 40 miles of electric range for a mid-size EV" in 8 hours, ~5 mi per hour. Our arithmetic (12 A x 120 V = 1.44 kW / 31.1 kWh/100 mi) gives 4.6 mi/hr, 37 mi in 8 hours: consistent |
| 11 | kWh per 100 miles: Tesla Model 3 Standard RWD 24.3, Chevrolet Equinox EV FWD 31.1, Silverado EV Ext Range WT 47.8 | EPA/DOE fueleconomy.gov (state-energy.json referenceEvs) | from data file | unchanged data file |
| 12 | Miles of range per hour = kW / (kWh/100 mi / 100); 40 A = 9.6 kW -> ~31 mi/hr for the Equinox EV | Our arithmetic, same as components/chargers.tsx milesPerHourAt | yes | ChargePoint says ~30 at 40 A: consistent |
| 13 | 40 miles in an Equinox EV = about 12 kWh; about 1.5 h at 32 A (1.6 h) and at 40 A (1.3 h), rounded to the nearest half hour; Level 1 about 9 h | Arithmetic from 10-12 | computed in page | re-computed: 12.44 kWh; 1.62 h; 1.30 h; 8.6 h. Page rounds to nearest half hour |
| 14 | 150 miles a day in the Silverado EV refills overnight at 40 A (71.7 kWh / 9.6 kW = 7.5 h) | Arithmetic | test asserts it | confirmed |
| 15 | Installation: US average $2,442 (Qmerit 2026 via EnergySage), state averages (e.g. CA $2,576, OR $1,834, MS $3,680) | EnergySage, updated June 22 2026 (INSTALL_COST) | from data file | Re-read page: all confirmed |
| 16 | Subpanel +$500-1,500; service upgrade +$1,500-4,000+; long run 60-80 ft +$1,000-1,500; permits $50-800 | EnergySage | from data file | confirmed |
| 17 | Existing outlet: plug-in charger installs for $0 | Site's existing claim on /ev-charger-installation-cost (no new circuit needed) | yes | Picker adds "pay an electrician to check it" |
| 18 | Federal charger credit (30C) not allowed for property placed in service after June 30, 2026 | IRS FS-2025-05 FAQ (site's incentives wording) | yes | same wording as /ev-charger-installation-cost and /questions |
| 19 | Installs must meet local and state codes; permits may be required; electricians can tell you whether you have capacity | DOE AFDC "Charging at home" | yes | Re-read: "Appropriate permits may be required"; "must comply with local and state codes" |
| 20 | Most automakers committed to the NACS (SAE J3400) port from 2025; non-Tesla EVs built through 2024 have CCS1 | Joint Office of Energy and Transportation, driveelectric.gov/charging-connector | WebFetch Oct 31 | Wording kept to "committed"; picker says "check your car" and lists no models |
| 21 | "Most people need 32-40 A" | Follows from rows 10-14: every miles/car combination in the picker (up to 150 mi in a pickup) needs 40 A or less in 8 hours | unit test "Most drivers need 32-40 A" | confirmed |
| 22 | Autel recommends hardwiring outdoors | autelenergy.us 50A page "*Recommended hardwire for outdoor installation" | yes | confirmed |

Not claimed (deliberately): specific NACS car models, wiring steps, utility rebate amounts, any brand we have no checked page for.
Disclosure: "We earn a commission if you buy through this link." sits next to every product link (unit test + e2e check), plus the site-wide disclosure box above the picker.

Update Oct 31 2026: EVIQO added as a third brand (J1772 and NACS, plug-in and hardwired). Specs, prices, sources and how it is ranked: docs/fact-check-eviqo.md. The "hardwired NACS -> spec only" answer now links the EVIQO NACS 48 A hardwired charger.
