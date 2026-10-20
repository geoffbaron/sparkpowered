import { NextRequest, NextResponse } from "next/server";
import { zipToState, STATE_NAMES } from "@/lib/zipToState";
import { searchInstallers } from "@/data/installers";

/** GET ?zip=12345, or ?state=TX when the finder starts on the visitor's estimated state. */
export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip");
  const byState = req.nextUrl.searchParams.get("state")?.toUpperCase() ?? "";

  let state: string | null;
  if (zip && /^\d{5}$/.test(zip)) state = zipToState(zip);
  else if (!zip && STATE_NAMES[byState]) state = byState;
  else return NextResponse.json({ error: "Valid 5-digit ZIP required" }, { status: 400 });

  return NextResponse.json(
    {
      installers: searchInstallers(state),
      zip: zip ?? "",
      state,
      stateName: state ? STATE_NAMES[state] : null,
    },
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
