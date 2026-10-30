/**
 * Hand-checked local facts for a few state pages. Every line was read on the
 * official source on CHECKED; re-check before changing a figure, and drop a
 * program once its page says it has closed. Fact-check log:
 * docs/fact-check-2026-10-30.md
 */

export const LOCAL_CHECKED = "2026-10-30";

export interface LocalSource {
  name: string;
  url: string;
}

export interface LocalFact {
  label: string;
  text: string;
  source: LocalSource;
}

/** EIA Electric Power Monthly, Table 5.6.A (released 23 October 2026; 2026 figures preliminary). */
export const EIA_LATEST: { month: string; prevMonth: string; source: LocalSource; us: [number, number] } = {
  month: "August 2026",
  prevMonth: "August 2025",
  us: [18.16, 17.57],
  source: {
    name: "EIA, Electric Power Monthly, Table 5.6.A (August 2026, released 23 October 2026; preliminary)",
    url: "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a",
  },
};

export interface StateLocal {
  /** Average residential price in cents per kWh: [EIA_LATEST.month, EIA_LATEST.prevMonth]. */
  eiaLatest: [number, number];
  facts: LocalFact[];
}

const ICC: LocalSource = { name: "Illinois Commerce Commission: electric utilities", url: "https://www.icc.illinois.gov/authority/electric-utility" };
const IEPA_EV: LocalSource = { name: "Illinois EPA: Electric Vehicle Rebate Program", url: "https://epa.illinois.gov/topics/ceja/electric-vehicle-rebates.html" };
const IL_SHINES: LocalSource = { name: "Illinois Shines (Illinois Power Agency): Small Distributed Generation", url: "https://illinoisshines.com/small-distributed-generation/" };
const HECO: LocalSource = { name: "Hawaiian Electric: Power Facts", url: "https://www.hawaiianelectric.com/about-us/power-facts" };
const KIUC: LocalSource = { name: "Kauai Island Utility Cooperative: About us", url: "https://www.kiuc.coop/about-us" };
const HI_N342: LocalSource = { name: "Hawaii Department of Taxation: Instructions for Form N-342 (Rev. 2025)", url: "https://files.hawaii.gov/tax/forms/2025/n342ins.pdf" };
const HI_ENERGY: LocalSource = { name: "Hawaii Energy: heat pump water heater rebate", url: "https://hawaiienergy.com/for-homes/water-heating/heat-pump" };
const CO_DOR: LocalSource = {
  name: "Colorado Department of Revenue: Innovative Motor Vehicle Credit (Nov 2025)",
  url: "https://tax.colorado.gov/sites/tax/files/documents/ITT_Innovative_Motor_Vehicle_Credit_Nov_2025.pdf",
};
const CO_PUC: LocalSource = { name: "Colorado Public Utilities Commission: electric rate cases", url: "https://puc.colorado.gov/electric-rate-cases" };
const KCC_NM: LocalSource = { name: "Kansas Corporation Commission: Net Metering in Kansas", url: "https://www.kcc.ks.gov/electric/net-metering-in-kansas" };
const OCC_CHOICE: LocalSource = { name: "Ohio Consumers' Counsel: Energy choice", url: "https://www.occ.ohio.gov/factsheet/energy-choice-how-make-wise-energy-choices" };
const OCC_BILL: LocalSource = { name: "Ohio Consumers' Counsel: Electric bill made easy", url: "https://occ.ohio.gov/factsheet/electric-bill-made-easy" };

export const STATE_LOCAL: Record<string, StateLocal> = {
  IL: {
    eiaLatest: [19.32, 18.03],
    facts: [
      {
        label: "Utilities",
        text: "ComEd and Ameren Illinois are the state's two big investor-owned electric utilities, regulated by the Illinois Commerce Commission. MidAmerican and Mt. Carmel serve smaller areas.",
        source: ICC,
      },
      {
        label: "EV rebate",
        text: "The Illinois EPA EV rebate cycle runs 1 August to 31 December 2026: $2,000 for an all-electric car ($4,000 for low-income applicants) and $1,500 for an electric motorcycle, bought from an Illinois dealer for $80,000 or less, while funds last.",
        source: IEPA_EV,
      },
      {
        label: "Solar",
        text: "Illinois Shines, the state's solar incentive program, pays incentives for home systems up to 25 kW. The payment goes to the approved installer, who may pass it on to you, so ask for it in the quote.",
        source: IL_SHINES,
      },
    ],
  },
  HI: {
    eiaLatest: [47.18, 38.53],
    facts: [
      {
        label: "Utilities",
        text: "Hawaiian Electric serves about 95% of residents, on Oahu, Maui, Molokai, Lanai and Hawaii Island. Kauai is served by the Kauai Island Utility Cooperative.",
        source: HECO,
      },
      {
        label: "Solar tax credit",
        text: "Hawaii's state income tax credit for a solar electric system on a single-family home is the lesser of 35% of its cost or $5,000 (after subtracting any utility rebate). Solar water heaters get up to $2,250.",
        source: HI_N342,
      },
      {
        label: "Heat pump water heater",
        text: "Hawaii Energy offers up to a $700 instant in-store rebate on a qualifying ENERGY STAR heat pump water heater, on every island except Kauai, while funds last.",
        source: HI_ENERGY,
      },
    ],
  },
  CO: {
    eiaLatest: [17.17, 16.21],
    facts: [
      {
        label: "Utilities",
        text: "The state utility commission sets rates for Colorado's two investor-owned electric utilities, Xcel Energy and Black Hills Energy. Many other homes are served by rural electric co-ops and city-owned utilities.",
        source: CO_PUC,
      },
      {
        label: "EV tax credit",
        text: "Colorado's state tax credit for a new EV bought or leased in 2026 is $750, plus another $2,500 if the car's MSRP is under $35,000. Cars with an MSRP over $80,000 get no credit.",
        source: CO_DOR,
      },
    ],
  },
  KS: {
    eiaLatest: [15.47, 14.65],
    facts: [
      {
        label: "Utilities",
        text: "Evergy and Empire District (Liberty) are Kansas's two investor-owned electric utilities. Electric co-ops and city-owned utilities serve other parts of the state.",
        source: KCC_NM,
      },
      {
        label: "Net metering",
        text: "Evergy and Empire District must offer net metering to home solar owners. Electric co-ops and city-owned utilities are not required to, so co-op members should ask their utility how it credits exports.",
        source: KCC_NM,
      },
    ],
  },
  OH: {
    eiaLatest: [19.38, 17.55],
    facts: [
      {
        label: "Utilities",
        text: "Ohio's main home electric utilities are AEP Ohio (Ohio Power), FirstEnergy, Duke Energy Ohio and AES Ohio.",
        source: OCC_BILL,
      },
      {
        label: "Energy choice",
        text: "Most Ohio homes can choose who supplies their electricity while the local utility still delivers it. Compare any offer with the 'price to compare' on your bill before you switch.",
        source: OCC_CHOICE,
      },
    ],
  },
};

/** Slugs of the state pages with local facts, for internal links. */
export const LOCAL_STATE_LINKS = [
  { abbr: "IL", slug: "illinois", name: "Illinois" },
  { abbr: "HI", slug: "hawaii", name: "Hawaii" },
  { abbr: "CO", slug: "colorado", name: "Colorado" },
  { abbr: "KS", slug: "kansas", name: "Kansas" },
  { abbr: "OH", slug: "ohio", name: "Ohio" },
] as const;
