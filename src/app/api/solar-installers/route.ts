import { NextRequest, NextResponse } from "next/server";
import { zipToState, STATE_NAMES } from "@/lib/zipToState";
import { searchInstallers } from "@/data/installers";

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Valid 5-digit ZIP required" }, { status: 400 });
  }

  const state = zipToState(zip);
  return NextResponse.json(
    {
      installers: searchInstallers(state),
      zip,
      state,
      stateName: state ? STATE_NAMES[state] : null,
    },
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
