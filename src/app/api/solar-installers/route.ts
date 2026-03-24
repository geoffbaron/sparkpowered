import { NextRequest, NextResponse } from "next/server";
import { zipToState, STATE_NAMES } from "@/lib/zipToState";
import { searchInstallers } from "@/data/installers";
import type { Installer } from "@/data/installers";

export type { Installer };

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Valid 5-digit ZIP required" }, { status: 400 });
  }

  const state = zipToState(zip);
  const stateName = state ? STATE_NAMES[state] : null;
  const results = searchInstallers(state);

  return NextResponse.json({
    installers: results,
    zip,
    state,
    stateName,
  });
}
