import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika mencoba akses halaman internal tanpa token -> lempar ke /login
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/tickets");
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Jika sudah login tapi mencoba buka /login -> lempar ke /dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang diproteksi oleh middleware ini
export const config = {
  matcher: ["/dashboard/:path*", "/tickets/:path*", "/login"],
};