import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-fallback-super-secret-key-32-chars-minimum"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // 1. Cek validitas token secara minimal (edge-compatible)
  let user = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch (e) {
      // Token tidak valid atau kedaluwarsa
    }
  }

  // 2. Logika Redirection
  const isLoginPage = pathname.startsWith("/login");

  if (!user && !isLoginPage) {
    // Jika belum login dan bukan di halaman login, redirect ke /login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    // Jika sudah login dan mencoba ke /login, redirect ke dashboard (root)
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. (Optional) Proteksi Role-Based Access Control (RBAC)
  // Di masa depan, jika ada halaman khusus admin (misal /admin/*)
  // kita bisa membatasi di sini:
  // if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Mencocokkan semua path request kecuali:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, file.svg, globe.svg, next.svg, vercel.svg, window.svg (static public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)",
  ],
};
