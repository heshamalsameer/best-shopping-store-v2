import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const jwtToken = request.cookies.get("jwtToken");
  const token = jwtToken?.value as string;
  const { pathname } = request.nextUrl;

  if (!token) {
    if (pathname.startsWith("/api/users/profile/")) {
      return NextResponse.json(
        { message: "no token provided, access denied" },
        { status: 401 }
      );
    }
    if (["/carts", "/checkout", "/orders", "/support"].some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: ["/api/users/profile/:path*", "/login", "/register", "/carts", "/checkout", "/orders/:path*", "/support"],
};
