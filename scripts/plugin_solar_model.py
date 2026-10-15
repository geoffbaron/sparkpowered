#!/usr/bin/env python3
"""
Modeled output of a plug-in ("balcony") solar kit in each state.

Same engine and weather as scripts/solar_model.py (PVWatts v8 via PySAM, ten
years of hourly NASA POWER weather for each state's reference city), but with
the mounting positions plug-in kits actually get:

  tilted     - panels on a stand or flat roof, facing south at a 30 degree tilt
  vertical_s - panels hung flat on a south-facing balcony railing or wall (90 degrees)
  vertical_ew- the average of the same vertical panel facing east and facing west

PVWatts defaults otherwise (14% system losses, 96% inverter efficiency), with a
DC-to-AC ratio of 1.0 because plug-in kits pair panels with a microinverter of
about the same rating. Output is AC kWh per year per 1 kW of panels; multiply
by the kit's panel kW. Results are written to src/data/plugin-solar-model.json.

Usage: python3 scripts/plugin_solar_model.py   (needs nrel-pysam and the
weather cache that solar_model.py downloads to scripts/.cache/power)
"""
import json
import os

import PySAM.Pvwattsv8 as pv

from solar_model import LOCS, TZ, weather

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "src", "data", "plugin-solar-model.json")

SCENARIOS = {
    "tilted": [(30, 180)],
    "vertical_s": [(90, 180)],
    "vertical_ew": [(90, 90), (90, 270)],
}


def run(rows, lat, lon, tz, elev, tilt, azimuth):
    rows = [r for r in rows if not (r["MO"] == "2" and r["DY"] == "29")]
    clean = lambda v: max(0.0, float(v)) if float(v) > -900 else 0.0
    res = {
        "lat": lat, "lon": lon, "tz": tz, "elev": elev,
        "year": [int(r["YEAR"]) for r in rows], "month": [int(r["MO"]) for r in rows],
        "day": [int(r["DY"]) for r in rows], "hour": [int(r["HR"]) for r in rows], "minute": [30] * len(rows),
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
    sd.dc_ac_ratio = 1.0
    sd.inv_eff = 96.0
    sd.losses = 14.0
    sd.array_type = 0  # fixed open rack: free-standing or railing-mounted, air on both sides
    sd.tilt = tilt
    sd.azimuth = azimuth
    sd.gcr = 0.4
    m.Lifetime.analysis_period = 1
    m.Lifetime.system_use_lifetime_output = 0
    m.execute()
    return m.Outputs.ac_annual, list(m.Outputs.ac_monthly)


def main():
    out = {"generated_with": "PVWatts v8 (PySAM), NASA POWER hourly weather 2015-2024", "states": {}}
    for st, (city, lat, lon) in LOCS.items():
        elev, rows = weather(st, lat, lon)
        years = sorted({int(r["YEAR"]) for r in rows})
        entry = {"city": city}
        for name, orients in SCENARIOS.items():
            annual, monthly = [], [[0.0] * 12 for _ in years]
            for yi, y in enumerate(years):
                yrows = [r for r in rows if int(r["YEAR"]) == y]
                a_sum, m_sum = 0.0, [0.0] * 12
                for tilt, az in orients:
                    a, mo = run(yrows, lat, lon, TZ[st], elev, tilt, az)
                    a_sum += a / len(orients)
                    m_sum = [x + v / len(orients) for x, v in zip(m_sum, mo)]
                annual.append(a_sum)
                monthly[yi] = m_sum
            entry[name] = {
                "kwhPerKwYear": round(sum(annual) / len(annual), 1),
                "monthlyKwhPerKw": [round(sum(m[i] for m in monthly) / len(monthly), 1) for i in range(12)],
            }
        out["states"][st] = entry
        print(st, {k: entry[k]["kwhPerKwYear"] for k in SCENARIOS}, flush=True)
    with open(OUT, "w") as f:
        json.dump(out, f, indent=1)


if __name__ == "__main__":
    main()
