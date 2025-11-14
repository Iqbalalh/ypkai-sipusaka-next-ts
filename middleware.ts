import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req;
    const isAuth = !!nextauth?.token; // cek apakah user sudah login
    const isAuthPage = nextUrl.pathname.startsWith("/signin");

    // Jika sudah login dan coba buka /signin → redirect ke /
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Jika belum login dan buka halaman selain /signin → redirect ke /signin
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    /*
      Lindungi semua route kecuali:
      - /api/auth         (route bawaan next-auth)
      - /_next/static     (file build Next.js)
      - /_next/image      (handler image bawaan)
      - /favicon.ico dll  (aset umum)
    */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
