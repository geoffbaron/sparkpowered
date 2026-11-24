# Fact-check log: five "best answer" pages (Nov 24 2026)

Rule from Geoff (Nov 24): no testing claims, no photos we don't own, no prices; proof is research, cited by page. Every citation with its page or section is in `src/data/backup-sources.ts`; this file records choices and what could not be sourced.

## Pages and why

| Page | Question | Why picked (demand research Nov 24) |
|---|---|---|
| /home-backup | how to connect a portable power station to a house; transfer switch for a power station | Cluster C autocomplete; results are forums plus maker blogs; the "which switch fits which station" gap |
| /home-backup/anker-solix-f3800-plus-hookup | anker f3800 plus transfer switch | Named in the report; live Google is Anker pages, forums, YouTube |
| /home-backup/bluetti-apex-300-hookup | bluetti apex 300 transfer switch | Named in the report; Reddit/forum-held |
| /home-backup/well-pump | power station for well pump (240 V) | Named in the report; forums, spec sites, retailers |
| /power-station-for-refrigerator | how long will a power station run a refrigerator; power outage fridge/freezer | Clusters B and I; programmatic sites, brand blogs, and food-safety pages that don't size the battery |

Not picked: furnace blower (Nov 14 live check: page 1 is three maker blogs, two spec sites, a retailer), sump pump (brand blogs own every phrasing; only a measured test would win).

## Changes against the old pages
- Removed HomeGuide installed-cost ranges (prices) and stock photos (HubHero/PhotoCredit) from all five.
- Stock claims dated Nov 14 dropped, except one dated mention on the well pump page.
- Fridge figure: the page now uses EIA CE5.3b per-appliance figures (main fridge 618 kWh, freezer 569 kWh at 3,412 Btu/kWh). The site's 839 kWh (CE4.6) is all refrigerators per household; the picker still defaults to it and says so.

## New facts and where
- F3800 Plus: LRA 80 A and soft-starter note (manual PDF p.6); 240 V outlet off while charging from 120 V (p.14 Q9); outlet ratings (p.15). Manual copy is retailer-hosted (santansolar.com); no Anker-hosted PDF found.
- Apex 300: outlet table p.16/p.26; Power Lifting p.18; UPS p.19; B300K p.22; "2-4 times" and run-time formula p.28. No neutral-bonding statement in V1.0 or V3.1.
- NEC: 702.4 from NFPA 2023 Second Draft p.79; 702.5 via Mike Holt in EC&M (2025); "interlocking device" in 2026 Second Draft p.99; inlet sign from Holt's 2014 notes p.21-22; 445.11 from 2023 draft p.27. Printed 2020/2023 book text not read (NFPA free access blocks automated reading); pages say "draft" where they quote it.
- Franklin AIM 2026: generator minimum rating table printed p.7 (2-wire/3-wire columns, no regulation columns in this edition).

## Could not source (left out or said less)
- Whether the Apex 300 output neutral is bonded: not published; page tells the reader to ask Bluetti in writing.
- F3800 Plus bonding: only owner-quoted support replies (conflicting); presented as owner reports.
- FoodSafety.gov and USDA FSIS wording (403 to every fetch): CDC used instead.
- How to read the EnergyGuide label (FTC page 404): mentioned only as "the kWh a year on the label".
- Any owner report of an F3800 Plus or Apex 300 starting a well pump: none found; the page says so.
- EcoFlow Smart Home Panel compatibility: not re-read, dropped from the hub.
- Penn State Extension well advice (405): not used. "Pressure tank holds a few gallons": no government or university source; page says only that the tank's water is usable.

## Safety pass (Nov 24)
Every panel method says licensed electrician + permit; backfeeding named only as never safe (CPSC); no wiring steps, wire or breaker sizes given to the reader; "don't remove a ground wire on a forum post's advice"; no homemade adapter cords; soft starters fitted by an electrician or pump installer; "not tested" stated in every Sources box.
