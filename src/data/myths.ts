/**
 * Myths people believe about going electric, each answered in plain English
 * with a dollar or everyday framing and at least one source. Used on /myths
 * (with FAQPage structured data) and quoted, one or two at a time, on the hub
 * pages and in the Go Electric planner right where the doubt comes up.
 *
 * Rules: every figure needs a source in `sources`; say "partly true" when it
 * is; bump MYTHS_REVIEWED whenever the figures are re-checked.
 */

import { NATIONAL, STATES, evCostPer100, gasCostPer100, nationalRateUsd, referenceEv } from "@/lib/energy";

export const MYTHS_REVIEWED = "2026-10-15";

export type MythTopic = "ev" | "solar" | "battery" | "home" | "money";

export interface Myth {
  id: string;
  topic: MythTopic;
  /** The doubt, in the words people use. */
  myth: string;
  verdict: "Myth" | "Mostly myth" | "Partly true";
  /** One-line answer that leads with money or real life. */
  short: string;
  /** The full answer: plain text (also published as FAQ structured data). */
  answer: string;
  sources: { label: string; url: string }[];
}

/** The slice the planner and hub pages need. */
export type MythLite = Pick<Myth, "id" | "myth" | "short">;

export const TOPIC_LABEL: Record<MythTopic, string> = {
  ev: "Electric cars",
  solar: "Solar",
  battery: "Batteries and backup",
  home: "Heating and cooking",
  money: "Cost",
};

const ports = STATES.reduce((n, s) => n + s.charging.ports, 0);
const dcFast = STATES.reduce((n, s) => n + s.charging.dcFast, 0);
const typical = referenceEv("typical");
const usEvYear = (evCostPer100(nationalRateUsd(), typical.kwhPer100mi) * 12000) / 100;
const usGasYear = (gasCostPer100(NATIONAL.gasolineUsdPerGallon) * 12000) / 100;
const fuelSaving = Math.round((usGasYear - usEvYear) / 10) * 10;
const maintSaving = Math.round((12000 * (10.1 - 6.1)) / 100 / 10) * 10;
const $ = (n: number) => `$${n.toLocaleString("en-US")}`;

