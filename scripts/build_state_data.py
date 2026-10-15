#!/usr/bin/env python3
"""
Rebuilds src/data/state-energy.json from public government sources.

Every number on the state pages comes from this file, and every number in this
file comes from one of the sources listed in SOURCES below. Nothing is typed in
by hand except the reference-vehicle IDs, the PADD region mapping (EIA's own
definitions) and the representative city per state.

Usage (needs Python 3.9+, pandas, openpyxl, xlrd):
    python3 scripts/build_state_data.py            # downloads fresh source files
    python3 scripts/build_state_data.py --cached   # reuse files in scripts/.cache

Solar output comes from scripts/solar_model.py (run it first). The PVWatts web
API needs a personal key for more than a handful of calls, so we run the same
PVWatts v8 engine locally; scripts/pvwatts-results.json keeps the API results
we could fetch, used as a cross-check.
"""
import datetime as dt
import html
import json
import os
import re
import sys
import urllib.request

import openpyxl
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".cache")
OUT = os.path.join(ROOT, "src", "data", "state-energy.json")
EV_OUT = os.path.join(ROOT, "src", "data", "epa-evs.json")
PV_LOCATIONS = os.path.join(HERE, "pvwatts-locations.json")
UA = {"User-Agent": "Mozilla/5.0 (SparkPowered data build; +https://sparkpowered.com/methodology)"}

URLS = {
    "eia_price_month": "https://www.eia.gov/electricity/monthly/xls/table_5_06_a.xlsx",
    "eia_price_ytd": "https://www.eia.gov/electricity/monthly/xls/table_5_06_b.xlsx",
    "eia_bill": "https://www.eia.gov/electricity/sales_revenue_price/xls/table_5A.xlsx",
    "eia_gas": "https://www.eia.gov/dnav/pet/xls/PET_PRI_GND_A_EPMR_PTE_DPGAL_W.xls",
    "afdc_states": "https://afdc.energy.gov/stations/states",
    "fe_vehicles": "https://www.fueleconomy.gov/feg/epadata/vehicles.csv",
}

STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
    "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon",
    "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia",
    "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}

# EIA's Petroleum Administration for Defense District (PADD) definitions. Used
# only where EIA does not publish a state-level weekly gasoline price.
PADD = {
    "New England (PADD 1A)": ["CT", "ME", "MA", "NH", "RI", "VT"],
    "Central Atlantic (PADD 1B)": ["DE", "DC", "MD", "NJ", "NY", "PA"],
    "Lower Atlantic (PADD 1C)": ["FL", "GA", "NC", "SC", "VA", "WV"],
    "Midwest": ["IL", "IN", "IA", "KS", "KY", "MI", "MN", "MO", "NE", "ND", "SD", "OH", "OK", "TN", "WI"],
    "Gulf Coast": ["AL", "AR", "LA", "MS", "NM", "TX"],
    "Rocky Mountain": ["CO", "ID", "MT", "UT", "WY"],
    "West Coast (PADD 5) Except California": ["AK", "AZ", "HI", "NV", "OR", "WA"],
}
GAS_STATE_SERIES = {"CA": "California", "CO": "Colorado", "FL": "Florida", "MA": "Massachusetts",
                    "MN": "Minnesota", "NY": "New York", "OH": "Ohio", "TX": "Texas", "WA": "Washington"}

# Three fueleconomy.gov configurations used as worked examples on every page.
REFERENCE_EVS = [
    {"key": "efficient", "id": 50251, "label": "Efficient sedan"},
    {"key": "typical", "id": 49953, "label": "Compact SUV"},
    {"key": "large", "id": 49638, "label": "Full-size pickup"},
]

# EPA Automotive Trends Report 2025 (model year 2024 data): average new vehicle
# real-world fuel economy 27.2 mpg, 1.7 mpg lower without BEVs and PHEVs.
GAS_MPG = round(27.2 - 1.7, 1)


