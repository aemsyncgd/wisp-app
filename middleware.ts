import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth: any }) {
    // If not authenticated and trying to access admin routes, redirect to signin
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/admin")) {
      const signinUrl = new URL("/auth/signin", req.nextUrl.origin);
      signinUrl.searchParams.append("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signinUrl);
    }

    // Protect API routes
    if (req.nextUrl.pathname.startsWith("/api") && !req.nextauth.token) {
      // Allow public API routes
      if (
        !req.nextUrl.pathname.startsWith("/api/setup") &&
        !req.nextUrl.pathname.startsWith("/api/auth") &&
        !req.nextUrl.pathname.startsWith("/api/webhooks")
      ) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes without authentication
        if (
          req.nextUrl.pathname.startsWith("/api/setup") ||
          req.nextUrl.pathname.startsWith("/api/auth") ||
          req.nextUrl.pathname.startsWith("/api/webhooks") ||
          req.nextUrl.pathname.startsWith("/auth")
        ) {
          return true;
        }

        // Admin routes require authentication
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }

        // Other routes allowed
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/setup (setup endpoints)
     * - api/webhooks (webhook endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
