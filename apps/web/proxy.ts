import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "./lib/auth-client";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const res = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !res.data) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
