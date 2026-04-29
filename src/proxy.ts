import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/registro",
  "/recuperar-acceso",
  "/restablecer",
];
const sharedRoutes = ["/ayuda", "/condiciones", "/privacidad"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isSharedRoute = sharedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isSharedRoute) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
