/**
 * Durable state for Ask Spark: month-to-date and daily spend, and the
 * anonymous Q&A log. Plain JSON files in one folder:
 *
 *   ASK_SPARK_DATA_DIR if set, else <RAILWAY_VOLUME_MOUNT_PATH>/ask-spark when a
 *   Railway volume is attached, else ./.data/ask-spark.
 *
 * Without a volume, Railway wipes the folder on each deploy, so the in-app
 * spend counter restarts; the Anthropic Console spend limit on Ask Spark's own
 * key is the backstop that cannot reset. Writes go through one promise chain
 * (one Node process serves the site) and land via write-then-rename.
 */

import { mkdir, readFile, readdir, rename, rm, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { LOG_RETENTION_DAYS } from "./config";
import { dayKey, monthKey, type Spend } from "./core";

export interface LogEntry {
  t: string;
  q: string;
  a: string;
  products: string[];
  pages: string[];
  costUsd: number;
  /** "answered" | "refused" (model refusal) | "error" */
  outcome: string;
}

interface SpendFile {
  months: Record<string, number>;
  days: Record<string, number>;
}

export function dataDir(env: NodeJS.ProcessEnv = process.env): string {
  if (env.ASK_SPARK_DATA_DIR) return env.ASK_SPARK_DATA_DIR;
  if (env.RAILWAY_VOLUME_MOUNT_PATH) return join(env.RAILWAY_VOLUME_MOUNT_PATH, "ask-spark");
  return join(process.cwd(), ".data", "ask-spark");
}

export class AskStore {
  private spend: SpendFile | null = null;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(private dir: string = dataDir()) {}

  private get spendPath() {
    return join(this.dir, "spend.json");
  }
  private get logDir() {
    return join(this.dir, "logs");
  }

  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(fn, fn);
    this.chain = next.catch(() => undefined);
    return next;
  }

  private async loadSpend(): Promise<SpendFile> {
    if (this.spend) return this.spend;
    try {
      const j = JSON.parse(await readFile(this.spendPath, "utf8")) as SpendFile;
      this.spend = { months: j.months ?? {}, days: j.days ?? {} };
    } catch {
      this.spend = { months: {}, days: {} };
    }
    return this.spend;
  }

  async getSpend(now = new Date()): Promise<Spend> {
    const s = await this.serial(() => this.loadSpend());
    return { monthUsd: s.months[monthKey(now)] ?? 0, dayUsd: s.days[dayKey(now)] ?? 0 };
  }

  async addSpend(usd: number, now = new Date()): Promise<Spend> {
    return this.serial(async () => {
      const s = await this.loadSpend();
      const m = monthKey(now);
      const d = dayKey(now);
      s.months[m] = (s.months[m] ?? 0) + usd;
      s.days[d] = (s.days[d] ?? 0) + usd;
      // Keep a year of months and two weeks of days.
      for (const k of Object.keys(s.days)) if (k < dayKey(new Date(now.getTime() - 14 * 86_400_000))) delete s.days[k];
      for (const k of Object.keys(s.months).sort().slice(0, -12)) delete s.months[k];
      await mkdir(this.dir, { recursive: true });
      const tmp = `${this.spendPath}.tmp`;
      await writeFile(tmp, JSON.stringify(s));
      await rename(tmp, this.spendPath);
      return { monthUsd: s.months[m], dayUsd: s.days[d] };
    });
  }

  async log(entry: LogEntry, now = new Date()): Promise<void> {
    await this.serial(async () => {
      await mkdir(this.logDir, { recursive: true });
      await appendFile(join(this.logDir, `${dayKey(now)}.jsonl`), JSON.stringify(entry) + "\n");
      await this.purge(now);
    });
  }

  /** Deletes log files older than the retention window. */
  private async purge(now: Date) {
    const cutoff = dayKey(new Date(now.getTime() - LOG_RETENTION_DAYS * 86_400_000));
    let files: string[] = [];
    try {
      files = await readdir(this.logDir);
    } catch {
      return;
    }
    for (const f of files) {
      const m = /^(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(f);
      if (m && m[1] < cutoff) await rm(join(this.logDir, f), { force: true });
    }
  }

  async purgeOld(now = new Date()) {
    await this.serial(() => this.purge(now));
  }

  /** Recent log entries, newest first, for the admin review page. */
  async recent(days = 7, now = new Date()): Promise<LogEntry[]> {
    const out: LogEntry[] = [];
    for (let i = 0; i < days; i++) {
      const f = join(this.logDir, `${dayKey(new Date(now.getTime() - i * 86_400_000))}.jsonl`);
      let txt = "";
      try {
        txt = await readFile(f, "utf8");
      } catch {
        continue;
      }
      const lines = txt.trim().split("\n").filter(Boolean).reverse();
      for (const l of lines) {
        try {
          out.push(JSON.parse(l) as LogEntry);
        } catch {
          /* skip a torn line */
        }
      }
    }
    return out;
  }
}
