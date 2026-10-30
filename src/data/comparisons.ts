/**
 * Head-to-head comparison pages (/compare/<slug>). Only products in
 * src/data/products.ts may appear, and every claim in `verdict` and `points`
 * must follow from the specs shown on the page.
 *
 * Pairs were chosen from Google autocomplete suggestions for "<brand/model> vs"
 * (checked 2026-10-15), i.e. comparisons people actually type.
 */

export interface Comparison {
  slug: string;
  /** Page title (also the H1). */
  title: string;
  description: string;
  /** Product id pairs [a, b]. Brand-vs-brand pages compare several size classes. */
  pairs: [string, string][];
  /** Labels for each pair's size class on brand pages, e.g. "About 1 kWh". */
  pairLabels?: string[];
  intro: string;
  /** The short answer, shown first. */
  verdict: string;
  /** "Choose A if ..." / "Choose B if ..." */
  chooseA: string;
  chooseB: string;
  /** A sister comparison to link from the short answer, e.g. the third brand people weigh up. */
  see?: { slug: string; label: string };
  updated: string;
}

const U = "2026-10-15";

export const COMPARISONS: Comparison[] = [
  {
    slug: "ecoflow-delta-3-plus-vs-anker-solix-c1000-gen-2",
    title: "EcoFlow DELTA 3 Plus vs Anker SOLIX C1000 Gen 2",
    description: "Two 1 kWh LFP power stations compared: output, solar input, expansion, warranty and current price.",
    pairs: [["ecoflow-delta-3-plus", "anker-solix-c1000-gen-2"]],
    intro:
      "The two best-known 1 kWh power stations of 2026. Both hold about 1 kWh, recharge from the wall in under an hour by their makers' figures, and switch over fast enough to run as a UPS. The differences are expansion, solar input and price.",
    verdict:
      "The Anker C1000 Gen 2 is cheaper ($499.99 vs $719 when we checked, both sale prices) and has more continuous output (2,000 W vs 1,800 W). The EcoFlow DELTA 3 Plus can grow: it takes EcoFlow extra batteries up to 5 kWh, accepts 1,000 W of solar against Anker's 600 W, and EcoFlow states a 5-year warranty and LFP chemistry, which Anker's US page does not state for the Gen 2.",
    chooseA: "Choose the EcoFlow DELTA 3 Plus if you might add batteries later, plan to charge mostly from solar, or want the stated 5-year warranty.",
    chooseB: "Choose the Anker SOLIX C1000 Gen 2 if you want the lowest price for 1 kWh, slightly more output, and won't need to expand.",
    updated: "2026-10-26",
  },
  {
    slug: "jackery-vs-ecoflow",
    title: "Jackery vs EcoFlow: Which Power Station Brand Is Better?",
    description: "Jackery and EcoFlow compared size for size: 1 kWh, 2 kWh and home-backup models, from both makers' US specs and prices.",
    pairs: [
      ["jackery-explorer-1000-v2", "ecoflow-delta-3"],
      ["jackery-explorer-2000-v2", "ecoflow-delta-3-max"],
      ["jackery-explorer-5000-plus", "ecoflow-delta-pro-3"],
    ],
    pairLabels: ["About 1 kWh", "About 2 kWh", "Home backup"],
    intro:
      "Jackery and EcoFlow are the two most-searched power station brands. Both now use LFP batteries across these models and both offer 5-year warranties on them. We matched each brand's models by size.",
    verdict:
      "At 1 kWh Jackery is cheaper (the Explorer 1000 v2 was $559 vs $629 for the DELTA 3); at 2 kWh EcoFlow is (the DELTA 3 Max was $899 vs $999 for the Explorer 2000 v2). At both sizes EcoFlow gives more output and solar input, and the DELTA 3 can take extra batteries. At home-backup size the Jackery Explorer 5000 Plus has more capacity and power (5 kWh, 7,200 W) than the DELTA Pro 3 (4 kWh, 4,000 W) for $700 more. One caution: Jackery rates its cycles to 70% remaining capacity and EcoFlow to 80%, so equal cycle counts favor EcoFlow.",
    chooseA: "Choose Jackery for the cheaper 1 kWh unit, lighter weight at each size, or the biggest single home-backup unit of the pair.",
    chooseB: "Choose EcoFlow for higher output and solar input at each size, expandable mid-size models and faster UPS switchover (10 ms vs Jackery's 20 ms).",
    updated: U,
  },
  {
    slug: "anker-solix-vs-ecoflow",
    title: "EcoFlow vs Anker SOLIX (2026): Power Stations Compared Size for Size",
    description: "EcoFlow or Anker SOLIX? Matched at 1 kWh, 2 kWh and home-backup sizes: capacity, output, solar input, expansion and price from both makers' US sites, plus a link to how Bluetti compares.",
    pairs: [
      ["anker-solix-c1000-gen-2", "ecoflow-delta-3"],
      ["anker-solix-c2000-gen-2", "ecoflow-delta-3-max"],
      ["anker-solix-f3800-plus", "ecoflow-delta-pro-3"],
    ],
    pairLabels: ["About 1 kWh", "About 2 kWh", "Home backup"],
    intro:
      "Anker's SOLIX line and EcoFlow's DELTA line compete model for model. We matched them by capacity and compared the makers' own US figures.",
    verdict:
      "It splits by size. At 1 kWh the Anker C1000 Gen 2 is cheaper ($499.99 vs $629) and has more output (2,000 W vs 1,800 W), but only the EcoFlow DELTA 3 can expand. At 2 kWh the two were priced about the same when we checked ($899 for the EcoFlow DELTA 3 Max vs $899.99 for the Anker C2000 Gen 2) with similar output, but the Anker C2000 Gen 2 accepts an expansion battery. For home backup the Anker F3800 Plus has more output (6,000 W vs 4,000 W), more solar input and far more expansion (26.9 kWh vs 12.3 kWh) at a lower price, though the EcoFlow DELTA Pro 3 holds a bit more (4.1 vs 3.84 kWh).",
    chooseA: "Choose Anker SOLIX for the cheapest 1 kWh unit here, an expandable 2 kWh unit at about the same price as the EcoFlow, or the most powerful home-backup unit (F3800 Plus).",
    chooseB: "Choose EcoFlow for a 1 kWh unit you can expand later, and stated LFP chemistry and warranty across the range.",
    see: { slug: "ecoflow-vs-bluetti", label: "Weighing up Bluetti too? See EcoFlow vs Bluetti" },
    updated: "2026-10-26",
  },
  {
    slug: "ecoflow-vs-bluetti",
    title: "EcoFlow vs Bluetti (2026): Prices and Specs Compared Size for Size",
    description: "EcoFlow or Bluetti? Matched at 1 kWh, 2 kWh and home-backup sizes with price per kWh, output, cycle ratings and expansion from both makers' US sites, plus a link to how Anker SOLIX compares.",
    pairs: [
      ["ecoflow-delta-3-plus", "bluetti-elite-100-v2"],
      ["ecoflow-delta-3-max", "bluetti-elite-200-v2"],
      ["ecoflow-delta-pro-3", "bluetti-apex-300"],
    ],
    pairLabels: ["About 1 kWh", "About 2 kWh", "Home backup"],
    intro:
      "Bluetti undercuts EcoFlow on price at most sizes and quotes higher cycle ratings; EcoFlow had better stock and more complete published specs when we checked.",
    verdict:
      "Bluetti is cheaper per kWh: the Elite 100 V2 was $489 for 1 kWh and the Elite 200 V2 $899 for 2.07 kWh, with 6,000-cycle ratings on the larger models. Both Elite V2 units were back in stock on Bluetti's US site on Oct 19 2026, but neither expands. For home backup the Bluetti Apex 300 ($1,599 for 2.76 kWh, 3,840 W, 120/240 V) costs far less than the EcoFlow DELTA Pro 3 ($2,799 for 4.1 kWh, 4,000 W) and expands further per unit.",
    chooseA: "Choose EcoFlow if you want a 1 kWh unit that expands later, or a warranty stated on every model (Bluetti's US page did not state one for the Apex 300).",
    chooseB: "Choose Bluetti for the lowest price per kWh and the highest cycle ratings, especially the Apex 300 for home backup.",
    see: { slug: "anker-solix-vs-ecoflow", label: "Weighing up Anker SOLIX too? See EcoFlow vs Anker SOLIX" },
    updated: "2026-10-26",
  },
  {
    slug: "bluetti-ac180-vs-jackery-explorer-1000-v2",
    title: "Bluetti AC180 vs Jackery Explorer 1000 v2",
    description: "Two popular 1 kWh LFP power stations compared on capacity, output, outlets, solar input, weight and price.",
    pairs: [["bluetti-ac180", "jackery-explorer-1000-v2"]],
    intro:
      "Both are long-time best sellers around 1 kWh with LFP batteries and 5-year warranties. The AC180 has a little more capacity and output; the Jackery is lighter.",
    verdict:
      "The Bluetti AC180 offers more for less on paper: 1,152 Wh and 1,800 W for $499, against 1,070 Wh and 1,500 W for $559, plus 500 W of solar input to Jackery's 400 W. The Jackery Explorer 1000 v2 is 11.5 lb lighter (23.8 vs 35.3 lb). Both were in stock on their makers' US sites on Oct 19 2026.",
    chooseA: "Choose the Bluetti AC180 for more capacity, output and solar input per dollar.",
    chooseB: "Choose the Jackery Explorer 1000 v2 if weight matters (camping, carrying).",
    updated: "2026-10-19",
  },
  {
    slug: "ecoflow-delta-3-max-vs-jackery-explorer-2000-v2",
    title: "EcoFlow DELTA 3 Max vs Jackery Explorer 2000 v2",
    description: "Two 2 kWh LFP power stations compared: output, surge, solar input, weight, cycles and price.",
    pairs: [["ecoflow-delta-3-max", "jackery-explorer-2000-v2"]],
    intro:
      "The 2 kWh class is the sweet spot for keeping a fridge, lights and internet going through an overnight outage. These two are the most compared.",
    verdict:
      "The EcoFlow DELTA 3 Max was both cheaper ($899 vs $999) and stronger (2,400 W vs 2,200 W continuous, 500 W vs 400 W solar input, 10 ms vs 20 ms switchover). The Jackery is lighter (39.5 vs 44.8 lb) and publishes a 4,000-cycle rating (to 70%); EcoFlow gives no cycle count for this model, only a 10-year life claim. Jackery says the 2000 v2 is not expandable; EcoFlow does not say whether the DELTA 3 Max is.",
    chooseA: "Choose the EcoFlow DELTA 3 Max for more power and solar input at a lower price.",
    chooseB: "Choose the Jackery Explorer 2000 v2 if you want the lighter unit with a published cycle rating.",
    updated: U,
  },
  {
    slug: "ecoflow-delta-pro-3-vs-anker-solix-f3800-plus",
    title: "EcoFlow DELTA Pro 3 vs Anker SOLIX F3800 Plus",
    description: "The two leading 120/240 V home-backup power stations compared: capacity, output, solar, expansion and price.",
    pairs: [["ecoflow-delta-pro-3", "anker-solix-f3800-plus"]],
    intro:
      "Both are wheeled, 120/240-volt power stations meant to back up home circuits through a transfer switch or smart panel, run well pumps, and charge from large solar arrays.",
    verdict:
      "The Anker SOLIX F3800 Plus gives more of almost everything for $399 less: 3.84 kWh vs 4.1 kWh is the only spec where EcoFlow leads, while Anker has 6,000 W vs 4,000 W output, 3,200 W vs 2,600 W solar input, and expands to 26.9 kWh per unit vs 12.3 kWh. The EcoFlow is lighter (113.5 vs 136.7 lb), switches over faster (10 vs 20 ms), and quotes 4,000 cycles to 80% against Anker's 3,000+.",
    chooseA: "Choose the EcoFlow DELTA Pro 3 for slightly more base capacity, a higher cycle rating, lower weight and faster UPS switchover.",
    chooseB: "Choose the Anker SOLIX F3800 Plus for more power, more solar input and far more room to expand.",
    updated: "2026-10-26",
  },
  {
    slug: "anker-solix-f3800-plus-vs-jackery-explorer-5000-plus",
    title: "Anker SOLIX F3800 Plus vs Jackery Explorer 5000 Plus",
    description: "Two big 120/240 V home-backup power stations compared on capacity, output, expansion, weight and price.",
    pairs: [["anker-solix-f3800-plus", "jackery-explorer-5000-plus"]],
    intro: "The largest single power stations from Anker and Jackery, both built to run home circuits at 120/240 V.",
    verdict:
      "The Jackery Explorer 5000 Plus is the bigger machine: 5.04 kWh and 7,200 W continuous vs 3.84 kWh and 6,000 W, for $3,499 against $2,399.99. Per kWh the Anker is cheaper ($625 vs $694). Anker publishes a 3,200 W solar input figure and a clear expansion path (six BP3800 batteries per unit); Jackery lists its solar ports by voltage rather than one wattage and quotes up to 60 kWh as a system. The Jackery is 2 lb lighter despite more capacity.",
    chooseA: "Choose the Anker SOLIX F3800 Plus for the lower price and a clearly specified expansion path with lots of solar input.",
    chooseB: "Choose the Jackery Explorer 5000 Plus for the most capacity and power in one unit.",
    updated: "2026-10-26",
  },
  {
    slug: "tesla-powerwall-3-vs-enphase-iq-battery-5p",
    title: "Tesla Powerwall 3 vs Enphase IQ Battery 5P",
    description: "The two most-installed home batteries compared: capacity, power, warranty, expansion and typical installed cost in 2026.",
    pairs: [["tesla-powerwall-3", "enphase-iq-battery-5p"]],
    intro:
      "Both are sold through installers, so neither maker publishes a price. We compare their datasheets and EnergySage's average installed cost per kWh for each brand in the first half of 2026.",
    verdict:
      "Powerwall 3 is one big 13.5 kWh, 11.5 kW battery with a built-in solar inverter, and it was the cheaper brand per installed kWh on EnergySage ($967 vs $1,429). Enphase's IQ Battery 5P comes in 5 kWh blocks with a 15-year warranty (vs 10) and stated LFP chemistry, which suits a smaller start or an existing Enphase solar system. Three 5Ps (15 kWh, 11.5 kW together) roughly match one Powerwall 3's capacity and power, at Enphase's higher average cost per kWh.",
    chooseA: "Choose Tesla Powerwall 3 for the lowest installed cost per kWh and high power in a single box, especially with new solar.",
    chooseB: "Choose Enphase IQ Battery 5P for the longer warranty, a smaller starting size, or if you already have Enphase microinverters.",
    updated: U,
  },
  {
    slug: "bluetti-ac180-vs-elite-100-v2",
    title: "Bluetti AC180 vs Elite 100 V2: $499 vs $489, Which to Buy",
    description: "Bluetti's two 1 kWh power stations ($499 and $489) compared: how long each runs a fridge or CPAP, weight, solar charging, surge and switchover, from Bluetti's US specs.",
    pairs: [["bluetti-ac180", "bluetti-elite-100-v2"]],
    intro:
      "The most-searched Bluetti matchup. Both cost about $500 on Bluetti's US site ($499 and $489), both hold about 1 kWh of long-life LFP battery and both put out 1,800 W. The newer Elite 100 V2 trades a little capacity for less weight and much faster solar charging.",
    verdict:
      "For most people, the Elite 100 V2. For $10 less ($489) it is 10.3 lb lighter (25 vs 35.3 lb), takes twice the solar (1,000 W vs 500 W), states a 3,600 W surge for motor starts (the AC180's 2,700 W is for heating-type loads only), switches over in 10 ms, and is rated for more cycles (4,000 vs 3,500, both to 80%). The AC180 holds 12% more (1,152 vs 1,024 Wh), about one more hour of running a typical fridge.",
    chooseA: "Choose the Bluetti AC180 if you want the most stored energy for $499 and weight doesn't matter.",
    chooseB: "Choose the Bluetti Elite 100 V2 for camping, solar charging, CPAP or UPS use: lighter, faster to refill, quicker switchover.",
    updated: "2026-10-26",
  },
  {
    slug: "bluetti-elite-200-v2-vs-elite-300",
    title: "Bluetti Elite 200 V2 vs Elite 300: Is the Bigger One Worth $800 More?",
    description: "Bluetti's 2 kWh and 3 kWh power stations compared: how long each keeps a fridge cold in an outage, output, solar, RV outlet, weight and price per kWh.",
    pairs: [["bluetti-elite-200-v2", "bluetti-elite-300"]],
    intro:
      "Two Bluetti boxes for outage and RV use. The Elite 300 costs $800 more and holds about 45% more energy, so the question is whether you need the extra night and the RV outlet.",
    verdict:
      "The Elite 200 V2 is now the better buy per kWh: 2.07 kWh for $899 (about $434 per kWh) against 3.01 kWh for $1,699 (about $564) for the Elite 300, whose earlier $1,199 advance-order price has ended. The Elite 300 still brings more solar input (1,200 W vs 1,000 W), a stated 4,800 W surge, a 10 ms switchover and an RV (TT-30) outlet, for under 5 lb more weight. The Elite 200 V2 has more continuous output (2,600 W vs 2,400 W). Both were in stock on Bluetti's US site on Oct 26 2026, and both are rated 6,000 cycles to 80% with a 5-year warranty.",
    chooseA: "Choose the Elite 200 V2 for the most energy per dollar: a fridge and essentials through one night, or a single big appliance near 2,600 W.",
    chooseB: "Choose the Elite 300 for two-day outages, RV hookups or lots of solar, if the extra night and the TT-30 outlet are worth $800 to you.",
    updated: "2026-10-26",
  },
  {
    slug: "bluetti-elite-200-v2-vs-ac200l",
    title: "Bluetti Elite 200 V2 vs AC200L",
    description: "Two $899 Bluetti 2 kWh power stations compared: output, cycle life, weight, expansion and stock, from Bluetti's US product pages.",
    pairs: [["bluetti-elite-200-v2", "bluetti-ac200l"]],
    intro:
      "Same price, about the same capacity. The AC200L is the older design that takes extra batteries; the Elite 200 V2 is newer, lighter and rated for twice the cycles.",
    verdict:
      "The Elite 200 V2 wins for most buyers: 2,600 W vs 2,400 W output, 6,000 vs 3,000 rated cycles (both to 80%), 9 lb lighter (53.4 vs 62.4 lb), and it was in stock while the AC200L was sold out. The AC200L's advantages are expansion (up to two B300K or B300 batteries, to about 8 kWh), 1,200 W vs 1,000 W of solar input and an RV (TT-30) outlet.",
    chooseA: "Choose the Elite 200 V2 for longer life, more output and lighter weight in a box you won't expand.",
    chooseB: "Choose the AC200L if you want to add batteries later for multi-day backup, once it is back in stock.",
    updated: "2026-10-19",
  },
];

export const comparisonBySlug = (slug: string) => COMPARISONS.find((c) => c.slug === slug);
