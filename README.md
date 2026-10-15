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

Refresh monthly after EIA publishes the Electric Power Monthly, then commit the JSON. Sources and
formulas are documented on `/methodology`.

## Environment variables (Railway)

- `ANTHROPIC_API_KEY` — daily refresh of the EV Finder and Battery Sizer product lists (falls back to built-in lists)
- `ADMIN_PASSWORD` — `/admin` dashboard
- `UMAMI_API_KEY` — analytics on the admin dashboard
