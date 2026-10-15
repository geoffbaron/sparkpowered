import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, safeEqual, safeNext } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin login is not configured" }, { status: 500 });
  }

  if (typeof password !== "string" || !safeEqual(password, adminPassword)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, redirect: safeNext(req.nextUrl.searchParams.get("next")) });

  res.cookies.set(ADMIN_COOKIE, await adminToken(adminPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
