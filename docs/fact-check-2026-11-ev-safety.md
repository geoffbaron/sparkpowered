# Fact-check log: EV charger safety pages (WP4, Nov 14 2026)

Builder: worktree sp-evD. Separate from the home-backup cluster log.

## /ev-charger-tripping-gfci

Live Google, Nov 14 2026, query "level 2 ev charger keeps tripping gfci breaker" (hl=en, gl=us). AI Overview shown.

1. reddit.com/r/evcharging (Recently installed charger keeps tripping breaker)
2. forums.mikeholt.com (EV chargers tripping GFCI breakers)
3. downeastelectrical.com (local electrician, Maine)
4. evchargeright.com (blog)
5. accurateelectricfl.com (local electrician, Florida)
6. diy.stackexchange.com (40A GFCI breaker keeps tripping)
7. facebook.com group post
8. qmerit.com (Hardwired vs plug-in, NEMA 14-50, GFCI) — installer network blog; page sits behind a bot check, not read.

Decision: build. Page 1 is forums and local electricians; no maker or strong publisher page answers it with the code section and the makers' manuals side by side.

| Claim | Source | Read |
|---|---|---|
| NEC 625.54: all receptacles installed for the connection of EV charging shall have GFCI protection for personnel (current 2026 text, struck through in the TIA) | NFPA, NFPA 70-2026 Proposed TIA 1892 (docinfofiles.nfpa.org/files/AboutTheCodes/70/NFPA_70_Proposed_TIA_1892.pdf) | 2026-11-14 |
| Same rule, "all receptacles installed to connect EV supply equipment must be GFCI protected" | Mike Holt, NEC requirements for EV equipment, EC&M, Nov 9 2023 | 2026-11-14 |
| NFPA task group: EVSE personnel-protection trip levels not compatible with GFCI trip levels; current wording led to failed inspections, inspector inconsistency and "unwanted tripping" | NFPA TIA 1892 substantiation (comment closing May 20 2026). Status after that date not confirmed, so the page calls it a proposal | 2026-11-14 |
| GFCI trips at a difference "as little as 0.006 amperes" | CPSC fact sheet "What is a GFCI?" (cpsc.gov/s3fs-public/099_0.pdf) | 2026-11-14 |
| Autel charger ground fault detection "20 mA CCID with auto retry" | Autel MaxiCharger AC Wallbox Home user manual, linked from autelenergy.us/pages/downloads | 2026-11-14 |
| Autel Home manual: 240 V dedicated circuit with "a new, dedicated, and non-GFCI two-pole circuit breaker"; licensed electrician; error codes "Ground fault" and "Residual current detected" (Elite manual); plug cord can be removed and replaced with a hardwire | Autel AC Wallbox Home manual (and AC Elite Residential manual v2.1) | 2026-11-14 |
| Autel's newer charger: built-in GFCI, "can also be installed on an existing GFCI breaker without any issue" | Autel MaxiCharger Single Charger manual, UL model, v2.0 (Oct 17 2025), autelenergy.us downloads | 2026-11-14 |
| ChargePoint: non-GFCI breaker; "If local codes require a GFCI breaker for plug-in installation, ChargePoint recommends a hardwire installation"; does not recommend GFCI breaker because Home Flex has CCID; "A GFCI breaker in the panel causes nuisance tripping" | ChargePoint docs, Home Flex pre-installation guidelines for electricians; ChargePoint Home Flex installation FAQ | 2026-11-14 |
| ChargePoint sells a separate hardwire version of Home Flex | ChargePoint Home Flex installation FAQ | 2026-11-14 |
| EVIQO: built-in GFCI; two GFCI protections "can interfere with each other, causing nuisance tripping"; suggests the electrician replace the GFCI breaker with a standard one | EVIQO help center, Breaker is tripping: GFCI breaker? (updated Apr 10 2026). Page reports this and flags the conflict with 625.54 on an outlet; it does not recommend it | 2026-11-14 |
| EVIQO: no separate GFCI breaker required for hardwired install; consult licensed electrician on local code | EVIQO help center, Is a GFCI breaker required for hardwired installation? | 2026-11-14 |
| EVIQO hardwired: 48 A, dedicated 60 A circuit, licensed electrician | EVIQO help center, Plug-in vs hardwire; src/data/chargers.ts | 2026-11-14 |
| EVIQO app notifies on errors (red LED + app) | EVIQO help center, Built-in safety functions | 2026-11-14 |
| Hardwire vs plug-in install difference about $100 to $200 | EnergySage via INSTALL_COST (src/data/buyer-guides.ts, existing) | existing, 2026-10-19 |
| 50 A outlet caps charging at 40 A (continuous load, 125%) | NEC 625.41 via site's existing sources (safety review 2026-11-12) | existing |

