#!/usr/bin/env python3
"""
Builds the two small data files behind /ev-or-plug-in-hybrid:

  src/data/epa-phevs.json         plug-in hybrids from fueleconomy.gov vehicles.csv
  src/data/state-winter-temps.json  each state's normal December-February
                                     average temperature from NOAA NCEI

Usage (needs Python 3.9+ and pandas):
    python3 scripts/build_phev_data.py            # downloads fresh source files
    python3 scripts/build_phev_data.py --cached   # reuse files in scripts/.cache

Which vehicles.csv columns we use, per the fueleconomy.gov field definitions
(https://www.fueleconomy.gov/feg/ws/index.shtml#vehicle):
  rangeA      EPA range on fuelType2 (electricity): the label's electric range
  rangeCityA, rangeHwyA   city and highway charge-depleting range
  combE       combined kWh/100 mi while running on the battery (charge depleting)
  comb08      combined mpg on fuelType1 (gasoline) once the battery is used up
  combinedUF  EPA utility factor: share of miles the label assumes are electric

Every recent PHEV carries phevBlended = True, so the flag does not separate
true "electric until empty" cars from ones that burn gasoline while the battery
is still charged. Instead we compare rangeA with the charge-depleting range:
where they disagree by more than 25% (for example the AMG E Performance models,
rangeA of 1 mile but about 8 miles charge depleting) the car burns gasoline in
its "electric" range, and combE then is not an electric-only figure, so we
leave it out. We also leave out cars under 15 miles of electric range, which
are performance cars that a "should I plug in?" tool has nothing to say about.
"""
import datetime as dt
import json
import os
import sys
import urllib.request

import pandas as pd

from build_state_data import STATES, fetch

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".cache")
PHEV_OUT = os.path.join(ROOT, "src", "data", "epa-phevs.json")
TEMP_OUT = os.path.join(ROOT, "src", "data", "state-winter-temps.json")
UA = {"User-Agent": "Mozilla/5.0 (SparkPowered data build; +https://sparkpowered.com/methodology)"}

MIN_YEAR = 2025
MIN_RANGE = 15
MAX_RANGE_MISMATCH = 0.25
# Typical PHEV the tool starts on: the best-selling plug-in hybrid SUV body
# style with a mainstream electric range. Changing it is a content decision.
TYPICAL_PHEV = {"make": "Toyota", "baseModel": "RAV4"}

# NOAA Climate at a Glance statewide codes (contiguous states 1-48 in
# alphabetical order without AK and HI; Alaska is 50; Hawaii is not published).
NOAA_CODES = {
    "AL": 1, "AZ": 2, "AR": 3, "CA": 4, "CO": 5, "CT": 6, "DE": 7, "FL": 8, "GA": 9, "ID": 10,
    "IL": 11, "IN": 12, "IA": 13, "KS": 14, "KY": 15, "LA": 16, "ME": 17, "MD": 18, "MA": 19,
    "MI": 20, "MN": 21, "MS": 22, "MO": 23, "MT": 24, "NE": 25, "NV": 26, "NH": 27, "NJ": 28,
    "NM": 29, "NY": 30, "NC": 31, "ND": 32, "OH": 33, "OK": 34, "OR": 35, "PA": 36, "RI": 37,
    "SC": 38, "SD": 39, "TN": 40, "TX": 41, "UT": 42, "VT": 43, "VA": 44, "WA": 45, "WV": 46,
    "WI": 47, "WY": 48, "AK": 50,
}
# DC has no statewide series; it sits inside Maryland's climate divisions.
NOAA_STAND_IN = {"DC": "MD"}
NOAA_URL = "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/statewide/time-series/{code}/tavg/3/2/1991-2020.csv"


