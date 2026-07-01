import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "getissues",
  });

  if (isDashboardRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
