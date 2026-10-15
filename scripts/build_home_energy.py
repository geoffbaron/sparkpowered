#!/usr/bin/env python3
"""
Rebuilds src/data/home-energy.json: the per-state household figures behind the
Go Electric planner (/go-electric). Every number comes from EIA:

  - Residential natural gas price by state, latest full year
    (EIA Natural Gas Annual / Natural Gas Monthly, series N3010xx2).
  - How much energy the average home in each state uses for space heating,
    water heating and cooking, and how much electricity its fridges use
    (EIA Residential Energy Consumption Survey 2020, state tables CE4.6 and CE5.4).

Usage:
    python3 scripts/build_home_energy.py            # downloads fresh source files
    python3 scripts/build_home_energy.py --cached   # reuse files in scripts/.cache
"""
import datetime as dt
import json
import os
import sys
import urllib.request

import openpyxl
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".cache")
OUT = os.path.join(ROOT, "src", "data", "home-energy.json")
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36"}

RECS = "https://www.eia.gov/consumption/residential/data/2020/state/xls/"
URLS = {
    "eia_ng_res.xls": "https://www.eia.gov/dnav/ng/xls/NG_PRI_SUM_A_EPG0_PRS_DMCF_A.xls",
    "recs_ce4.6.el.st.xlsx": RECS + "ce4.6.el.st.xlsx",
    "recs_ce5.4.st.xlsx": RECS + "ce5.4.st.xlsx",
}

sys.path.insert(0, HERE)
from build_state_data import STATES  # noqa: E402

NAME_TO_ABBR = {v: k for k, v in STATES.items()}


def fetch(name, cached):
    path = os.path.join(CACHE, name)
    if not (cached and os.path.exists(path)):
        os.makedirs(CACHE, exist_ok=True)
        req = urllib.request.Request(URLS[name], headers=UA)
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def num(v):
    return float(v) if isinstance(v, (int, float)) else None


def recs_rows(path, sheet):
    ws = openpyxl.load_workbook(path, data_only=True)[sheet]
    out = {}
    for r in ws.iter_rows(values_only=True):
        if not isinstance(r[0], str):
            continue
        label = r[0].strip()
        if label == "All homes":
            out["US"] = r
        elif label in NAME_TO_ABBR:
            out[NAME_TO_ABBR[label]] = r
    return out


def main():
    cached = "--cached" in sys.argv

    # Natural gas: dollars per thousand cubic feet, annual, by state.
    ng = pd.read_excel(fetch("eia_ng_res.xls", cached), sheet_name="Data 1", header=2)
    ng = ng.dropna(subset=["Date"]).sort_values("Date")
    year = None
    gas = {}
    for col in ng.columns[1:]:
        name = col.split(" Price of Natural Gas")[0]
        abbr = "US" if name == "U.S." else NAME_TO_ABBR.get(name)
        if not abbr:
            continue
        series = ng[["Date", col]].dropna()
        last = series.iloc[-1]
        gas[abbr] = {"usdPerMcf": round(float(last[col]), 2), "year": int(pd.Timestamp(last["Date"]).year)}
        if abbr == "US":
            year = gas[abbr]["year"]

    el = recs_rows(fetch("recs_ce4.6.el.st.xlsx", cached), "physical units")
    fuels = recs_rows(fetch("recs_ce5.4.st.xlsx", cached), "Btu")

    def household(abbr):
        e, f = el[abbr], fuels[abbr]
        return {
            # kWh per household that uses electricity for the end use
            "elecWaterHeatKwh": num(e[4]),
            "fridgeKwh": num(e[6]),
            # million Btu per household that uses natural gas for the end use
            "gasSpaceHeatMmbtu": num(f[1]),
            "gasWaterHeatMmbtu": num(f[2]),
            "gasCookingMmbtu": num(f[4]),
        }

    states = {}
    for abbr in STATES:
        g = gas.get(abbr)
        states[abbr] = {
            "gasUsdPerMcf": g["usdPerMcf"] if g else None,
            "gasYear": g["year"] if g else None,
            **household(abbr),
        }
    data = {
        "generated": dt.date.today().isoformat(),
        "national": {"gasUsdPerMcf": gas["US"]["usdPerMcf"], "gasYear": year, **household("US")},
        "sources": {
            "gasPrice": {
                "name": "U.S. Energy Information Administration, Natural Gas Prices: price delivered to residential consumers",
                "url": "https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_DMcf_a.htm",
                "period": f"{year} annual average",
                "retrieved": dt.date.today().isoformat(),
            },
            "recs": {
                "name": "U.S. Energy Information Administration, 2020 Residential Energy Consumption Survey (RECS), state tables CE4.6.EL.ST and CE5.4.ST",
                "url": "https://www.eia.gov/consumption/residential/data/2020/index.php?view=state",
                "period": "2020 (released June 2023)",
                "note": "Average per household that uses that fuel for that end use. 'Q' (too few samples) is stored as null and the national average is used instead.",
                "retrieved": dt.date.today().isoformat(),
            },
        },
        "states": states,
    }
    with open(OUT, "w") as f:
        json.dump(data, f, indent=1)
        f.write("\n")
    missing = {k: [a for a, s in states.items() if s[k] is None] for k in states["CA"]}
    print("wrote", OUT, "gas year", year, "missing:", {k: v for k, v in missing.items() if v})


if __name__ == "__main__":
    main()
