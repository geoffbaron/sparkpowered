"use client";

import { useState } from "react";
import { pillClass } from "@/components/guide-ui";
import {
  GOAL_DAYS,
  MIN_DAYS,
  compareKit,
  foodNeeded,
  type Activity,
  type FoodPerson,
  type PregnancyStage,
  type Sex,
} from "@/lib/prep";

const n0 = (n: number) => Math.round(n).toLocaleString("en-US");
const usd2 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STAGES: { v: PregnancyStage; label: string }[] = [
  { v: "none", label: "Not pregnant or nursing" },
  { v: "trimester-1", label: "Pregnant, 1st trimester" },
  { v: "trimester-2", label: "Pregnant, 2nd trimester" },
  { v: "trimester-3", label: "Pregnant, 3rd trimester" },
  { v: "lactation-1", label: "Nursing, first 6 months" },
  { v: "lactation-2", label: "Nursing, second 6 months" },
];

const ACTIVITIES: { v: Activity; label: string }[] = [
  { v: "sedentary", label: "Sedentary" },
  { v: "moderate", label: "Moderately active" },
  { v: "active", label: "Active" },
];

/** Household x days x Dietary Guidelines calorie needs -> calories to store; then compare a kit on real calories. */
export default function FoodCalc() {
  const [people, setPeople] = useState<FoodPerson[]>([
    { age: 40, sex: "male" },
    { age: 40, sex: "female" },
  ]);
  const [days, setDays] = useState(GOAL_DAYS);
  const [activity, setActivity] = useState<Activity>("moderate");
  const [kitCal, setKitCal] = useState(0);
  const [kitPrice, setKitPrice] = useState(0);

  const f = foodNeeded(people, days, activity);
  const kit = compareKit(kitCal, kitPrice, f.daily);
  const update = (i: number, p: Partial<FoodPerson>) => setPeople((ps) => ps.map((x, j) => (j === i ? { ...x, ...p } : x)));

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden grid lg:grid-cols-2" data-testid="food-calc">
        <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/8 space-y-5">
          <fieldset>
            <legend className="font-bold text-ink mb-2">1. Who is in your home (age 2 and up)</legend>
            <ul className="space-y-2">
              {people.map((p, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex items-center gap-1">
                    Age
                    <input
                      type="number"
                      min={2}
                      max={110}
                      value={p.age}
                      onChange={(e) => update(i, { age: Math.max(2, Math.min(110, Math.round(Number(e.target.value)) || 2)) })}
                      className="w-16 rounded-lg border border-black/20 px-2 py-1 tabular-nums"
                      aria-label={`Person ${i + 1} age`}
                    />
                  </label>
                  <select
                    value={p.sex}
                    onChange={(e) => update(i, { sex: e.target.value as Sex, stage: "none" })}
                    className="rounded-lg border border-black/20 px-2 py-1 bg-white"
                    aria-label={`Person ${i + 1} sex`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {p.sex === "female" && p.age >= 12 && (
                    <select
                      value={p.stage ?? "none"}
                      onChange={(e) => update(i, { stage: e.target.value as PregnancyStage })}
                      className="rounded-lg border border-black/20 px-2 py-1 bg-white"
                      aria-label={`Person ${i + 1} pregnancy or nursing`}
                    >
                      {STAGES.map((s) => (
                        <option key={s.v} value={s.v}>{s.label}</option>
                      ))}
                    </select>
                  )}
                  <span className="tabular-nums text-muted">{n0(f.perDay[i] ?? 0)} cal/day</span>
                  {people.length > 1 && (
                    <button type="button" onClick={() => setPeople((ps) => ps.filter((_, j) => j !== i))} className="text-spark-orange underline">
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {people.length < 20 && (
              <button type="button" onClick={() => setPeople((ps) => [...ps, { age: 10, sex: "female" }])} className="mt-3 btn btn-outline text-sm">
                Add a person
              </button>
            )}
            <p className="text-xs text-muted mt-2">Babies under 2 need formula or food chosen with your pediatrician; they are not in this table.</p>
          </fieldset>
          <fieldset>
            <legend className="font-bold text-ink mb-2">2. How active you will be</legend>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map((a) => (
                <button key={a.v} type="button" aria-pressed={activity === a.v} onClick={() => setActivity(a.v)} className={pillClass(activity === a.v)}>
                  {a.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">
              Moderately active is walking about 1.5 to 3 miles a day; active is more than 3 (Dietary Guidelines).
            </p>
          </fieldset>
          <fieldset>
            <legend className="font-bold text-ink mb-2">3. How many days</legend>
            <div className="flex flex-wrap gap-2 items-center">
              {[MIN_DAYS, GOAL_DAYS].map((d) => (
                <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={pillClass(days === d)}>
                  {d} days
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(365, Math.round(Number(e.target.value)) || 1)))}
                className="w-20 rounded-lg border border-black/20 px-2 py-1 tabular-nums"
                aria-label="Number of days"
              />
            </div>
          </fieldset>
        </div>
        <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wide text-spark-amber">Calories to store</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-ink mt-1 tabular-nums" data-testid="food-total">{n0(f.total)}</p>
          <ul className="mt-3 space-y-1 text-sm text-stone-800">
            <li>Your household: <strong>{n0(f.daily)} calories a day</strong></li>
            <li>For <strong>{f.days} days</strong></li>
          </ul>
          <p className="text-xs text-muted mt-3">
            Estimates from the Dietary Guidelines calorie table for a person of average height and healthy weight. Your own needs may
            be higher or lower.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white shadow-sm p-5 sm:p-6" data-testid="kit-compare">
        <h3 className="text-lg font-extrabold text-ink">Check a food kit on real calories</h3>
        <p className="text-sm text-stone-700 mt-1 max-w-3xl">
          Ignore the &quot;servings&quot; and &quot;days of food&quot; on the box. Add up the calories on the Nutrition Facts panels
          (calories per serving x servings, for every pouch), then enter the total and the price.
        </p>
        <div className="mt-4 flex flex-wrap gap-5 items-end">
          <label className="block text-sm" htmlFor="kit-cal">
            <span className="font-bold text-ink">Total calories in the kit</span>
            <input
              id="kit-cal"
              type="number"
              min={0}
              step={100}
              value={kitCal || ""}
              placeholder="e.g. from the label"
              onChange={(e) => setKitCal(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 block w-44 rounded-lg border border-black/20 px-3 py-2 tabular-nums"
            />
          </label>
          <label className="block text-sm" htmlFor="kit-price">
            <span className="font-bold text-ink">Price (USD)</span>
            <input
              id="kit-price"
              type="number"
              min={0}
              step={1}
              value={kitPrice || ""}
              onChange={(e) => setKitPrice(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 block w-32 rounded-lg border border-black/20 px-3 py-2 tabular-nums"
            />
          </label>
        </div>
        <p className="mt-4 text-stone-800" aria-live="polite" data-testid="kit-compare-result">
          {kitCal > 0 ? (
            <>
              Feeds your household for <strong>{kit.days.toFixed(1)} days</strong> at {n0(f.daily)} calories a day
              {kit.usdPer1000 != null && (
                <>
                  , at <strong>{usd2(kit.usdPer1000)} per 1,000 calories</strong>
                </>
              )}
              .
            </>
          ) : (
            <>Enter a kit&apos;s total calories to see how many days it really lasts your household.</>
          )}
        </p>
      </div>
    </div>
  );
}
