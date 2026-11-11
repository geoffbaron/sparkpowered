/**
 * State and utility incentives for EVs, chargers, solar, batteries and heat
 * pumps, for the ten states people search most for "<state> ev tax credit"
 * (see docs/fact-check-2026-11-11-intent.md for how they were picked).
 *
 * RULES:
 *   - Every row was read on its official page (state agency, utility, or the
 *     US DOE AFDC / DSIRE where the state's own site would not load, which the
 *     row says) on `read`. Nothing is filled in from memory.
 *   - `ends` is what the page says; "No end date published" when it says none.
 *   - Drop a row, or mark it closed with the date, as soon as its page says so.
 * Shown on /states/<slug> in the Incentives section.
 */

export const STATE_INCENTIVES_READ = "2026-11-11";

export type IncentiveKind = "ev-purchase" | "ev-charger" | "solar-battery" | "heat-pump" | "ev-rate" | "ev-fee";
export type IncentiveStatus = "open" | "closed" | "waitlist" | "coming" | "in-force" | "unstated";

export interface StateProgram {
  name: string;
  kind: IncentiveKind;
  status: IncentiveStatus;
  amount: string;
  who: string;
  ends: string;
  url: string;
  /** Set when the program's own page could not be read and the row rests on AFDC or DSIRE. */
  via?: string;
  read: string;
}

export interface StateIncentives {
  /** Plain answer to "does <state> have an EV tax credit?" */
  evCredit: string;
  programs: StateProgram[];
}

const R = STATE_INCENTIVES_READ;
const NONE = "No end date published";

export const KIND_LABEL: Record<IncentiveKind, string> = {
  "ev-purchase": "EV purchase",
  "ev-charger": "Home charger",
  "solar-battery": "Solar and batteries",
  "heat-pump": "Heat pumps",
  "ev-rate": "EV rate",
  "ev-fee": "EV fees and taxes",
};

export const STATUS_LABEL: Record<IncentiveStatus, string> = {
  open: "Open",
  closed: "Closed",
  waitlist: "Waitlist",
  coming: "Not open yet",
  "in-force": "In force",
  unstated: "Listed (status not stated)",
};