const S = {
  cox: { label: "Cox Automotive / Kelley Blue Book, September 2026 average transaction prices (Oct 13, 2026)", url: "https://www.coxautoinc.com/insights/sept-2026-atp-report/" },
  recurrentUsed: { label: "Recurrent, Used EV market price update (Sept 30, 2026)", url: "https://www.recurrentauto.com/research/used-electric-vehicle-buying-report" },
  argonne: { label: "US DOE Fact of the Week #1190, citing Argonne National Laboratory (2021)", url: "https://www.energy.gov/cmei/vehicles/articles/fotw-1190-june-14-2021-battery-electric-vehicles-have-lower-scheduled" },
  eia: { label: "EIA Electric Power Monthly and weekly gasoline prices", url: "https://www.eia.gov/electricity/monthly/" },
  geotab: { label: "Geotab, real-world EV battery health (updated Apr 28, 2026)", url: "https://www.geotab.com/blog/ev-battery-health/" },
  recurrentLife: { label: "Recurrent, How long do EV batteries last? (Nov 11, 2025)", url: "https://www.recurrentauto.com/research/how-long-do-ev-batteries-last" },
  recurrentCost: { label: "Recurrent, EV battery replacement costs (Dec 3, 2024)", url: "https://www.recurrentauto.com/research/costs-ev-battery-replacement" },
  doeReplace: { label: "US DOE Fact of the Week #1339: battery replacements due to failure (Apr 22, 2024)", url: "https://www.energy.gov/cmei/vehicles/articles/fotw-1339-april-22-2024-plug-electric-vehicle-battery-replacements-due" },
  swinburne: { label: "Swinburne University (Prof. Hussein Dia), citing Sweden's MSB and EV FireSafe (Sept 15, 2023)", url: "https://www.swinburne.edu.au/news/2023/09/electric-vehicle-fires-are-very-rare-the-risk-for-petrol-and-diesel-vehicles-is-at-least-20-times-higher" },
  vibilagare: { label: "Vi Bilägare, Swedish MSB vehicle fire figures for 2024 (May 19, 2025)", url: "https://www.vibilagare.se/nyheter/nya-siffror-farre-brander-trots-fler-elbilar-pa-vagarna" },
  afdc: { label: "US DOE Alternative Fuels Data Center, station counts by state", url: "https://afdc.energy.gov/stations/states" },
  doeHome: { label: "US DOE, National EV Charging Network: about 80% of charging happens at home", url: "https://www.energy.gov/topics/national-ev-charging-network" },
  nhts: { label: "US DOE Fact of the Week #1337: 14,200 miles a year per household vehicle (2022 NHTS)", url: "https://www.energy.gov/eere/vehicles/articles/fotw-1337-april-8-2024-diesel-vehicles-traveled-more-miles-other-household" },
  icct: { label: "ICCT, Life-cycle greenhouse gas emissions of US sedans and SUVs (July 2024)", url: "https://theicct.org/wp-content/uploads/2024/07/ID-180-–-US-GHGs_brief_final.pdf" },
  ucs: { label: "Union of Concerned Scientists: EVs beat gasoline cars on emissions in every US grid region (Aug 3, 2026)", url: "https://blog.ucs.org/dave-reichmuth/epa-stopped-updating-the-data-behind-electric-vehicle-emissions-the-numbers-still-show-evs-are-winners/" },
  eiaEv: { label: "EIA Today in Energy: electricity used by light-duty EVs, first half of 2026 (Sept 30, 2026)", url: "https://www.eia.gov/todayinenergy/detail.php?id=68224" },
  iea: { label: "IEA Global EV Outlook 2025: outlook for energy demand", url: "https://www.iea.org/reports/global-ev-outlook-2025/outlook-for-energy-demand" },
  recurrentCold: { label: "Recurrent, winter EV range study of 30,000+ cars (Nov 19, 2025)", url: "https://www.recurrentauto.com/research/winter-ev-range-loss" },
  aaa: { label: "AAA, Temperature effects on electric and hybrid vehicle efficiency (April 2026)", url: "https://newsroom.aaa.com/wp-content/uploads/2026/04/Research-Report_EV-vs-Hybrid-Efficiency_17-Apr-26_FINAL_HQ-2-1.pdf" },
  ofv: { label: "OFV (Norwegian Road Federation), 2025 registrations: 95.9% fully electric", url: "https://ofv.no/" },
  fraunhofer: { label: "Fraunhofer ISE, Recent facts about photovoltaics in Germany (Aug 2026)", url: "https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/recent-facts-about-photovoltaics-in-germany.pdf" },
  esPayback: { label: "EnergySage, solar payback period (updated Sept 3, 2026)", url: "https://www.energysage.com/solar/understanding-your-solar-panel-payback-period/" },
  pvwatts: { label: "PVWatts v8 (National Laboratory of the Rockies) on NASA POWER weather, our state model", url: "https://pvwatts.nlr.gov/" },
  doeRoofGuide: { label: "US DOE Better Buildings, rooftop solar FAQ (July 2015)", url: "https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/BBA_Commercial_PV_Roofing_Guide_071715_508.pdf" },
  doeRoof: { label: "US DOE, Replacing your roof? It's a great time to add solar", url: "https://www.energy.gov/eere/solar/articles/replacing-your-roof-its-great-time-add-solar" },
  degradation: { label: "Jordan & Kurtz, Photovoltaic degradation rates: an analytical review (NREL, 2013)", url: "https://www.osti.gov/biblio/1045052" },
  pnnl: { label: "PNNL for US DOE, Cold Climate Heat Pump Challenge field results (Jan 2025)", url: "https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-37127.pdf" },
  nrcan: { label: "Natural Resources Canada, cold-climate mini-split heat pump test (2014)", url: "https://natural-resources.canada.ca/maps-tools-publications/publications/cooling-heating-season-performance-assessment-mini-split-cold-climate-air-source-heat-pump-canadian-centre-housing-technology" },
  norway: { label: "Norwegian Heat Pump Association, market report (2025)", url: "https://heatpumpingtechnologies.org/articles/heat-pumping-technologies-magazine-vol-43-no-2-2025/norway-heat-pump-market-report/" },
  crPans: { label: "Consumer Reports, how to tell if a pan is induction compatible (Oct 6, 2022)", url: "https://www.consumerreports.org/home-garden/cookware/how-to-tell-if-a-pot-or-pan-is-induction-compatible-a3637108643/" },
  esInduction: { label: "ENERGY STAR, 2021 Emerging Technology Award: induction cooking tops", url: "https://www.energystar.gov/about/2021_residential_induction_cooking_tops" },
  irs: { label: "IRS fact sheet FS-2025-05: credit end dates", url: "https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-act-obbb" },
  doeRebates: { label: "US DOE, Home Energy Rebates program", url: "https://www.energy.gov/cmei/scep/home-energy-rebates-program" },
  gmBolt: { label: "GM: 2027 Chevrolet Bolt (Oct 9, 2025)", url: "https://news.gm.com/home.detail.html/Pages/news/us/en/2025/oct/1009-2027-Chevrolet-Bolt.html" },
  brightSaver: { label: "Bright Saver, balcony solar kits (member prices, checked Oct 15, 2026)", url: "https://www.brightsaver.org/balcony-solar-kits" },
  river: { label: "EcoFlow RIVER 3 Plus product page (checked Oct 15, 2026)", url: "https://us.ecoflow.com/products/ecoflow-river-3-plus-portable-power-station-flash-sale" },
  massSave: { label: "Mass Save, ConnectedSolutions for batteries", url: "https://masssave.com/saving/residential-rebates/connectedsolutions-batteries" },
  crReliability: { label: "Consumer Reports: EVs are less reliable than conventional cars (updated Dec 4, 2025)", url: "https://www.consumerreports.org/cars/car-reliability-owner-satisfaction/electric-vehicles-are-less-reliable-than-conventional-cars-a1047214174/" },
  communitySolar: { label: "National Laboratory of the Rockies: community solar (data as of Feb 2025)", url: "https://www.nlr.gov/state-local-tribal/community-solar" },
};