def noaa_winter(code, cached):
    """Mean of the 1991-2020 December-February average temperatures (deg F)."""
    path = os.path.join(CACHE, f"noaa_djf_{code}.csv")
    if not (cached and os.path.exists(path)):
        req = urllib.request.Request(NOAA_URL.format(code=code), headers=UA)
        with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
    lines = open(path).read().splitlines()
    title = next(l for l in lines if "December-February" in l)
    vals = [float(l.split(",")[1]) for l in lines if l[:1].isdigit()]
    assert len(vals) == 30, (code, len(vals))
    return title, sum(vals) / len(vals)


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def main():
    cached = "--cached" in sys.argv
    today = dt.date.today().isoformat()
    os.makedirs(CACHE, exist_ok=True)

    # ── Plug-in hybrids ──
    vdf = pd.read_csv(fetch("fe_vehicles", cached), low_memory=False)
    p = vdf[(vdf.atvType == "Plug-in Hybrid") & (vdf.year >= MIN_YEAR)].copy()
    keep, dropped = {}, []
    for r in p.sort_values(["make", "baseModel", "model", "year"]).itertuples():
        rng, city, hwy = num(r.rangeA), num(r.rangeCityA), num(r.rangeHwyA)
        if not rng or rng < MIN_RANGE:
            dropped.append(f"{r.year} {r.make} {r.model}: electric range {rng}")
            continue
        cd = (city + hwy) / 2 if city and hwy else rng
        if abs(cd - rng) / rng > MAX_RANGE_MISMATCH:
            dropped.append(f"{r.year} {r.make} {r.model}: rangeA {rng} vs charge-depleting {cd:.0f} (blended)")
            continue
        # newest model year of each make + model wins
        keep[(r.make, r.model)] = {
            "id": int(r.id), "year": int(r.year), "make": r.make, "model": r.model,
            "baseModel": r.baseModel, "class": r.VClass,
            "electricRangeMiles": int(round(rng)),
            "kwhPer100mi": round(float(r.combE), 1),
            "gasMpg": int(r.comb08),
            "labelElectricShare": round(float(r.combinedUF), 3),
            "premium": "Premium" in str(r.fuelType1),
        }
    phevs = sorted(keep.values(), key=lambda v: (v["make"], v["model"]))
    typical = [v for v in phevs if v["make"] == TYPICAL_PHEV["make"] and v["baseModel"] == TYPICAL_PHEV["baseModel"]]
    assert typical, "typical PHEV missing"
    out = {
        "generated": today,
        "source": {
            "name": "U.S. EPA and DOE, fueleconomy.gov vehicle data (plug-in hybrids: electric range, kWh/100 mi on battery, mpg on gasoline)",
            "url": "https://www.fueleconomy.gov/feg/download.shtml",
            "period": f"model years {MIN_YEAR}-{int(p.year.max())}, newest year of each model",
            "note": f"Excludes models under {MIN_RANGE} miles of electric range and blended models whose label range and charge-depleting range differ by more than {int(MAX_RANGE_MISMATCH * 100)}%.",
            "retrieved": today,
        },
        "typicalId": typical[-1]["id"],
        "vehicles": phevs,
    }
    json.dump(out, open(PHEV_OUT, "w"), indent=0)

    # ── Winter temperatures ──
    temps = {}
    for abbr, name in STATES.items():
        src = NOAA_STAND_IN.get(abbr, abbr)
        code = NOAA_CODES.get(src)
        if code is None:
            continue
        title, f = noaa_winter(code, cached)
        assert STATES[src] in title, (abbr, title)
        temps[abbr] = round(f, 1)
    json.dump({
        "generated": today,
        "source": {
            "name": "NOAA National Centers for Environmental Information, Climate at a Glance: statewide December-February average temperature",
            "url": "https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/statewide/time-series",
            "period": "1991-2020 normal (mean of 30 winters)",
            "note": "DC uses Maryland's statewide figure; NOAA publishes no statewide series for Hawaii.",
            "retrieved": today,
        },
        "winterTempF": temps,
    }, open(TEMP_OUT, "w"), indent=0)
    print("wrote", PHEV_OUT, len(phevs), "PHEVs; dropped", len(dropped))
    for d in dropped:
        print("  dropped", d)
    print("wrote", TEMP_OUT, len(temps), "states")


if __name__ == "__main__":
    main()
