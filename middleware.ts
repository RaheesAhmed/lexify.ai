import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has("auth-token"); // Replace with your actual auth token name
  const isAuthPage = request.nextUrl.pathname.startsWith("/(auth)");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  // If trying to access auth pages while authenticated, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access dashboard while not authenticated, redirect to login
  if (!isAuthenticated && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
