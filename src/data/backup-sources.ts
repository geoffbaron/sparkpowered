/**
 * Citations for the five rebuilt home backup pages (Nov 24 2026). Each entry is a
 * document we read on `read`, with the page or section the claim comes from in
 * `what`. Logged in docs/fact-check-2026-11-24-best-answer.md. Plain values only.
 */

import type { CheckedSource } from "@/components/home-backup";

const NOV24 = "2026-11-24";
const NOV14 = "2026-11-14";

export const SRC = {
  // Safety agencies
  cpsc: {
    name: "CPSC, Portable generators safety alert, pub. 5123 (PDF)",
    url: "https://www.cpsc.gov/s3fs-public/5123_SafetyAlert_PortableGenerators_102021.pdf",
    read: NOV24,
    what: "page 1: never power house wiring by plugging into a wall outlet (backfeeding)",
  },
  osha: {
    name: "OSHA, Using portable generators safely, FS-3286 (PDF)",
    url: "https://www.osha.gov/sites/default/files/publications/OSHA3286.pdf",
    read: NOV24,
    what: "page 1: never connect to a structure unless a qualified electrician installed a transfer switch",
  },
  eiaOutages: {
    name: "EIA, Today in Energy: U.S. electricity customers averaged 11 hours of interruptions in 2024 (Dec 1 2025)",
    url: "https://www.eia.gov/todayinenergy/detail.php?id=66744",
    read: NOV24,
    what: "11 hours of interruptions per customer in 2024; major events nearly 9 hours; about 2 hours a year without major events",
  },

  // NEC (NFPA 70) and code commentary
  holtEcm: {
    name: "Mike Holt, NEC requirements for emergency and standby systems, EC&M (May 16 2025)",
    url: "https://www.ecmweb.com/national-electrical-code/code-basics/article/55285564/nec-requirements-for-emergency-and-standby-systems",
    read: NOV24,
    what: "NEC 702.5: transfer or interconnection equipment is required, listed, and installed to prevent inadvertent interconnection; sign at the power inlet",
  },
  nfpa2023Draft: {
    name: "NFPA 70 (2023 edition) Second Draft, Code-Making Panel 13 statements (PDF)",
    url: "https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2022_NEC_P13_SD_SRStatements.pdf",
    read: NOV24,
    what: "page 79, 702.4: with manual transfer the user may select the load; page 27, 445.11: the maker marks whether the generator neutral is bonded to its frame",
  },
  nfpa2026Draft: {
    name: "NFPA 70 (2026 edition) Second Draft, Code-Making Panel 13 statements (PDF)",
    url: "https://docinfofiles.nfpa.org/files/AboutTheCodes/70/70_A2025_NEC_P13_SD_SRStatements.pdf",
    read: NOV24,
    what: "page 99, 702.5: \"interconnection, interlocking device, or transfer equipment\" required",
  },
  holt2014: {
    name: "Mike Holt, 2014 NEC changes, Article 702 (PDF hosted by the Town of Springwater, NY)",
    url: "https://www.springwaterny.gov/_files/ugd/80e0ed_22b20211e77240af9bce524c19ae9668.pdf",
    read: NOV24,
    what: "pages 21-22: the power inlet warning sign names a bonded-neutral or floating-neutral source",
  },

  // Transfer equipment makers
  generacMts: {
    name: "Generac manual transfer switch owner's manual, models 6294/6408/6376 (PDF, archive.org copy)",
    url: "https://archive.org/download/manualsonline-id-db1825d6-e910-4dfd-9c12-37e0de2edd25/db1825d6-e910-4dfd-9c12-37e0de2edd25.pdf",
    read: NOV24,
    what: "page 1: professional electrician, UL 1008; Switched Neutral Kit needed for a bonded-neutral source with a GFCI 240 V outlet; page 2: L14-30 inlet",
  },
  generacGfci: {
    name: "Generac support, Why does the generator GFCI breaker trip when used with a transfer switch? (Jan 12 2024)",
    url: "https://support.generac.com/s/article/Why-Does-the-Generator-GFCI-Breaker-Trip-on-Some-Generators-When-Used-With-a-Transfer-Switch",
    read: NOV24,
    what: "a loop with the bonded neutral in the home's main panel induces a small current the GFCI detects",
  },
  generacBonded: {
    name: "Generac support, What does it mean for a generator to have a bonded or floating neutral? (Jun 18 2026)",
    url: "https://support.generac.com/s/article/What-does-it-mean-for-a-generator-to-have-a-bonded-or-floating-neutral",
    read: NOV24,
    what: "definitions of bonded and floating neutral",
  },
  relianceProTran: {
    name: "Reliance Controls, Pro/Tran 2 brochure (PDF, distributor copy)",
    url: "https://marselectric.com/assets/d6/4d/d64d492c-4afb-49bf-b017-8befefcb9a29/RELCONE00030_6_7.pdf",
    read: NOV24,
    what: "page 1: UL listed to standard 1008, suitable for use under NEC Article 702",
  },
  reliancePb30: {
    name: "Reliance Controls PB30 power inlet box instructions (PDF)",
    url: "https://images.thdstatic.com/catalog/pdfImages/16/162a24f0-52e8-447f-8c46-78ffadd143d4.pdf",
    read: NOV24,
    what: "pages 1-2: 30 A, 120/240 V, L14-30 connector; installation by a qualified electrician",
  },
  reliancePb50: {
    name: "Reliance Controls PB50 power inlet box instructions (PDF)",
    url: "https://cdn.shopify.com/s/files/1/1163/1976/files/PB50_Instructions.pdf",
    read: NOV24,
    what: "page 1: 50 A, 120/240 V; used to power a structure, it must be used with a transfer switch",
  },
  squareDListing: {
    name: "Schneider Electric (Square D) FAQ FA118962: are interlock kits UL listed? (Mar 1 2022)",
    url: "https://www.se.com/us/en/faqs/FA118962/",
    read: NOV24,
    what: "kits are tested and listed under the load center's UL 67 listing, not on their own",
  },
  squareDOtherBrand: {
    name: "Schneider Electric (Square D) FAQ FA125489: interlock kit in another brand's panel? (Jul 26 2022)",
    url: "https://www.se.com/us/en/faqs/FA125489",
    read: NOV24,
    what: "not recommended or tested in a competitor's panel, and would not be UL listed",
  },
  interlockKit: {
    name: "InterLock Kit K-5010 instructions (PDF)",
    url: "https://www.interlockkit.com/v/vspfiles/PDFs/InstrK5010.pdf",
    read: NOV24,
    what: "page 1: installed only by qualified electrical personnel; page 4: classified to UL 67 for installation and mechanical operation only",
  },

  // Anker
  ankerManual: {
    name: "Anker SOLIX F3800 Plus user manual A1790P, V2 May 2025 (PDF, retailer-hosted copy; no Anker-hosted copy found)",
    url: "https://www.santansolar.com/wp-content/uploads/A1790P_UG_EN_V2_20250512.pdf",
    read: NOV24,
    what: "PDF page 6: neutral and ground at the inlet box must be connected, LRA 80 A, soft starter; page 7: L14-30R to the inlet box or transfer switch, 6,000 W; pages 14-15: 3,840 Wh, outlet ratings, UPS 20 ms",
  },
  ankerTopQs: {
    name: "Anker SOLIX support, F3800 & F3800 Plus: your top questions answered",
    url: "https://support.ankersolix.com/s/article/F3800-F3800-Plus-Your-Top-Questions-Answered",
    read: NOV14,
    what: "Home Power Panel switches automatically: 25 A with one unit, 50 A with two; L14-30R only on the Plus",
  },
  ankerSameSwitch: {
    name: "Anker SOLIX support, Can I connect the F3800 to the same transfer switch or inlet box I used for my gas generator?",
    url: "https://support.ankersolix.com/s/article/Can-I-connect-Anker-SOLIX-F3800-to-the-same-transfer-switch-inlet-box-I-used-for-my-gas-generator-to-back-up-my-home",
    read: NOV14,
    what: "works with a home transfer switch or inlet box; neutral and ground warning",
  },
  ankerWeatherproof: {
    name: "Anker support, Is the transfer switch supplied by Anker weatherproof?",
    url: "https://service.anker.com/article-description/Is-the-transfer-switch-supplied-by-Anker-weatherproof-Will-Anker-SOLIX-F3800-be-compatible-with-my-home-s-transfer-switch",
    read: NOV24,
    what: "Anker's switch is for indoor use only; for 240 V use a NEMA 14-50 or L14-30 cable",
  },
  ankerMts50: {
    name: "Anker SOLIX 10-circuit manual transfer switch, 50 A (product page)",
    url: "https://www.ankersolix.com/products/home-backup-kit-for-f3800-10c",
    read: NOV24,
    what: "\"Not Suitable for Single F3800 Plus\"; Pro/Tran 2, UL 1008; (6) 15 A 1-pole, (1) 20 A 2-pole, (1) 30 A 2-pole",
  },
  ankerMts30: {
    name: "Anker SOLIX 10-circuit manual transfer switch, 30 A (product page)",
    url: "https://www.ankersolix.com/products/home-backup-kit-for-f3000-2",
    read: NOV24,
    what: "option \"For F3800 Plus & 2x F3000\"; 30 A cable; same Pro/Tran 2 switch",
  },
  ankerHpp: {
    name: "Anker SOLIX Smart Home Power Kit (Home Power Panel) product page",
    url: "https://www.ankersolix.com/products/smart-home-power-kit",
    read: NOV14,
    what: "works with the F3800 Plus; licensed electrician required; 100 A breaker sold separately; 120/240 V split-phase homes only",
  },
  forumF3800Unsafe: {
    name: "DIY Solar Forum, \"Possible unsafe operation of the Anker F3800 Plus\" (owner thread, Apr-Jul 2025)",
    url: "https://diysolarforum.com/threads/possible-unsafe-operation-of-the-anker-f3800-plus.103363/",
    read: NOV24,
    what: "owner reports Anker support first said the Plus is bonded, later that all units are floating by default",
  },
  forumF3800Bonding: {
    name: "DIY Solar Forum, \"Anker SOLIX F3800 & F3800P G-N bonding\" (owner thread, Apr 2025)",
    url: "https://diysolarforum.com/threads/anker-solix-f3800-f3800p-g-n-bonding.102529/",
    read: NOV24,
    what: "owner quotes Anker support: its switch is the floating type, and to leave the ground wire off a bonded Plus",
  },
  forumF3800Hpp: {
    name: "DIY Solar Forum, \"F3800 tripping Home Power Panel breaker\" (owner thread, Jun 2025)",
    url: "https://diysolarforum.com/threads/f3800-tripping-home-power-panel-breaker.105986/",
    read: NOV24,
    what: "two F3800s on a Home Power Panel; a breaker tripped while charging at about 2,800 W; no fix posted",
  },

  // Bluetti
  apexManual: {
    name: "BLUETTI Apex 300 user manual, US English (PDF)",
    url: "https://cdn.shopify.com/s/files/1/0550/5620/3836/files/Apex_300_User_Manual_US_EN.pdf",
    read: NOV24,
    what: "page 16: outlet limits, TT-30 16 A at 240 V; page 18: Power Lifting for resistive loads only; page 19: UPS 0 or 20 ms; page 22: up to 6 B300K, 19,353.6 Wh; page 26: 2,764.8 Wh, 14-50R 16 A at 240 V on battery, 50 A in bypass; page 28: motors may start at 2-4 times rated power, run-time formula",
  },
  apexManualV31: {
    name: "BLUETTI Apex 300 user manual V3.1, US English/French (PDF)",
    url: "https://s4.bluettipower.com/bluetti/purchasePageBiz/2025/12/Apex%20300%20User%20%20Manual%20US%20EN-FR-1764555919287-cde9.pdf",
    read: NOV24,
    what: "page 7: must be grounded when connected to the grid; page 27: same outlet table as V1.0; no statement on neutral bonding",
  },
  bluettiAt1: {
    name: "BLUETTI AT1 package product page",
    url: "https://www.bluettipower.com/products/at1-package-at1-parallel-connection-cable",
    read: NOV24,
    what: "automatic transfer panel; compatible with Apex 300 systems, up to three units via Hub A1",
  },
  bluettiKit: {
    name: "BLUETTI Apex 300 Home Integration Kit product page",
    url: "https://www.bluettipower.com/products/apex-300-home-integration-kit",
    read: NOV24,
    what: "\"Compatible Models: Apex300\"; Reliance subpanel with a 50 A SS2-50 inlet; NEMA 14-50 to SS2-50R cable",
  },
  bluettiBlog: {
    name: "BLUETTI, How to hook up a generator to the house (Bluetti Team, Oct 29 2026)",
    url: "https://www.bluettipower.com/blogs/articles/how-to-hook-up-a-generator-to-the-house-safely-and-efficiently",
    read: NOV24,
    what: "\"neutral bonding matters most\"; fixed household circuits need listed transfer equipment",
  },
  forumApexUps: {
    name: "DIY Solar Forum, \"Bluetti Apex 300: UPS behavior on TT-30 and 14-50 outputs?\" (owner thread, Apr 2026)",
    url: "https://diysolarforum.com/threads/bluetti-apex-300-ups-behavior-on-tt-30-and-14-50-outputs.123358/",
    read: NOV24,
    what: "owner on a Reliance 6-circuit switch measured no more than 16 A on either leg in 240 V mode",
  },
  forumApexLaunch: {
    name: "DIY Solar Forum, \"Bluetti Apex 300 launched today\" (Jul 2025)",
    url: "https://diysolarforum.com/threads/bluetti-apex-300-launched-today%E2%80%A6-anyone-have-thoughts.105206/",
    read: NOV24,
    what: "member: the inverter path is only 16 A per phase",
  },

  // Well pump
  franklinAim: {
    name: "Franklin Electric, AIM Manual: 60 Hz Submersible Systems, 2026 edition (PDF, copy hosted by Nebraska DWEE)",
    url: "https://dwee.nebraska.gov/sites/default/files/water/2026_60Hz_AIM_Manual_Submersible_Systems.pdf",
    read: NOV24,
    what: "printed page 6: transfer switches must be used; 65% voltage at start; printed page 7: generator minimum rating table; printed pages 39-41: 4-inch single-phase motor table (amps, watts, locked rotor amps)",
  },
  softStartTips: {
    name: "SoftStartUSA, Well pump generator capabilities tech tips (PDF, Oct 9 2025)",
    url: "https://cdn.shopify.com/s/files/1/0401/7084/8411/files/SoftStart_Well_Pump_generator_capabilities_100825.pdf",
    read: NOV24,
    what: "page 1: works with 115 V and 230 V single-phase submersibles 0.5-3.5 HP, cuts inrush only; page 3: inrush 5-7 times running amps, cut by 40%",
  },
  microAir: {
    name: "Micro-Air knowledge base, Using EasyStart in applications other than air conditioning",
    url: "https://www.micro-air.com/kb-easystart/articles_installation/easystart_Using_EasyStart_in_Applications_Other_Than_Air_Conditioning.htm",
    read: NOV24,
    what: "fully contained submersible pumps cannot be adapted; some with a capacitor above ground can",
  },
  forumDeltaProWell: {
    name: "DIY Solar Forum, \"Delta Pro won't run my well pump\" (owner thread, Aug 2023)",
    url: "https://diysolarforum.com/threads/delta-pro-wont-run-my-well-pump.67662/",
    read: NOV24,
    what: "a 110 V, 1/2 HP pump shut the Delta Pro off at start-up; no confirmed fix",
  },
  forumDeltaPro240: {
    name: "DIY Solar Forum, \"Running 240 volt well pump with Delta Pro's???\" (owner thread, 2022)",
    url: "https://diysolarforum.com/threads/running-240-volt-well-pump-with-delta-pros.36669/",
    read: NOV24,
    what: "a member measured start at 4 times running amps; another ran a well on two Delta Pros at 240 V",
  },
  wsc: {
    name: "Water Systems Council, HELP for Well Owners (PDF, Apr 2025)",
    url: "https://www.watersystemscouncil.org/wp-content/uploads/2025/04/HELP-for-Well-Owners.pdf",
    read: NOV24,
    what: "page 1: a generator keeps the well pump working in an outage; page 4: consider a hand pump",
  },
  privateWell: {
    name: "PrivateWellClass, What do I do if there is a power outage and my well won't work? (Mar 19 2026)",
    url: "https://intercom.help/privatewellclassorg/en/articles/9047456-what-do-i-do-if-there-is-a-power-outage-and-my-well-won-t-work",
    read: NOV24,
    what: "with a pressure tank, you can use the water in it",
  },
  epaWater: {
    name: "EPA WaterSense, How we use water (updated Aug 4 2026)",
    url: "https://www.epa.gov/watersense/how-we-use-water",
    read: NOV24,
    what: "the average American family uses more than 300 gallons of water a day at home",
  },

  // Fridge and freezer
  cdcFood: {
    name: "CDC, Keep food safe after a disaster or emergency",
    url: "https://www.cdc.gov/food-safety/foods/keep-food-safe-after-emergency.html",
    read: NOV24,
    what: "fridge 4 hours without power; full freezer 48 hours, half-full 24; fridge at 40°F or below, freezer at 0°F or below; appliance thermometers",
  },
  eiaRecs53b: {
    name: "EIA, Residential Energy Consumption Survey 2020, table CE5.3b (PDF)",
    url: "https://www.eia.gov/consumption/residential/data/2020/c&e/pdf/ce5.3b.pdf",
    read: NOV24,
    what: "page 1, per household using it: most-used refrigerator 2.11 million Btu, second refrigerator 1.69, separate freezer 1.94 (about 618, 495 and 569 kWh a year at 3,412 Btu per kWh)",
  },
  frigidaire: {
    name: "Frigidaire refrigerator-freezer use and care manual A30598301 (PDF, Mar 2026)",
    url: "https://frigidaire.bynder.com/m/3f3882d7cc4f392f/original/A30598301en-US-March-2026-pdf.pdf",
    read: NOV24,
    what: "page 4: dedicated 115 V, 15 A outlet; page 5: insufficient power can damage the compressor; no portable power supplies at the rear; page 16: variable-speed compressor runs nearly all the time",
  },
  geOutage: {
    name: "GE Appliances, Power outage tips",
    url: "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17509",
    read: NOV24,
    what: "the sudden start when power returns will not harm the refrigerator; keep the freezer door closed",
  },
  whirlpoolOutage: {
    name: "Whirlpool product help, What to do during a power outage",
    url: "https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Cleaning_and_Care/What_to_Do_During_a_Power_Outage",
    read: NOV24,
    what: "out 24 hours or less: keep the door closed",
  },
  eweb: {
    name: "Eugene Water & Electric Board, Generator sizing considerations (PDF)",
    url: "https://www.eweb.org/documents/emergency-preparedness/generator-sizing-considerations.pdf",
    read: NOV24,
    what: "refrigerator/freezer 700 running watts plus 2,200 additional starting watts; water well pump 1/3 HP 1,000 plus 2,000",
  },
  forumFridgeClamp: {
    name: "DIY Solar Forum, \"Measuring surge watts: what did I do wrong?\" (owner thread, Sep 2021)",
    url: "https://diysolarforum.com/threads/measuring-surge-watts-what-did-i-do-wrong.27905/",
    read: NOV24,
    what: "owner's clamp meter on inrush mode: 20.92 A × 120 V = 2,510 W at start; 79.2 W running",
  },
  forumFridgeKillAWatt: {
    name: "DIY Solar Forum, \"Inverter with best surge capability for fridge startup\" (owner thread, Sep 2020)",
    url: "https://diysolarforum.com/threads/inverter-with-best-surge-capability-for-fridge-startup-consumption.12316/",
    read: NOV24,
    what: "owner's plug-in meter: start about 1,000-1,100 W, running rarely above 80-100 W; replies note plug-in meters can miss inrush and defrost heaters draw more",
  },
} satisfies Record<string, CheckedSource>;

export type SourceKey = keyof typeof SRC;
export const sources = (...keys: SourceKey[]): CheckedSource[] => keys.map((k) => SRC[k]);
