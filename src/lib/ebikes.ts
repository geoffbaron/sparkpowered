/**
 * E-bike running cost, rules and programs for the /e-bikes guides. Every
 * figure below was read on its source on EBIKE_FACTS_CHECKED; the quotes are
 * in ~/Grant/marketing/sparkpowered-ebikes/facts.md (outside the repo).
 */

import { NATIONAL } from "@/lib/energy";

export const EBIKE_FACTS_CHECKED = "2026-11-02";

export const EBIKE_SOURCES = {
  efficiencyVermont: { name: "Efficiency Vermont: Electric Bikes, Survey and Energy Efficiency Analysis (2018)", url: "https://www.efficiencyvermont.com/Media/Default/docs/white-papers/efficiency-vermont-electric-bike-white-paper.pdf" },
  aaa: { name: "AAA: Your Driving Costs 2026 fact sheet", url: "https://newsroom.aaa.com/wp-content/uploads/2026/09/AAA_YDC-Fact-Sheet_2026.pdf" },
  afdcTrips: { name: "U.S. DOE Alternative Fuels Data Center: Share of U.S. vehicle trips by length (2022 NHTS)", url: "https://afdc.energy.gov/data/10318" },
  cfrClasses: { name: "36 CFR 1.4: e-bike classes (eCFR)", url: "https://www.ecfr.gov/current/title-36/chapter-I/part-1/section-1.4" },
  usc2085: { name: "15 U.S.C. 2085: low-speed electric bicycles (Cornell LII)", url: "https://www.law.cornell.edu/uscode/text/15/2085" },
  pfbStates: { name: "PeopleForBikes: 2024 policy wins (43 states use the three-class model)", url: "https://www.peopleforbikes.org/news/peopleforbikes-2024-policy-wins" },
  danville: { name: "Town of Danville, CA: E-bike FAQ (California class 3 rules)", url: "https://danville.ca.gov/1100/E--Bike-and-E-Scooter-FAQ" },
  ebikeAct: { name: "Congress.gov: H.R. 1685, E-BIKE Act (118th Congress)", url: "https://www.congress.gov/bill/118th-congress/house-bill/1685" },
  cpscAdvice: { name: "CPSC: Micromobility information center", url: "https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Micromobility-Information-Center" },
  cpscReport: { name: "CPSC: Micromobility deaths, injuries and hazard patterns 2017-2024 (April 2026)", url: "https://www.cpsc.gov/s3fs-public/Micromobility_Products-Related_Deaths_Injuries_and_Hazard_Patterns_2017-2024.pdf" },
  nycLaw: { name: "NYC Department of Consumer and Worker Protection: UL certification for e-bikes and batteries (2023)", url: "https://www.nyc.gov/site/dca/news/044-23/city-reminds-retailers-consumers-only-purchase-certified-lithium-ion-batteries-mobility" },
  ulse: { name: "UL Standards & Engagement: UL 2849 and UL 2271 explained (2024)", url: "https://ulse.org/news/deaths-e-bike-fires-declining-new-york-city-after-ul-standards-written-law" },
  cpscRule: { name: "Federal Register: proposed safety standard for micromobility lithium-ion batteries (June 24, 2026)", url: "https://www.federalregister.gov/documents/2026/06/24/2026-12749/safety-standard-for-lithium-ion-batteries-used-in-micromobility-products-and-electrical-systems-of" },
} as const;

/** Efficiency Vermont's average e-bike use: 1.02 kWh per 100 miles. */
export const EBIKE_KWH_PER_100MI = 1.02;
/** Electricity for one e-bike mile at the US average home price, in cents (our arithmetic). */
export const EBIKE_CENTS_PER_MILE = (EBIKE_KWH_PER_100MI / 100) * NATIONAL.residentialCentsPerKwhYtd;
/** AAA 2026: full cost of a new car, cents per mile at 15,000 miles a year. */
export const AAA_CENTS_PER_MILE = 86;
/** AAA 2026: fuel alone, cents per mile. */
export const AAA_FUEL_CENTS_PER_MILE = 17.3;
/** 2022 NHTS via AFDC: share of US vehicle trips under 6 miles. */
export const SHORT_TRIP_SHARE = 51.7;

export interface EbikeProgram {
  place: string;
  name: string;
  amount: string;
  who: string;
  status: string;
  open: boolean;
  url: string;
}

/** State and city programs, status as stated on the official page on EBIKE_FACTS_CHECKED. */
export const EBIKE_PROGRAMS: EbikeProgram[] = [
  { place: "Colorado", name: "State e-bike discount", amount: "$225 off at participating shops in 2026", who: "Colorado residents, one a year, no income limit stated", status: "Open (in law through 2032)", open: true, url: "https://tax.colorado.gov/income-tax-topics-electric-bicycle-credit" },
  { place: "Washington", name: "WE-Bike rebate (WSDOT)", amount: "$300, or $1,200 if income-qualified", who: "Residents 16 and older, chosen by monthly drawing", status: "Applications open March 30, 2026 to March 29, 2027", open: true, url: "https://wsdot.wa.gov/about/news/2026/washingtons-e-bike-rebate-program-opening-second-application-round-march-30" },
  { place: "Portland, OR", name: "Portland Rides", amount: "Up to $1,600; up to $2,350 for a cargo bike", who: "Portland residents 18 and older at or below 60% of area median income", status: "Applications open year-round; new ones roll into 2027", open: true, url: "https://portlandebikerebate.com/" },
  { place: "Hawaii", name: "HDOT e-bike rebate", amount: "The lesser of $500 or 20% of the price", who: "18 and older, in a low-income program, without a car, or a student", status: "Page still live; 2026 funding not confirmed, check before you buy", open: true, url: "https://hidot.hawaii.gov/hawaii-electric-bike-and-moped-rebate/" },
  { place: "Denver", name: "E-bike vouchers", amount: "$675 standard (2026)", who: "Denver residents 16 and older, income limits", status: "All 2026 vouchers claimed; waitlist", open: false, url: "https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Climate-Action-Sustainability-and-Resiliency/Cutting-Denvers-Carbon-Pollution/Sustainable-Transportation/Electric-Bike-Rebates" },
  { place: "California", name: "E-Bike Incentive Project (CARB)", amount: "Was up to $2,000", who: "Income-qualified Californians", status: "Ended December 2025", open: false, url: "https://ww2.arb.ca.gov/our-work/programs/california-e-bike-incentive-project" },
  { place: "Massachusetts", name: "MassCEC e-bike vouchers", amount: "Income-based", who: "Low- and moderate-income residents", status: "Closed; not expected to reopen in 2026", open: false, url: "https://goclean.masscec.com/homeowners/electric-bicycles" },
  { place: "Minnesota", name: "E-bike rebate", amount: "Was up to $750", who: "Income limits", status: "Closed for good", open: false, url: "https://www.revenue.state.mn.us/so/mndor-pp/19716?type=html" },
];
