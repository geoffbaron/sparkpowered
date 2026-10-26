/**
 * Emergency prep products we name on the prep pages. Separate from
 * src/data/products.ts (power products) on purpose.
 *
 * Rule: a product goes in only if we could read its certification or
 * standards claim ourselves, on the maker's page or in a certifier's public
 * listing. Every entry records where we read it (`sourceUrl`) and when
 * (`checked`); tests/prep.test.ts fails if either is missing. No prices: they
 * change too often for a page that is about safety, not deals.
 *
 * `evidence` ranks the claim, strongest first:
 *   - "listed":  appears in a certifier's public listing (NSF, IAPMO) for that standard.
 *   - "maker-certified": the maker says a named third party certified it, but we
 *     did not find the listing ourselves.
 *   - "maker-meets": the maker says it "meets" or was "tested to" a standard. No
 *     certifier listing found. Worth less than a listing.
 */

import type { BrandId } from "@/data/affiliates";

export type Evidence = "listed" | "maker-certified" | "maker-meets";

export interface PrepProduct {
  id: string;
  name: string;
  /** Registered affiliate brand, or null for a plain link. */
  brand: BrandId | null;
  maker: string;
  /** Product page to send readers to. */
  url: string;
  kind: "purifier" | "tap-filter" | "radio";
  /** What it is for, in a few words. */
  use: string;
  /** The claim in the maker's or certifier's own terms, lightly trimmed. */
  claim: string;
  evidence: Evidence;
  /** Standards named in the claim. */
  standards: string[];
  /** Plain caveats a buyer should know. */
  caveats: string[];
  /** Where we read the claim. */
  sourceUrl: string;
  /** Date we read it, YYYY-MM-DD. */
  checked: string;
  /** Extra place to verify, such as a certifier's listing search. */
  verifyUrl?: string;
}

const CHECKED = "2026-10-26";

export const NSF_P231_LISTING = "https://info.nsf.org/Certified/DWTU/Listings.asp?Standard=P231&hdModlStd=ModlStd";

export const WATER_PRODUCTS: PrepProduct[] = [
  {
    id: "multipure-aquapremier",
    name: "Multipure Aquapremier (CBXT element)",
    brand: null,
    maker: "Multipure",
    url: "https://www.multipure.com/",
    kind: "purifier",
    use: "Home unit plumbed in to its own tap",
    claim: "Listed by NSF under Standard P231 (Microbiological Water Purifiers) for bacteria, live cyst and virus reduction.",
    evidence: "listed",
    standards: ["P231"],
    caveats: [
      "Works from your tap, so it needs water pressure. It is no help if the taps run dry.",
      "One of only four products, from two makers, in NSF's P231 listing when we checked.",
    ],
    sourceUrl: NSF_P231_LISTING,
    checked: CHECKED,
  },
  {
    id: "msr-guardian-gravity",
    name: "MSR Guardian Gravity Purifier",
    brand: "msr",
    maker: "MSR (Cascade Designs)",
    url: "https://cascadedesigns.com/products/guardian-gravity-purifier",
    kind: "purifier",
    use: "Gravity purifier for a household, 10-liter bag",
    claim:
      "Maker says it meets NSF Protocol P248 for removing viruses (99.99%), and the US EPA Guide Standard and Protocol for Testing Microbiological Purifiers.",
    evidence: "maker-meets",
    standards: ["P248", "EPA Guide Standard"],
    caveats: [
      "Maker's spec sheet lists it as not effective against chemicals or toxins.",
      "Not in NSF's public P231 listing; the P248 claim is the maker's.",
    ],
    sourceUrl: "https://cascadedesigns.com/products/guardian-gravity-purifier",
    checked: CHECKED,
    verifyUrl: NSF_P231_LISTING,
  },
  {
    id: "lifestraw-peak-gravity-purifier",
    name: "LifeStraw Peak Series Gravity Purifier",
    brand: "lifestraw",
    maker: "LifeStraw",
    url: "https://lifestraw.com/products/lifestraw-peak-series-gravity-purifier",
    kind: "purifier",
    use: "Gravity purifier, 8-liter bag",
    claim: "Maker says it meets US EPA and NSF P231 drinking water standards for removing viruses, bacteria and parasites.",
    evidence: "maker-meets",
    standards: ["P231", "EPA Guide Standard"],
    caveats: ["Not in NSF's public P231 listing when we checked; the maker says it was independently lab-tested."],
    sourceUrl: "https://lifestraw.com/products/lifestraw-peak-series-gravity-purifier",
    checked: CHECKED,
    verifyUrl: NSF_P231_LISTING,
  },
  {
    id: "lifestraw-family",
    name: "LifeStraw Family",
    brand: "lifestraw",
    maker: "LifeStraw",
    url: "https://lifestraw.com/products/lifestraw-family-emergency-water-filter",
    kind: "purifier",
    use: "Gravity purifier sized for a family",
    claim: "Maker says it meets NSF/ANSI P231 for reducing viruses, bacteria and parasites, and was lab-tested to WHO, US EPA and WQA standards.",
    evidence: "maker-meets",
    standards: ["P231"],
    caveats: [
      "Maker says it does not remove fluoride or chlorine.",
      "Not in NSF's public P231 listing when we checked.",
    ],
    sourceUrl: "https://lifestraw.com/products/lifestraw-family-emergency-water-filter",
    checked: CHECKED,
    verifyUrl: NSF_P231_LISTING,
  },
  {
    id: "grayl-geopress",
    name: "Grayl GeoPress Purifier (24 oz)",
    brand: "grayl",
    maker: "Grayl",
    url: "https://grayl.com/products/24oz-geopress-filter-purifier-water-bottle-nature-edition",
    kind: "purifier",
    use: "Press bottle for one person, about 24 oz at a time",
    claim:
      "Maker says it meets or exceeds the US EPA Water Purifier standard for microbiological filtration, and was tested by a certified lab to NSF/ANSI protocols 42 and 53.",
    evidence: "maker-meets",
    standards: ["EPA Guide Standard", "42", "53"],
    caveats: [
      "One bottle at a time: good for one person, slow for a household.",
      "Not in NSF's public listings when we checked; the claims are the maker's.",
    ],
    sourceUrl: "https://grayl.com/products/24oz-geopress-filter-purifier-water-bottle-nature-edition",
    checked: CHECKED,
    verifyUrl: "https://info.nsf.org/Certified/DWTU/",
  },
  {
    id: "aquatru-classic",
    name: "AquaTru Classic countertop reverse osmosis",
    brand: "aquatru",
    maker: "AquaTru",
    url: "https://aquatru.com/products/countertop-reverse-osmosis-water-purifier",
    kind: "tap-filter",
    use: "Countertop filter for tap water; plugs into the wall",
    claim: "Maker says it is independently tested and certified by IAPMO to NSF standards to reduce 84 contaminants found in tap water.",
    evidence: "maker-certified",
    standards: ["NSF standards, certified by IAPMO"],
    caveats: [
      "For tap water, not water of unknown quality: it is not a P231 purifier.",
      "Needs a 120-volt outlet, so it stops in a power outage unless you have backup power.",
      "Check the exact model in IAPMO's listing database.",
    ],
    sourceUrl: "https://aquatru.com/products/countertop-reverse-osmosis-water-purifier",
    checked: CHECKED,
    verifyUrl: "https://pld.iapmo.org/",
  },
  {
    id: "epic-pure-xp",
    name: "Epic Pure XP dispenser",
    brand: "epic",
    maker: "Epic Water Filters",
    url: "https://www.epicwaterfilters.com/products/epic-pure-water-filter-dispenser",
    kind: "tap-filter",
    use: "Pour-through dispenser for tap water",
    claim:
      "Maker says it is NSF certified to NSF/ANSI 42 and 372, and independently tested to NSF/ANSI 42, 53, 401 and P231. NSF's listing shows the PureXP cartridge certified for material safety only.",
    evidence: "maker-meets",
    standards: ["42", "372"],
    caveats: [
      "NSF's public listing for the PureXP cartridge says: certified for material safety requirements only.",
      "The maker's page names P231 in one place and P473 in another; we could not confirm either.",
      "Sold for municipal or well water, not water of unknown quality.",
    ],
    sourceUrl: "https://www.epicwaterfilters.com/products/epic-pure-water-filter-dispenser",
    checked: CHECKED,
    verifyUrl: "https://info.nsf.org/Certified/DWTU/Listings.asp?CompanyName=Epic&Program=DWTU",
  },
];

