import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password/");

  const isPublicPath =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/reset-password/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register");

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/library", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