Prices shown on the page come from src/data/chargers.ts. Re-read in Chrome today (Shopify .js on the maker's own store), all unchanged, `retrieved` moved to 2026-11-14:
- EVIQO Level 2 J1772 48A hardwired: $450.99 (compare at $579.99)
- EVIQO NACS 48A hardwired: $480.99 (compare at $599)
- Autel MaxiCharger AC Elite Home 50A hardwired: $599
- EVIQO Level 2 J1772 plug-in 40A / hardwired 48A: $299 (compare at $499) (not on these pages; re-read only)

Store links: only the three hardwired-only chargers above (EVIQO and Autel, both AFFILIATES[brand].tracked), only on this page, AffiliateDisclosure above the first, commission note beside each (tests/ev-safety-pages.test.ts).

Left out (could not confirm from a primary source): that a charger's start-up self-test trips upstream GFCIs; Grizzl-E manual wording (official PDF 404); NEC 210.8(F) details for outdoor hardwired chargers (page only says other GFCI rules can apply outdoors and the inspector decides).

Safety pass done (standard: ~/Grant/marketing/threads/sparkpowered-seo-safety-review.md). Checked: "licensed electrician" is the instruction in the quick answer, the checks section, the fix section, the FAQ and the disclaimer; owner checks need no tools and no covers off (panel door only, never the cover); reset once then stop; stop-signs (heat, melting, burning smell) say breaker off and don't use the outlet; explicit "Never" box (no DIY breaker swap, no GFCI bypass device, no adapter or extension cord, don't open the charger, don't keep resetting); EVIQO's breaker-swap advice is reported only as a conflict with code and "never a do-it-yourself job"; permit mentioned; local inspector has the final word.

## /ev-charger-extension-cord

Live Google, Nov 14 2026, query "can i use an extension cord for level 2 ev charger" (hl=en, gl=us). AI Overview shown (answers "No", leaning on KBB).

1. reddit.com/r/electricvehicles (Extension cord?)
2. kbb.com (Charging an EV? Don't Use an Extension Cord) — blocked our browser (Access Denied), not read. From the result and AI Overview it is about household cords and automakers' manuals.
3. facebook.com group post
4. ev-lectron.com blog (Can you use an extension cord with a car charger) — says purpose-built EV extension cords are safe and sells them
5. thedrive.com (Turns out you can buy an extension cord for your EV charger)
6. insideevsforum.com thread
7. evcharging.blog
8. cables.com (EV charger extension cords, a store)

Decision: build. KBB answers the general question, but nothing on page 1 lays out the Level 2 charger makers' own manuals, and two of the top 8 (a maker blog and a store) push extension cords, which contradicts that maker's own manual.

| Claim | Source | Read |
|---|---|---|
| Tesla Wall Connector: "Cord extension sets are not allowed to be used." "No adapters or conversion adapters are allowed to be used." | Tesla energylibrary, Wall Connector Gen 3 (J1772) install manual, Important Safety Information | 2026-11-14 |
| Tesla Mobile Connector: "Do not use an extension cord, a multi-outlet adapter, a multi-plug, a conversion plug, or a power strip to plug in the Mobile Connector." | Tesla Mobile Connector Gen 3 owner's manual (en-na) and Gen 2 owner's manual, digitalassets.tesla.com | 2026-11-14 |
| Lectron: "Never use the charger with an extension cord." "Never use the charger with any AC adapter." | Lectron 40 Amp Level 2 EV Charger user manual (NEMA 14-50), hosted by distributor Transend (cdn.transend.us) | 2026-11-14 |
| Autel: "To avoid a risk of fire or electric shock, do not use this device with an extension cord." | Autel MaxiCharger AC Elite Business user manual (autelenergy.us downloads); same sentence in AC Elite Residential manual v2.1 | 2026-11-14 |
| EVIQO: adapters and extension cords not recommended, can introduce resistance, overheating and voltage drops; non-approved adapters may void the warranty | EVIQO help center, Can the plug-in charger be used with a NEMA 14-30 outlet? (updated Apr 10 2026) | 2026-11-14 |
| Lectron sells 20-ft Tesla and J1772 EV extension cables; its blog says purpose-built cords are safe | Lectron blog, Jul 17 2024 (not linked on the page: an ev-lectron.com citation would render as a tracked Awin link, and this page carries no store links) | 2026-11-14 |
| EV charging is a continuous load; 50 A outlet allows 40 A | NEC 625.40/625.41 via EC&M apprentice's guide to Article 625 | existing (2026-11-12) |
| 60 to 80 ft wire run adds $1,000 to $1,500 | EnergySage via INSTALL_COST.longRun (existing) | existing, 2026-10-19 |
| Home charger cables 23 to 25 ft | computed from src/data/chargers.ts and OTHER_CHARGERS cableFt | 2026-11-14 |

Left out: NEC 625.17 25-ft cable limit (only found in old or forum text, not confirmed in the current edition); Grizzl-E and ChargePoint extension wording (not found in their documents we could read).

Store links: none. This page's answer is not "hardwire" (the hardwire option is one of five and links to our own pages). Test guards that no tracked link appears, citations included.

Safety pass done. Checked: the answer is "no" in the title, quick answer and first FAQ; household cords, power strips, multi-plugs and adapters ruled out for Level 1 and Level 2; heat/discoloration/burning smell says switch off the breaker and call a licensed electrician; new outlets and hardwiring by a licensed electrician with a permit where required; "EV extension cables" covered with "follow your manual; if it doesn't approve one by name, don't use one"; public charging as the tonight option.