def fetch(name, cached):
    os.makedirs(CACHE, exist_ok=True)
    url = URLS[name]
    path = os.path.join(CACHE, name + os.path.splitext(url.split("?")[0])[1].replace("/states", ".html"))
    if not path.endswith((".xlsx", ".xls", ".csv", ".html")):
        path += ".html"
    if not (cached and os.path.exists(path)):
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def eia_state_rows(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    title = " ".join(str(c) for c in rows[1] if c)
    header = rows[3]
    data = {}
    for r in rows[4:]:
        if r[0] in STATES.values() or r[0] == "U.S. Total":
            data[r[0]] = r
    return title, header, data


def parse_afdc(path):
    s = open(path, encoding="utf-8").read()
    t = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "|", s)))
    out = {}
    names = sorted(STATES.values(), key=len, reverse=True)
    for name in names:
        # | Name| |bio| |cng| |e85| |locations | ports|l1 | l2 | dc|
        m = re.search(r"\|" + re.escape(name) + r"\|[ |]*([\d,]+)\|[ |]*([\d,]+)\|[ |]*([\d,]+)\|[ |]*([\d,]+) \| ([\d,]+)\|([\d,]+) \| ([\d,]+) \| ([\d,]+)\|", t)
        if not m:
            raise SystemExit(f"AFDC parse failed for {name}")
        n = [int(x.replace(",", "")) for x in m.groups()]
        out[name] = {"locations": n[3], "ports": n[4], "level1": n[5], "level2": n[6], "dcFast": n[7]}
    return out


def solar_results():
    """Output of scripts/solar_model.py (PVWatts v8 via PySAM on NASA POWER weather)."""
    path = os.path.join(HERE, "solar-model-results.json")
    res = json.load(open(path))
    missing = [st for st in STATES if st not in res]
    if missing:
        raise SystemExit(f"Run scripts/solar_model.py first; missing {missing}")
    return res


