import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/registro",
  "/recuperar-acceso",
  "/restablecer",
];
const sharedRoutes = [
  "/condiciones",
  "/privacidad",
  "/terminos",
  "/seguimiento",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  // El refresh del token falló: la sesión está muerta aunque la cookie exista.
  const sesionExpirada = req.auth?.error === "RefreshAccessTokenError";
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isSharedRoute = sharedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isSharedRoute) {
    return NextResponse.next();
  }

  // Sesión expirada en ruta protegida: mandar a login con aviso, en vez de
  // dejar al usuario navegando con páginas en blanco o trabadas.
  if (sesionExpirada && !isPublicRoute) {
    const url = new URL("/login", req.url);
    url.searchParams.set("expirada", "1");
    return NextResponse.redirect(url);
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
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