export const STATE_INCENTIVES: Record<string, StateIncentives> = {
  NH: {
    evCredit:
      "New Hampshire has no state EV tax credit or rebate, and the federal EV credits ended for vehicles acquired after September 30, 2025. What NH does have is an extra yearly EV registration fee, plus utility heat pump rebates and EV rates.",
    programs: [
      {
        name: "EV registration surcharge", kind: "ev-fee", status: "in-force",
        amount: "$100 a year for a battery EV, $50 for a plug-in hybrid, on top of normal registration",
        who: "Everyone registering a battery EV or plug-in hybrid in NH", ends: NONE,
        url: "https://afdc.energy.gov/laws/13348", via: "US DOE AFDC summary; the NH statute site would not load for us", read: R,
      },
      {
        name: "NHSaves ducted air-source heat pump rebate (Eversource, Liberty, Unitil, NH Electric Co-op)", kind: "heat-pump", status: "open",
        amount: "$250 per ton; $2,000 per ton when replacing electric resistance heat; up to 5 tons per account (Eversource, Liberty, Unitil)",
        who: "Residential electric customers of a participating NH utility; resistance-heat replacements need pre-verification",
        ends: "Eversource, Liberty and Unitil: install by Dec 30, 2026 and postmark by Jan 30, 2027",
        url: "https://nhsaves.com/residential/electric-heating-cooling-equipment/", read: R,
      },
      {
        name: "NHSaves heat pump water heater rebate", kind: "heat-pump", status: "open",
        amount: "$900, instant at retailers or by mail", who: "Customers of a participating NH utility",
        ends: "Buy by Dec 31, 2026; submit by Jan 31, 2027",
        url: "https://nhsaves.com/residential/heat-pump-water-heater-2/", read: R,
      },
      {
        name: "Home Electrification and Appliance Rebates (HEAR), NH Department of Energy", kind: "heat-pump", status: "coming",
        amount: "Up to $8,000 for a heat pump, $1,750 for a heat pump water heater, $4,000 for a panel; $14,000 per household",
        who: "Households up to 150% of area median income; under 80% can get up to 100% of cost, 80-150% up to 50%",
        ends: "Expected to launch fall 2026 (page updated July 29, 2026); not retroactive",
        url: "https://www.energy.nh.gov/funding-opportunities/funding-opportunities-homeowners/home-electrification-and-appliance-rebates", read: R,
      },
      {
        name: "NH Electric Co-op home charger rebate and off-peak EV rate", kind: "ev-charger", status: "unstated",
        amount: "$300 after inspection of a Level 2 home charger", who: "Co-op members who enroll the charger in the off-peak rate (separate meter)", ends: NONE,
        url: "https://www.nhec.com/electric-vehicle-charging/", read: R,
      },
      {
        name: "Liberty Utilities NH EV time-of-use rate", kind: "ev-rate", status: "open",
        amount: "Cheaper overnight rate on a separately metered circuit (no dollar figure on the page)", who: "Liberty NH electric customers", ends: NONE,
        url: "https://new-hampshire.libertyutilities.com/derry/residential/smart-energy-use/electric/electric-vehicle-residential-new-hampshire-liberty.html", read: R,
      },
      {
        name: "Eversource NH time-of-day rate (ROTOD-2)", kind: "ev-rate", status: "open",
        amount: "Whole-house time-of-day rate; Eversource's NH EV page lists no charger rebate", who: "Eversource NH residential customers", ends: NONE,
        url: "https://www.eversource.com/residential/account-billing/manage-bill/about-your-bill/rates-tariffs/electric-delivery-rates/nh", read: R,
      },
      {
        name: "NH residential solar rebate", kind: "solar-battery", status: "closed",
        amount: "Was $0.20 per watt, up to $1,000", who: "No longer available", ends: "Permanently closed (repealed by SB 303 of 2024)",
        url: "https://www.energy.nh.gov/renewable-energy/renewable-energy-rebates/residential-renewable-electrical-generation-rebate", read: R,
      },
    ],
  },
  CA: {
    evCredit:
      "California has no state EV tax credit. Its state incentive is the MyFirstEV instant rebate at the dealer (since August 7, 2026), and the old Clean Vehicle Rebate Project closed on November 8, 2023.",
    programs: [
      {
        name: "MyFirstEV instant rebate (California Air Resources Board)", kind: "ev-purchase", status: "open",
        amount: "$3,500 off a new EV; $1,750 off a used EV", who: "First-time EV buyers, no income limit; new cars up to $50,000 MSRP, used up to $25,000, at participating dealers",
        ends: "No end date published; one-time $135.5 million, while funding lasts",
        url: "https://ww2.arb.ca.gov/resources/fact-sheets/myfirstev-frequently-asked-questions", read: R,
      },
      {
        name: "Clean Cars 4 All (Driving Clean Assistance Program, scrap and replace)", kind: "ev-purchase", status: "open",
        amount: "Amount not shown on the pages we could read", who: "Lower-income residents in priority areas who scrap an older car for a new or used EV or plug-in hybrid",
        ends: "No end date published; its separate financing option is closed",
        url: "https://drivingcleanca.org/", read: R,
      },
      {
        name: "PG&E Pre-Owned EV Rebate", kind: "ev-purchase", status: "open",
        amount: "$4,000 for income-qualified buyers; the $1,000 standard rebate ended Nov 11, 2026", who: "PG&E customers buying or leasing a used EV, within 90 days",
        ends: "From Nov 12, 2026, income-qualified customers only",
        url: "https://evrebates.pge.com/", read: R,
      },
      {
        name: "PG&E Residential Charging Solutions Rebate", kind: "ev-charger", status: "unstated",
        amount: "Up to 50% of a charger; income-qualified up to $2,000 for installation or $5,000 with a panel upgrade",
        who: "PG&E customers; the higher tier needs income under 80% of area median or CalFresh, Medi-Cal or WIC", ends: NONE,
        url: "https://www.pge.com/en/clean-energy/electric-vehicles/getting-started-with-electric-vehicles/residential-charging-solutions-rebate.html", read: R,
      },
      {
        name: "SGIP home battery rebates (Residential Solar and Storage Equity)", kind: "solar-battery", status: "waitlist",
        amount: "$3.10 per watt of solar plus $1.10 per Wh of battery", who: "Equity customers; open or waitlisted depending on utility (PG&E and SCE split, SoCalGas and SDG&E-area waitlisted)",
        ends: "New applications due by June 30, 2028; utility-bill-funded budgets closed Dec 30, 2025",
        url: "https://www.selfgenca.com/home/program_metrics/", read: R,
      },
      {
        name: "HEEHRA heat pump rebates, single-family (TECH Clean California)", kind: "heat-pump", status: "waitlist",
        amount: "Varies by technology and income", who: "Income-qualified households", ends: "Fully reserved statewide since Feb 24, 2026",
        url: "https://techcleanca.com/incentives/single-family-incentives/", read: R,
      },
      {
        name: "Road Improvement Fee (DMV)", kind: "ev-fee", status: "in-force",
        amount: "$121 a year", who: "Zero-emission vehicles from model year 2020 on", ends: NONE,
        url: "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/", read: R,
      },
    ],
  },
  TX: {
    evCredit:
      "Texas has no state EV tax credit. Its one state EV grant, TERP's $2,500 light-duty incentive, is closed (the 2026 round's deadline was March 6, 2026), and Texas charges a $200 yearly EV fee.",
    programs: [
      {
        name: "TERP Light-Duty Motor Vehicle Purchase or Lease Incentive (TCEQ)", kind: "ev-purchase", status: "closed",
        amount: "Was $2,500 to buy or lease 3+ years", who: "New EVs and plug-in hybrids titled in Texas", ends: "Closed; the 2026 application deadline was Mar 6, 2026",
        url: "https://www.tceq.texas.gov/airquality/terp/ldplip", read: R,
      },
      {
        name: "Electric Vehicle Fee (TxDMV)", kind: "ev-fee", status: "in-force",
        amount: "$200 a year at renewal; $400 up front on a new EV", who: "Fully electric vehicles up to 10,000 lb, not hybrids", ends: NONE,
        url: "https://www.txdmv.gov/motorists/register-your-vehicle", read: R,
      },
      {
        name: "Austin Energy Home EV Charger Rebate", kind: "ev-charger", status: "open",
        amount: "Up to $500 or 50% of the charger price", who: "Austin Energy customers with an EV who enroll in Power Partner EV", ends: "No end date published; first come, first served",
        url: "https://austinenergy.com/green-power/plug-in-austin/home-charging", read: R,
      },
      {
        name: "Austin Energy Residential Solar Rebate", kind: "solar-battery", status: "unstated",
        amount: "$4,000", who: "Austin Energy customers; new system of 3 kW or more by a participating contractor", ends: NONE,
        url: "https://austinenergy.com/green-power/solar-solutions/for-your-home", read: R,
      },
      {
        name: "Austin Energy Heat Pump Rebate", kind: "heat-pump", status: "open",
        amount: "$650, $750 or $950 by efficiency", who: "Austin Energy customers replacing a system at least 10 years old", ends: "No end date published; limited funding",
        url: "https://austinenergy.com/energy-efficiency/rebates-incentives/residential/cooling-heating/ac", read: R,
      },
    ],
  },
  FL: {
    evCredit:
      "Florida has no state EV tax credit or rebate, and no extra EV registration fee: a 2026 bill for a $250 fee (SB 804) died in committee on March 13, 2026.",
    programs: [
      {
        name: "Solar equipment sales tax exemption (Florida Department of Revenue)", kind: "solar-battery", status: "in-force",
        amount: "Exempt from the 6% state sales tax", who: "Buyers of solar equipment certified by the Florida Solar Energy Center", ends: NONE,
        url: "https://floridarevenue.com/taxes/taxesfees/pages/sales_tax_incent.aspx", read: R,
      },
      {
        name: "FPL EVolution Home (charger subscription)", kind: "ev-charger", status: "open",
        amount: "$36 a month with installation, $27 equipment only, 10-year agreement", who: "FPL customers in a single-family home or townhouse with an attached garage", ends: NONE,
        url: "https://www.fpl.com/electric-vehicles/for-drivers/evolution-home.html", read: R,
      },
      {
        name: "FPL residential HVAC rebate", kind: "heat-pump", status: "open",
        amount: "$200 per qualifying heat pump or central AC", who: "FPL customers using an FPL-approved contractor", ends: NONE,
        url: "https://www.fpl.com/content/dam/fplgp/us/en/save/pdf/residential-air-conditioning-program-standards.pdf", read: R,
      },
      {
        name: "OUC EV purchase or lease rebate (Orlando)", kind: "ev-purchase", status: "unstated",
        amount: "$200", who: "OUC electric customers, within 6 months of purchase", ends: NONE,
        url: "https://www.ouc.com/solutions-programs/savings/rebates/electric-vehicle-purchase-lease/", read: R,
      },
    ],
  },
  NY: {
    evCredit: "New York has no state EV tax credit. Its state incentive is the Drive Clean Rebate, up to $2,000 off at the dealer.",
    programs: [
      {
        name: "Drive Clean Rebate (NYSERDA)", kind: "ev-purchase", status: "open",
        amount: "$500 to $2,000 off a new EV at the dealer ($2,000 for 200+ miles of range; $500 if MSRP is over $42,000)", who: "New York buyers or lessees of 60+ eligible new models", ends: NONE,
        url: "https://www.nyserda.ny.gov/All-Programs/Drive-Clean-Rebate-For-Electric-Cars-Program", read: R,
      },
      {
        name: "Solar Energy System Equipment Credit (state income tax)", kind: "solar-battery", status: "in-force",
        amount: "25% of cost, up to $5,000", who: "Solar bought, leased or on a 10+ year power purchase deal at your main NY home", ends: NONE,
        url: "https://www.tax.ny.gov/pit/credits/solar_energy_system_equipment_credit.htm", read: R,
      },
      {
        name: "NY-Sun home solar incentive", kind: "solar-battery", status: "open",
        amount: "Depends on size and location (not published on the consumer page); a new $200 million framework was announced Oct 14, 2026", who: "Homes using a NY-Sun contractor; more for households under 80% of area median income", ends: "No end date published; incentives phase down over time",
        url: "https://www.nyserda.ny.gov/All-Programs/NY-Sun/On-site-Solar/Homes/Paying-for-Solar", read: R,
      },
      {
        name: "Con Edison air-source heat pump incentives (NYS Clean Heat)", kind: "heat-pump", status: "open",
        amount: "Up to $11,000 ($7,000 standard full replacement)", who: "Con Edison customers (NYC and Westchester) using an approved contractor", ends: NONE,
        url: "https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-residential-customers/electric-heating-and-cooling-technology-for-renters-homeowners/save-on-a-central-air-source-heat-pump", read: R,
      },
      {
        name: "Con Edison SmartCharge NY", kind: "ev-rate", status: "open",
        amount: "10 cents per kWh charged midnight to 8am, plus bonuses; about $400 a year on average", who: "Con Edison customers charging a compatible EV or charger, not on a time-of-use rate", ends: NONE,
        url: "https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-residential-customers/electric-vehicle-rewards", read: R,
      },
    ],
  },
  NJ: {
    evCredit:
      "New Jersey has no state EV tax credit. Its state incentive is the Charge Up New Jersey rebate at the dealer. The EV sales tax exemption ended June 30, 2025, and EVs pay a yearly zero-emission vehicle fee.",
    programs: [
      {
        name: "Charge Up New Jersey (with income-based Charge Up+)", kind: "ev-purchase", status: "open",
        amount: "$1,500 at the dealer; up to $4,000 in all with Charge Up+", who: "NJ residents buying or leasing an eligible new battery EV; Charge Up+ needs income prequalification first", ends: "No end date published; $50 million for fiscal 2026 and $30 million for fiscal 2027",
        url: "https://chargeup.njcleanenergy.com/", read: R,
      },
      {
        name: "Charge Up in-home charger incentive", kind: "ev-charger", status: "open",
        amount: "Up to $250", who: "NJ residents buying a qualifying Level 2 home charger", ends: NONE,
        url: "https://chargeup.njcleanenergy.com/", read: R,
      },
      {
        name: "Zero-emission vehicle sales tax exemption", kind: "ev-fee", status: "closed",
        amount: "Ended: EVs now pay the full 6.625% sales tax", who: "All EV buyers and lessees", ends: "Ended June 30, 2025",
        url: "https://www.nj.gov/treasury/taxation/pdf/help/2025-update-handout.pdf", read: R,
      },
      {
        name: "Annual zero-emission vehicle fee (NJ MVC)", kind: "ev-fee", status: "in-force",
        amount: "$250 a year from July 1, 2024, rising $10 a year for four years", who: "Every registered zero-emission vehicle; new ones pay four years up front", ends: NONE,
        url: "https://www.nj.gov/mvc/vehicles/regfees.htm", read: R,
      },
    ],
  },
  MA: {
    evCredit: "Massachusetts has no state EV tax credit. Its state incentive is the MOR-EV rebate: $3,500 for a new or used EV, more for income-qualified buyers and trade-ins.",
    programs: [
      {
        name: "MOR-EV rebates (Standard, Used, MOR-EV+, Trade-In)", kind: "ev-purchase", status: "open",
        amount: "$3,500 new; $3,500 used (income-qualified); +$1,500 MOR-EV+; +$1,000 for trading in a gas car", who: "MA residents; used and MOR-EV+ are income-qualified; apply within 90 days", ends: NONE,
        url: "https://mor-ev.org/cars-overview", read: R,
      },
      {
        name: "Mass Save air-source heat pump rebates", kind: "heat-pump", status: "open",
        amount: "Whole-home $2,650 per ton up to $8,500 in 2026; income-based up to $16,000", who: "Mass Save customers", ends: "Whole-home rate drops to $2,350 per ton (cap $7,500) for installs from Jan 1, 2027",
        url: "https://www.masssave.com/en/residential/rebates-offers-services/heating-and-cooling/heat-pumps/air-source-heat-pumps", read: R,
      },
      {
        name: "National Grid EV Charging Upgrade Program", kind: "ev-charger", status: "open",
        amount: "Up to $700 for wiring; up to $1,000 in environmental justice areas or on the R-2 low-income rate", who: "National Grid MA customers installing a 240 V circuit for a qualified smart charger", ends: "Apply by Dec 10, 2026",
        url: "https://www.nationalgridus.com/electric-vehicle-hub/Programs/Massachusetts/EV-Charging-Upgrade-Program", read: R,
      },
      {
        name: "Eversource MA EV Charging Rebate", kind: "ev-charger", status: "closed",
        amount: "Wiring and panel costs", who: "Eversource MA customers", ends: "Closed for 2026: the deadline was Nov 1, 2026",
        url: "https://www.eversource.com/residential/save-money-energy/clean-energy-options/electric-vehicles/charging-stations/wma", read: R,
      },
      {
        name: "Residential Renewable Energy Income Tax Credit", kind: "solar-battery", status: "in-force",
        amount: "15% of net cost, up to $1,000", who: "Solar or wind at your main MA home", ends: NONE,
        url: "https://www.mass.gov/info-details/massachusetts-residential-property-tax-credits", read: R,
      },
    ],
  },
  CO: {
    evCredit:
      "Yes: Colorado's Innovative Motor Vehicle Credit is $750 for a new EV bought or leased in tax year 2026 (it was $3,500 in 2025), plus $2,500 more if the MSRP is under $35,000.",
    programs: [
      {
        name: "Innovative Motor Vehicle Credit (Colorado Department of Revenue)", kind: "ev-purchase", status: "open",
        amount: "$750 in tax year 2026 ($3,500 in 2025); +$2,500 if MSRP is under $35,000; 2027-2028 amounts set by revenue forecasts", who: "New EVs bought or leased with an MSRP of $80,000 or less",
        ends: "The extra $2,500 runs through tax year 2028; no end date published for the base credit",
        url: "https://tax.colorado.gov/income-tax-topics-innovative-motor-vehicle-credit", read: R,
      },
      {
        name: "Vehicle Exchange Colorado", kind: "ev-purchase", status: "open",
        amount: "$9,000 off a new EV; $6,000 off a used EV, at the dealer", who: "Income-qualified Coloradans scrapping a car 12+ years old or one that failed emissions",
        ends: "No end date published; subject to available funds",
        url: "https://energyoffice.colorado.gov/vehicle-exchange-colorado", read: R,
      },
      {
        name: "Colorado Heat Pump Tax Credit (as a contractor discount)", kind: "heat-pump", status: "open",
        amount: "2026: air-source $1,000 credit with at least $333 off your bill; ground-source $2,000 / $667; heat pump water heater $250 / $83", who: "Homeowners using a state-registered contractor; you file nothing",
        ends: "Amounts drop again in tax year 2029",
        url: "https://energyoffice.colorado.gov/hptc", read: R,
      },
      {
        name: "EV registration and road usage fees", kind: "ev-fee", status: "in-force",
        amount: "$63.05 plug-in EV fee plus a $26 road usage fee for a battery EV ($13 PHEV), July 1, 2026 to June 30, 2027", who: "All Colorado EV and plug-in hybrid registrations", ends: "Schedule rises yearly through June 30, 2032",
        url: "https://dmv.colorado.gov/taxes-and-fees", read: R,
      },
    ],
  },
  WA: {
    evCredit:
      "Washington has no state EV tax credit. Its EV sales tax exemption expired July 31, 2025, and the state instant rebate's funds are spent; a new $5 million program is out for bids for January to June 2027.",
    programs: [
      {
        name: "EV sales and use tax exemption", kind: "ev-fee", status: "closed",
        amount: "Was up to $15,000 of a new EV's price ($16,000 used)", who: "Leases signed by July 31, 2025 keep it on payments through July 31, 2028", ends: "Expired July 31, 2025",
        url: "https://dor.wa.gov/content/clean-alternative-fuel-and-plug-hybrid-vehicles-salesuse-tax-exemptions", read: R,
      },
      {
        name: "WA EV Instant Rebate (Department of Commerce)", kind: "ev-purchase", status: "closed",
        amount: "Was $2,500 to $9,000 at the dealer", who: "Was households up to 300% of the federal poverty level", ends: "Round 1 funds spent; a new program is planned for Jan to June 2027",
        url: "https://www.commerce.wa.gov/clean-transportation/", read: R,
      },
      {
        name: "EV registration fees (Department of Licensing)", kind: "ev-fee", status: "in-force",
        amount: "$225 a year: $100 + $50 electric car fees and a $75 transportation electrification fee", who: "Washington EV registrations", ends: NONE,
        url: "https://dol.wa.gov/vehicles-and-boats/vehicles/vehicle-registration/calculate-vehicle-tab-fees", read: R,
      },
      {
        name: "State Home Electrification and Appliance Rebates (HEAR)", kind: "heat-pump", status: "open",
        amount: "Set by each of 40 local administrators ($39.3 million awarded)", who: "Households up to 150% of area median income", ends: NONE,
        url: "https://www.commerce.wa.gov/energy-incentives/hear/", read: R,
      },
    ],
  },
  IL: {
    evCredit: "Illinois has no EV tax credit, but it has a state rebate: the Illinois EPA EV Rebate, $4,000 for low-income buyers and $2,000 for others, open until December 31, 2026.",
    programs: [
      {
        name: "Illinois EPA Electric Vehicle Rebate", kind: "ev-purchase", status: "open",
        amount: "$4,000 low-income; $2,000 other eligible buyers; $1,500 electric motorcycle", who: "IL residents up to 500% of the federal poverty level buying a new or used EV up to $80,000 from an IL dealer; no leases",
        ends: "This cycle runs Aug 1 to Dec 31, 2026, while funds last; postmark within 180 days of purchase",
        url: "https://epa.illinois.gov/topics/ceja/electric-vehicle-rebates.html", read: R,
      },
      {
        name: "ComEd Residential EV Charger and Installation Rebate", kind: "ev-charger", status: "coming",
        amount: "Up to $2,500 low-income or in low-income communities; up to $750 others", who: "ComEd customers on an hourly or time-of-day rate for at least 3 years; an approved installer applies",
        ends: "Next window Jan 1 to Dec 31, 2027",
        url: "https://www.comed.com/about-us/clean-energy/electric-vehicle-charger-and-installation-rebate", read: R,
      },
      {
        name: "Battery EV fee", kind: "ev-fee", status: "in-force",
        amount: "$100 a year on top of registration", who: "Illinois battery EV owners", ends: NONE,
        url: "https://afdc.energy.gov/laws/12254", via: "US DOE AFDC summary; the Secretary of State's site would not load for us", read: R,
      },
    ],
  },
};
