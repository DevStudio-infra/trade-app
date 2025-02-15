import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const pathname = req.nextUrl.pathname;

  console.log("[MIDDLEWARE] Request:", {
    path: pathname,
    isAuthenticated,
    auth: req.auth,
  });

  const isOnProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isOnProtectedRoute) {
    console.log("[MIDDLEWARE] Protected route access:", {
      path: pathname,
      isAuthenticated,
      willRedirect: !isAuthenticated,
    });

    if (!isAuthenticated) {
      console.log("[MIDDLEWARE] Redirecting to login");
      return Response.redirect(new URL("/login", req.nextUrl));
    }
  }

  console.log("[MIDDLEWARE] Proceeding with request");
  return NextResponse.next();
});

// Optionally configure middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/credits/:path*",
    "/api/user/:path*",
  ],
};