def main():
    cached = "--cached" in sys.argv
    today = dt.date.today().isoformat()

    # ── Electricity prices ──
    t_m, h_m, month = eia_state_rows(fetch("eia_price_month", cached))
    t_y, h_y, ytd = eia_state_rows(fetch("eia_price_ytd", cached))
    month_label, ytd_label, ytd_prev_label = h_m[1], h_y[1], h_y[2]

    # ── Usage and bills ──
    wb = openpyxl.load_workbook(fetch("eia_bill", cached), data_only=True)
    ws = wb.active
    bill_rows = list(ws.iter_rows(values_only=True))
    bill_title = bill_rows[0][0]
    bills = {r[0]: r for r in bill_rows[3:] if r[0] in STATES.values() or r[0] == "U.S. Total"}

    # ── Gasoline ──
    gx = pd.ExcelFile(fetch("eia_gas", cached))
    gas_series = {}
    gas_week = None
    for sheet in gx.sheet_names[1:]:
        df = pd.read_excel(gx, sheet, header=2)
        last = df.dropna(how="all", subset=df.columns[1:]).iloc[-1]
        gas_week = last["Date"].date().isoformat()
        for c in df.columns[1:]:
            label = c.replace("Weekly ", "").replace(" Regular All Formulations Retail Gasoline Prices  (Dollars per Gallon)", "").strip()
            gas_series[label] = float(last[c])

    def gas_for(abbr):
        if abbr in GAS_STATE_SERIES:
            return gas_series[GAS_STATE_SERIES[abbr]], GAS_STATE_SERIES[abbr], "state"
        for region, members in PADD.items():
            if abbr in members:
                return gas_series[region], region, "region"
        raise KeyError(abbr)

    # ── Charging stations ──
    afdc = parse_afdc(fetch("afdc_states", cached))

    # ── Vehicles ──
    vdf = pd.read_csv(fetch("fe_vehicles", cached), low_memory=False)
    evs = vdf[(vdf.atvType == "EV") & (vdf.year >= 2026)].copy()
    refs = []
    for r in REFERENCE_EVS:
        row = vdf[vdf.id == r["id"]].iloc[0]
        refs.append({"key": r["key"], "label": r["label"], "id": int(row.id), "year": int(row.year),
                     "make": row.make, "model": row.model, "rangeMiles": int(row.range),
                     "kwhPer100mi": round(float(row.combE), 1)})
    ev_list = [{"id": int(r.id), "year": int(r.year), "make": r.make, "model": r.model,
                "baseModel": r.baseModel, "class": r.VClass, "rangeMiles": int(r.range),
                "kwhPer100mi": round(float(r.combE), 1)}
               for r in evs.sort_values(["make", "baseModel", "year", "model"]).itertuples()]

    # ── Solar ──
    pv = solar_results()

    states = []
    for abbr, name in STATES.items():
        g, g_area, g_level = gas_for(abbr)
        b = bills[name]
        p = pv[abbr]
        states.append({
            "abbr": abbr,
            "name": name,
            "slug": name.lower().replace(" ", "-"),
            "electricity": {
                "residentialCentsPerKwhYtd": ytd[name][1],
                "residentialCentsPerKwhYtdPrevYear": ytd[name][2],
                "residentialCentsPerKwhLatestMonth": month[name][1],
            },
            "usage": {
                "avgMonthlyKwh": round(b[2], 1),
                "avgMonthlyBillUsd": round(b[4], 2),
                "avgPriceCentsPerKwh": round(b[3], 2),
                "customers": int(b[1]),
            },
            "gasoline": {"usdPerGallon": g, "area": g_area, "level": g_level},
            "charging": afdc[name],
            "solar": {
                "city": p["city"],
                "kwhPerKwYear": round(p["ac_annual"], 1),
                "monthlyKwhPerKw": [round(x, 1) for x in p["ac_monthly"]],
                "solarRadiationKwhM2Day": round(p["solrad_annual"], 2),
            },
        })

    us_b = bills["U.S. Total"]
    out = {
        "generated": today,
        "national": {
            "residentialCentsPerKwhYtd": ytd["U.S. Total"][1],
            "residentialCentsPerKwhYtdPrevYear": ytd["U.S. Total"][2],
            "residentialCentsPerKwhLatestMonth": month["U.S. Total"][1],
            "avgMonthlyKwh": round(us_b[2], 1),
            "avgMonthlyBillUsd": round(us_b[4], 2),
            "gasolineUsdPerGallon": gas_series["U.S."],
            "gasMpg": GAS_MPG,
        },
        "referenceEvs": refs,
        "sources": {
            "electricityPrice": {
                "name": "U.S. Energy Information Administration, Electric Power Monthly, Tables 5.6.A and 5.6.B",
                "url": "https://www.eia.gov/electricity/monthly/",
                "period": f"{ytd_label} (year to date); latest month {month_label}",
                "ytdLabel": ytd_label, "ytdPrevLabel": ytd_prev_label, "monthLabel": month_label,
                "note": "Average revenue per kWh across all residential customers, including fixed charges spread over usage. Preliminary estimates.",
                "retrieved": today,
            },
            "usage": {
                "name": f"U.S. Energy Information Administration, {bill_title}",
                "url": "https://www.eia.gov/electricity/sales_revenue_price/",
                "period": "2024 (annual)",
                "retrieved": today,
            },
            "gasoline": {
                "name": "U.S. Energy Information Administration, Weekly Retail Gasoline and Diesel Prices (regular, all formulations)",
                "url": "https://www.eia.gov/petroleum/gasdiesel/",
                "period": f"week of {gas_week}",
                "retrieved": today,
            },
            "charging": {
                "name": "U.S. Department of Energy, Alternative Fuels Data Center, Alternative Fueling Station Counts by State",
                "url": "https://afdc.energy.gov/stations/states",
                "period": f"snapshot {today} (public stations, currently available)",
                "retrieved": today,
            },
            "solar": {
                "name": "PVWatts v8 solar model (National Laboratory of the Rockies, formerly NREL, run via its PySAM package) on NASA POWER hourly weather",
                "url": "https://pvwatts.nlr.gov/",
                "period": "average of 2015-2024 hourly weather",
                "assumptions": "1 kW DC fixed roof mount, 20 degree tilt, facing south (180 degrees), standard module, 14% system losses, 96% inverter efficiency, DC/AC ratio 1.2 (PVWatts defaults except tilt). Checked against the PVWatts web API for eight states: within 8%, 3% on average.",
                "weatherUrl": "https://power.larc.nasa.gov/",
                "retrieved": today,
            },
            "vehicles": {
                "name": "U.S. EPA and DOE, fueleconomy.gov vehicle data (combined kWh/100 mi, includes charging losses)",
                "url": "https://www.fueleconomy.gov/feg/download.shtml",
                "period": "model years 2026-2027",
                "retrieved": today,
            },
            "gasMpg": {
                "name": "U.S. EPA, 2025 Automotive Trends Report (model year 2024 data)",
                "url": "https://www.epa.gov/automotive-trends/highlights-automotive-trends-report",
                "note": "Average new-vehicle real-world fuel economy was 27.2 mpg, and 1.7 mpg lower without battery-electric and plug-in hybrid vehicles; we use 25.5 mpg for a typical new gasoline vehicle.",
                "retrieved": today,
            },
        },
        "states": states,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w"), indent=1)
    json.dump({"generated": today, "source": out["sources"]["vehicles"], "vehicles": ev_list}, open(EV_OUT, "w"), indent=0)
    print("wrote", OUT, len(states), "states;", EV_OUT, len(ev_list), "vehicles")


if __name__ == "__main__":
    main()
