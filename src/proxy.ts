import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminToken } from "@/lib/admin-auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (not /admin/login itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!(await isAdminToken(req.cookies.get(ADMIN_COOKIE)?.value))) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