export const RADIO_PRODUCTS: PrepProduct[] = [
  {
    id: "midland-wr120",
    name: "Midland WR120 NOAA Weather and Emergency Alert Radio",
    brand: "midland",
    maker: "Midland",
    url: "https://midlandusa.com/products/wr120-noaa-weather-and-emergency-alert-radio",
    kind: "radio",
    use: "Tabletop alert radio for the bedroom or kitchen",
    claim: "Maker lists it as Public Alert Certified, with S.A.M.E. county programming (25 locations) and 3 AA batteries as backup power.",
    evidence: "maker-certified",
    standards: ["Public Alert (CTA-2009)", "SAME"],
    caveats: ["Batteries not included."],
    sourceUrl: "https://midlandusa.com/products/wr120-noaa-weather-and-emergency-alert-radio",
    checked: CHECKED,
  },
  {
    id: "midland-er310",
    name: "Midland ER310 Emergency Crank Weather Radio",
    brand: "midland",
    maker: "Midland",
    url: "https://midlandusa.com/products/er310-portable-emergency-crank-weather-radio",
    kind: "radio",
    use: "Portable radio you can charge by hand crank or solar",
    claim: "Maker lists NOAA Weather Radio with alert, plus hand crank, solar panel and a rechargeable battery.",
    evidence: "maker-meets",
    standards: ["NOAA alert"],
    caveats: [
      "The maker's page does not mention SAME or Public Alert certification, so it cannot be set to your county alone.",
      "The page gives two different battery capacities.",
    ],
    sourceUrl: "https://midlandusa.com/products/er310-portable-emergency-crank-weather-radio",
    checked: CHECKED,
  },
];

export const PREP_PRODUCTS: PrepProduct[] = [...WATER_PRODUCTS, ...RADIO_PRODUCTS];

export const EVIDENCE_LABEL: Record<Evidence, string> = {
  listed: "In a certifier's public listing",
  "maker-certified": "Maker names a third-party certifier",
  "maker-meets": "Maker's own claim only",
};

export const EVIDENCE_RANK: Record<Evidence, number> = { listed: 0, "maker-certified": 1, "maker-meets": 2 };
