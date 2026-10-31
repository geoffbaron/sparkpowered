# Spark Powered

Free EV, solar and home battery calculators with state-by-state data, at https://sparkpowered.com.
Next.js 16 (App Router, Cache Components). Hosted on Railway: every push to `main` deploys to
production automatically.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint
npm test           # unit tests (data integrity, formulas, auth helpers)
npm run build && npm start
npm run test:e2e   # browser checks of the tools; needs Google Chrome and a running server
```

## Data

State figures live in `src/data/state-energy.json` and EPA vehicle data in `src/data/epa-evs.json`.
Both are generated, never hand-edited:

```bash
pip install pandas openpyxl xlrd nrel-pysam
python3 scripts/solar_model.py        # PVWatts v8 model on NASA POWER weather, per state
python3 scripts/build_state_data.py   # EIA prices/usage/gasoline, AFDC chargers, fueleconomy.gov
```

Natural gas prices and household heating, hot water and cooking use by state (`src/data/home-energy.json`, used by the
Go Electric planner at `/go-electric`) come from `python3 scripts/build_home_energy.py` (EIA natural gas prices and the
2020 RECS state tables). Planner assumptions and their sources are in `src/lib/go-electric.ts`; myths and their sources in
`src/data/myths.ts`; home EV chargers in `src/data/chargers.ts`; photos and credits in `src/data/images.ts`.

Plug-in solar output by state (`src/data/plugin-solar-model.json`) comes from
`python3 scripts/plugin_solar_model.py` (same weather cache).

Products, plug-in kits, state plug-in solar laws and comparisons are typed, hand-checked data in
`src/data/products.ts`, `src/data/plugin-solar-law.ts` and `src/data/comparisons.ts`; every entry carries a
source URL and date (enforced by `tests/products.test.ts`). Affiliate links live only in
`src/data/affiliates.ts`.

Refresh monthly after EIA publishes the Electric Power Monthly, then commit the JSON. Sources and
formulas are documented on `/methodology`.

## Environment variables (Railway)

- `ANTHROPIC_API_KEY` — daily refresh of the EV Finder list (falls back to a built-in list)
- `ASK_SPARK_API_KEY` — Ask Spark chat at `/ask` (its own key, with a $20 monthly limit set in the Anthropic Console).
  Unset = the chat shows its resting message and makes no API calls. In-app caps: $20 a month, $2 a day,
  15 questions an hour and 40 a day per visitor. Spend and 30-day anonymous logs live in `ASK_SPARK_DATA_DIR`
  (default: the Railway volume if one is attached, else `.data/ask-spark`, which resets on each deploy).
  Review at `/admin/ask-spark`; first live check in `docs/ask-spark-eval.md`.
- `ADMIN_PASSWORD` — `/admin` dashboard
- `UMAMI_API_KEY` — analytics on the admin dashboard
