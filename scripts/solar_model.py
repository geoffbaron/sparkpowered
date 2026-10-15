#!/usr/bin/env python3
"""
Modeled solar output per kW for each state's reference city.

Runs NREL's PVWatts v8 model (the same engine behind the PVWatts web
calculator, via the official PySAM package) on ten years of hourly weather
from NASA's POWER project (2015-2024), using PVWatts' default settings except
a 20-degree tilt. We use NASA POWER because the NSRDB/PVWatts web API needs a
personal API key; scripts/pvwatts-results.json holds PVWatts API results for
the states we could fetch, which this script reports as a cross-check.

Usage: python3 scripts/solar_model.py   (needs: pip install nrel-pysam)
Writes scripts/solar-model-results.json
"""
import csv
import io
import json
import os
import time
import urllib.request

import PySAM.Pvwattsv8 as pv

HERE = os.path.dirname(os.path.abspath(__file__))
LOCS = json.load(open(os.path.join(HERE, "pvwatts-locations.json")))
OUT = os.path.join(HERE, "solar-model-results.json")
CACHE = os.path.join(HERE, ".cache", "power")
START, END = 2015, 2024
PARAMS = "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF,T2M,WS10M"
TZ = {  # standard-time UTC offsets for the reference cities
    "AL": -6, "AK": -9, "AZ": -7, "AR": -6, "CA": -8, "CO": -7, "CT": -5, "DE": -5, "DC": -5, "FL": -5,
    "GA": -5, "HI": -10, "ID": -7, "IL": -6, "IN": -5, "IA": -6, "KS": -6, "KY": -5, "LA": -6, "ME": -5,
    "MD": -5, "MA": -5, "MI": -5, "MN": -6, "MS": -6, "MO": -6, "MT": -7, "NE": -6, "NV": -8, "NH": -5,
    "NJ": -5, "NM": -7, "NY": -5, "NC": -5, "ND": -6, "OH": -5, "OK": -6, "OR": -8, "PA": -5, "RI": -5,
    "SC": -5, "SD": -6, "TN": -6, "TX": -6, "UT": -7, "VT": -5, "VA": -5, "WA": -8, "WV": -5, "WI": -6, "WY": -7,
}


def weather(st, lat, lon):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{st}.csv")
    if not os.path.exists(path):
        url = (f"https://power.larc.nasa.gov/api/temporal/hourly/point?parameters={PARAMS}&community=RE"
               f"&longitude={lon}&latitude={lat}&start={START}0101&end={END}1231&format=CSV&time-standard=LST")
        for attempt in range(5):
            try:
                with urllib.request.urlopen(url, timeout=300) as r, open(path, "wb") as f:
                    f.write(r.read())
                break
            except Exception as e:  # noqa: BLE001
                print(st, "retry", e, flush=True)
                time.sleep(20)
    text = open(path).read()
    head, body = text.split("-END HEADER-\n", 1)
    elev = float(head.split("= ")[1].split(" meters")[0]) if "= " in head else 0.0
    rows = list(csv.DictReader(io.StringIO(body)))
    return elev, rows


def run_year(rows, lat, lon, tz, elev):
    rows = [r for r in rows if not (r["MO"] == "2" and r["DY"] == "29")]
    assert len(rows) == 8760, len(rows)
    clean = lambda v: max(0.0, float(v)) if float(v) > -900 else 0.0
    res = {
        "lat": lat, "lon": lon, "tz": tz, "elev": elev,
        "year": [int(r["YEAR"]) for r in rows], "month": [int(r["MO"]) for r in rows],
        "day": [int(r["DY"]) for r in rows], "hour": [int(r["HR"]) for r in rows], "minute": [30] * 8760,
        "gh": [clean(r["ALLSKY_SFC_SW_DWN"]) for r in rows],
        "dn": [clean(r["ALLSKY_SFC_SW_DNI"]) for r in rows],
        "df": [clean(r["ALLSKY_SFC_SW_DIFF"]) for r in rows],
        "tdry": [float(r["T2M"]) if float(r["T2M"]) > -900 else 15.0 for r in rows],
        "wspd": [float(r["WS10M"]) if float(r["WS10M"]) > -900 else 2.0 for r in rows],
    }
    m = pv.default("PVWattsNone")
    m.SolarResource.solar_resource_data = res
    sd = m.SystemDesign
    sd.system_capacity = 1.0
    sd.dc_ac_ratio = 1.2
    sd.inv_eff = 96.0
    sd.losses = 14.0
    sd.array_type = 1  # fixed roof mount
    sd.tilt = 20
    sd.azimuth = 180
    sd.gcr = 0.4
    m.Lifetime.analysis_period = 1
    m.Lifetime.system_use_lifetime_output = 0
    m.execute()
    return m.Outputs.ac_annual, list(m.Outputs.ac_monthly), m.Outputs.solrad_annual


def main():
    out = json.load(open(OUT)) if os.path.exists(OUT) else {}
    for st, (city, lat, lon) in LOCS.items():
        if st in out:
            continue
        elev, rows = weather(st, lat, lon)
        years = sorted({int(r["YEAR"]) for r in rows})
        annual, monthly, rad = [], [], []
        for y in years:
            a, mo, s = run_year([r for r in rows if int(r["YEAR"]) == y], lat, lon, TZ[st], elev)
            annual.append(a); monthly.append(mo); rad.append(s)
        out[st] = {
            "city": city, "lat": lat, "lon": lon,
            "ac_annual": sum(annual) / len(annual),
            "ac_monthly": [sum(m[i] for m in monthly) / len(monthly) for i in range(12)],
            "solrad_annual": sum(rad) / len(rad),
            "years": f"{years[0]}-{years[-1]}",
            "annual_by_year": {str(y): round(a, 1) for y, a in zip(years, annual)},
        }
        json.dump(out, open(OUT, "w"), indent=1)
        print(st, round(out[st]["ac_annual"]), flush=True)
    api = json.load(open(os.path.join(HERE, "pvwatts-results.json")))
    for st, v in api.items():
        if st in out:
            print(f"check {st}: model {out[st]['ac_annual']:.0f} vs PVWatts API (NSRDB TMY) {v['ac_annual']:.0f} "
                  f"({(out[st]['ac_annual'] / v['ac_annual'] - 1) * 100:+.1f}%)")


if __name__ == "__main__":
    main()
