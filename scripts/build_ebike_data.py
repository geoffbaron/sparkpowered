"""Copy the e-bike models our pages use from the researched spec file into
src/data/ebikes.json, unchanged. Specs were read on each maker's own US site
(readDate in the source); re-run after re-checking prices.

  python3 scripts/build_ebike_data.py ~/Grant/marketing/sparkpowered-ebikes/specs.json
"""
import json, re, sys

src = json.load(open(sys.argv[1]))
USE = {
    "himiway": ["Himiway D5 2.0 eBike", "Himiway D5 2.0 ST eBike", "Himiway A7 Pro Commuter eBike", "C3 Cargo Ebike"],
    "engwe": ["ENGWE EP-2 3.0", "ENGWE L20 3.0", "ENGWE L20 2.0", "ENGWE E26 3.0"],
    "kingbull": ["Kingbull Trekker", "Kingbull Jumper Go", "Kingbull EX Titan", "Kingbull Voyager 2.0",
                 "Kingbull Dual Battery Voyager 2.0", "Kingbull Verve", "Kingbull Literider 2.0",
                 "Kingbull Discover 2.0", "Kingbull Discover ST 2.0"],
}
def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
out = []
for brand, names in USE.items():
    by = {m["model"]: m for m in src["brands"][brand]}
    for n in names:
        m = dict(by[n])
        m["brand"] = brand
        m["id"] = slug(n if n.lower().startswith(brand) else f"{brand} {n}")
        out.append(m)
alts = {k: v["alternative"] for k, v in src["categories"].items()}
json.dump({"retrieved": src["readDate"], "bikes": out, "alternatives": alts}, open("src/data/ebikes.json", "w"), indent=1)
print(len(out), "bikes")