export const MYTHS: Myth[] = [
  {
    id: "ev-cost",
    topic: "money",
    myth: "EVs are more expensive.",
    verdict: "Partly true",
    short: `New EVs still cost more up front, but charging at home and lighter maintenance save the average driver about ${$(fuelSaving + maintSaving)} a year.`,
    answer: `The sticker price is real: the average new EV sold for $55,879 in September 2026, against $50,562 for the average new vehicle (Kelley Blue Book). The running costs swing it back. At US average prices, charging a compact electric SUV at home for 12,000 miles costs about ${$(Math.round(usEvYear / 10) * 10)} a year, against about ${$(Math.round(usGasYear / 10) * 10)} of gasoline in a 25.5 mpg car, and Argonne National Laboratory puts maintenance at 6.1 cents a mile for an EV versus 10.1 for gas, about ${$(maintSaving)} a year more saved. Used EVs are the bargain: more than half listed in September 2026 were under $30,000 (Recurrent).`,
    sources: [S.cox, S.recurrentUsed, S.argonne, S.eia],
  },
  {
    id: "ev-battery-life",
    topic: "ev",
    myth: "Won't the battery die in a few years and cost a fortune?",
    verdict: "Myth",
    short: "EV batteries lose only about 2% of their range a year, and among 2022-and-newer EVs just 0.3% have needed a new one.",
    answer: "Real-world data from 22,700 vehicles shows batteries lose about 2.3% of capacity a year on average, so a 300-mile car still has roughly 250 miles after eight years, and packs are expected to outlast the car (Geotab, 2026). Replacements are rare: 0.3% for EVs from 2022 on, outside recalls (Recurrent), and US DOE data puts replacements due to failure at 1.5% overall. Automakers typically warranty the battery for 8 years or 100,000 miles. Out of warranty, a replacement does cost $5,000 to $16,000, which is why a battery health report is worth getting on a used EV.",
    sources: [S.geotab, S.recurrentLife, S.doeReplace, S.recurrentCost],
  },
  {
    id: "ev-fires",
    topic: "ev",
    myth: "EVs catch fire all the time.",
    verdict: "Myth",
    short: "The best data we have says EVs catch fire far less often than gas cars, though a battery fire is harder to put out.",
    answer: "In Sweden, which tracks vehicle fires by fuel, combustion cars were about 20 times more likely to catch fire than EVs (Swedish Civil Contingencies Agency data via Swinburne University), and EV and plug-in hybrid fires stayed flat in 2024 while the fleet grew 14%. The US has no reliable national count by fuel type, so be wary of viral US statistics. The honest caveat: when a battery does burn, it burns hot and takes firefighters longer to put out.",
    sources: [S.swinburne, S.vibilagare],
  },
  {
    id: "chargers",
    topic: "ev",
    myth: "There aren't enough chargers. I'll get stranded.",
    verdict: "Mostly myth",
    short: `Most charging happens at home overnight, the average car drives under 40 miles a day, and the US has ${(ports / 1000).toFixed(0)},000+ public charging ports for trips.`,
    answer: `About 80% of charging happens at home (US DOE), so most days you leave with a full battery. The average household vehicle drove 14,200 miles in 2022, about 39 miles a day, well within any EV's range. For road trips, the Department of Energy lists ${ports.toLocaleString("en-US")} public charging ports, including ${dcFast.toLocaleString("en-US")} fast-charging ports. The part that's true: if you can't charge where you live, an EV takes more planning and public charging costs more.`,
    sources: [S.doeHome, S.nhts, S.afdc],
  },
  {
    id: "grid-coal",
    topic: "ev",
    myth: "EVs just move the pollution to coal plants.",
    verdict: "Myth",
    short: "Counting the power plant and the battery factory, a new US electric car produces about two-thirds less climate pollution than a gas car.",
    answer: "Life-cycle studies count everything: mining, building the battery, generating the electricity. On today's average US grid, a 2024 electric sedan produces 66% to 70% less greenhouse gas over its life than a gasoline sedan, and electric SUVs 71% to 74% less (ICCT, 2024). The Union of Concerned Scientists finds EVs come out ahead in every US grid region, and the gap widens as the grid gets cleaner. On a coal-heavy grid the advantage is smaller, but still there.",
    sources: [S.icct, S.ucs],
  },
  {
    id: "grid-capacity",
    topic: "ev",
    myth: "The grid can't handle everyone charging.",
    verdict: "Mostly myth",
    short: "All the electric cars in the US used under 1% of the country's electricity in the first half of 2026, mostly overnight when the grid has room.",
    answer: "US light-duty EVs used nearly 14 billion kWh in the first half of 2026 (EIA), which works out to under 1% of US electricity use by our arithmetic. Worldwide, the IEA puts EVs at about 0.7% of electricity demand in 2024, rising to about 2.5% by 2030. Growth will need investment, but it is gradual, and charging mostly happens overnight when demand is low. Many utilities pay or discount drivers who charge off-peak.",
    sources: [S.eiaEv, S.iea],
  },
  {
    id: "cold-range",
    topic: "ev",
    myth: "Cold weather kills EV range.",
    verdict: "Partly true",
    short: "At freezing, EVs keep about 78% of their range on average; at 20°F about 70%. Plan for it, but it rarely matters on a daily commute.",
    answer: "Cold does cut range. Across 30,000+ cars, EVs kept 78% of their range at 32°F and 70% at 20°F (Recurrent). AAA's 2026 lab test at 20°F with the heater on found a 39% drop, and hybrids lost 22.8% of their fuel economy too; even then, the EV cost $36.19 less per 1,000 miles charged at home. Warming the car while it is still plugged in, seat heaters and a heat-pump model all help. Norway, hardly a warm country, registered 95.9% fully electric new cars in 2025.",
    sources: [S.recurrentCold, S.aaa, S.ofv],
  },
  {
    id: "ev-reliability",
    topic: "ev",
    myth: "EVs break down more.",
    verdict: "Partly true",
    short: "Routine maintenance is cheaper with no oil changes, but newer EVs have had more software and charging glitches. Pick a model with a good record.",
    answer: "EVs have far fewer moving parts: Argonne National Laboratory puts scheduled maintenance at 6.1 cents a mile for an EV versus 10.1 cents for a gas car. But Consumer Reports' 2025 survey found EVs had more problems on average than gas cars, often with software, electronics and charging hardware, and it varies a lot by brand. Check model-specific ratings before you buy.",
    sources: [S.argonne, S.crReliability],
  },
  {
    id: "solar-cloudy",
    topic: "solar",
    myth: "Solar doesn't work where it's cloudy, and it never pays back.",
    verdict: "Mostly myth",
    short: "Panels in every US state but Alaska make more power than in Germany, a solar leader, and the average US solar shopper breaks even in about 10 years.",
    answer: "Panels work on daylight, not just direct sun; they make less in cloudy places, not nothing. Germany is one of the world's biggest solar markets, and Fraunhofer ISE uses about 950 kWh a year per kW of panels as a typical German yield. In our PVWatts model, panels in every US state except Alaska beat that, from about 1,160 in Washington to about 1,800 in California and Arizona. Payback depends on your electricity price and how your utility credits solar: EnergySage says its average shopper breaks even in about 10 years. Since the 30% federal credit ended after 2025, payback is longer than it was; our solar calculator shows your state's numbers.",
    sources: [S.fraunhofer, S.esPayback, S.pvwatts],
  },
  {
    id: "solar-roof",
    topic: "solar",
    myth: "Solar panels will wreck my roof.",
    verdict: "Myth",
    short: "Installed with sealed, flashed mounts, panels shouldn't harm a roof, and the installer's warranty covers installation damage. Just don't put them on an old roof.",
    answer: "\"A rooftop PV should have no negative impacts on a building if installed correctly,\" says the US Department of Energy's rooftop solar guide, and damage during installation is generally covered by the installer's workmanship warranty. Panels last about 25 to 30 years, about as long as a new roof, so if your roof is near the end of its life, replace it first; the DOE calls a roof replacement a great time to add solar. Panels even shade the roof they cover.",
    sources: [S.doeRoofGuide, S.doeRoof],
  },
  {
    id: "panels-wear-out",
    topic: "solar",
    myth: "Solar panels wear out in a few years.",
    verdict: "Myth",
    short: "Panels lose only about half a percent of output a year, so they're still making most of their power after 25 years.",
    answer: "A review of degradation studies by the National Renewable Energy Laboratory found a median loss of about 0.5% of output a year. Panels are typically warranted for 20 to 25 years and last about 25 to 30 (US DOE). The inverter usually needs replacing once along the way.",
    sources: [S.degradation, S.doeRoof],
  },
  {
    id: "need-whole-system",
    topic: "solar",
    myth: "Solar is all or nothing. I'd need a $30,000 system.",
    verdict: "Myth",
    short: "A plug-in solar kit starts under $500, plugs into an outlet, and needs no roof or installer.",
    answer: "Plug-in (balcony) solar kits of one to four panels plug into an ordinary outdoor outlet and power whatever is running in your home while the sun is up. The nonprofit Bright Saver sells a 360 W kit for $414.17 to members, and several states now allow kits up to 1,200 W without utility paperwork. If your roof isn't right, community solar lets you subscribe to a shared array in states that allow it.",
    sources: [S.brightSaver, S.communitySolar],
  },
  {
    id: "heat-pumps-cold",
    topic: "home",
    myth: "Heat pumps don't work in the cold.",
    verdict: "Mostly myth",
    short: "In real homes at 0 to 5°F, new cold-climate heat pumps still made about 2 units of heat for every unit of electricity. Over 60% of Norwegian homes use them.",
    answer: "Modern cold-climate heat pumps keep working well below freezing. In the US Department of Energy's field trial, the median unit delivered 1.9 times as much heat as the electricity it used at 0 to 5°F, and 1.6 to 2.7 times below 30°F (PNNL, 2025); a Canadian government test measured close to 2 at -13°F. More than 60% of households in Norway heat with them, and Maine passed 100,000 new heat pumps two years early. The partly-true bit: efficiency drops in deep cold, and some homes keep backup heat for the coldest days. Whether one saves you money also depends on your gas and electricity prices, which our planner shows.",
    sources: [S.pnnl, S.nrcan, S.norway],
  },
  {
    id: "induction-pans",
    topic: "home",
    myth: "Induction means buying all new pans.",
    verdict: "Mostly myth",
    short: "If a fridge magnet sticks to the bottom of your pan, it works on induction. That includes cast iron and most stainless steel.",
    answer: "Induction heats the pan itself through magnetism, so anything a magnet sticks to works: cast iron, enameled cast iron and most stainless steel (Consumer Reports). Plain aluminum, copper and glass don't. ENERGY STAR rates induction about 3 times as efficient as gas, and with no flame there's no combustion in your kitchen air.",
    sources: [S.crPans, S.esInduction],
  },
  {
    id: "only-rich",
    topic: "money",
    myth: "Going electric is only for rich people.",
    verdict: "Myth",
    short: "Plug-in solar starts under $500, power stations around $300, more than half of used EVs list under $30,000, and the savings arrive every month.",
    answer: "You don't have to start with a new car or a roof full of panels. A plug-in solar kit starts at $414.17 (Bright Saver member price), a small power station that runs a CPAP is about $300, the 2027 Chevrolet Bolt launched under $30,000, and more than half of used EVs listed in September 2026 were under $30,000 (Recurrent). The federal EV credits ended for vehicles bought after Sept 30, 2025, and the home solar and efficiency credits after 2025 (IRS), but DOE Home Energy Rebates are live in some states; check your state energy office.",
    sources: [S.brightSaver, S.river, S.recurrentUsed, S.gmBolt, S.irs, S.doeRebates],
  },
  {
    id: "battery-without-solar",
    topic: "battery",
    myth: "A home battery is pointless without solar.",
    verdict: "Mostly myth",
    short: "A battery keeps your fridge, Wi-Fi and lights on in an outage with or without panels, and some utilities pay you to share it.",
    answer: "Backup is the main reason most people buy one, and it works the same without solar: the battery charges from the grid and takes over when the power goes out. Some utilities pay battery owners to help during peak demand, solar or not; Massachusetts' ConnectedSolutions program pays $275 per kilowatt each summer, up to $1,375 a year for a 5 kW battery. Solar does make a battery more useful in a long outage, because it can refill each day.",
    sources: [S.massSave],
  },
];

export function myth(id: string): Myth {
  const m = MYTHS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown myth ${id}`);
  return m;
}

export const lite = (id: string): MythLite => {
  const m = myth(id);
  return { id: m.id, myth: m.myth, short: m.short };
};
