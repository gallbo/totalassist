import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/registro",
  "/recuperar-acceso",
  "/restablecer",
  // Login del panel admin (Manuel). Sin esto el middleware lo trataria
  // como protegido y mandaria a /login del broker antes de que el admin
  // pueda entrar.
  "/adminConsultas/login",
];
const sharedRoutes = [
  // Manifest PWA del panel admin: Chrome lo pide SIN sesión desde el login
  // para ofrecer "Instalar app". Si el middleware lo redirige al login, el
  // manifest es inválido y Chrome nunca muestra el diálogo de instalación.
  "/adminConsultas/manifest.webmanifest",
  "/condiciones",
  "/privacidad",
  "/terminos",
  "/seguimiento",
];

// Familias de rutas: cada una tiene su propio login/home. Cuando el
// usuario cae en una URL protegida sin sesion, lo mandamos al login de
// SU familia — un broker no debe terminar en /adminConsultas/login y
// un admin no debe terminar en /login del broker.
type Familia = { prefix: string; login: string; home: string };
const familias: Familia[] = [
  {
    prefix: "/adminConsultas",
    login: "/adminConsultas/login",
    home: "/adminConsultas",
  },
  // Portal broker es el default (todo lo que no matchee las otras familias).
  { prefix: "/", login: "/login", home: "/dashboard" },
];

function familiaDe(pathname: string): Familia {
  return (
    familias.find((f) => pathname.startsWith(f.prefix)) ??
    familias[familias.length - 1]
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  // El refresh del token fallo: la sesion esta muerta aunque la cookie exista.
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

  const fam = familiaDe(pathname);

  // Sesion expirada en ruta protegida: mandar al login de la familia
  // correspondiente con aviso, en vez de dejar al usuario navegando con
  // paginas en blanco o trabadas.
  if (sesionExpirada && !isPublicRoute) {
    const url = new URL(fam.login, req.url);
    url.searchParams.set("expirada", "1");
    return NextResponse.redirect(url);
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(fam.login, req.url));
  }

  // Con la sesion expirada (cookie presente pero refresh fallido) hay que
  // dejar ver el login: si lo mandaramos a su home, el bloque de arriba lo
  // regresaria al login y se forma un loop (ERR_TOO_MANY_REDIRECTS).
  if (isAuthenticated && isPublicRoute && !sesionExpirada) {
    // Ya autenticado en un login: mandarlo a su home SOLO si su rol
    // realmente pertenece a esa familia. Si no coincide (ej. un broker
    // que abre /adminConsultas/login queriendo hacer login como admin,
    // o un admin en /login queriendo hacer login como broker), lo dejamos
    // ver el form — al hacer login con las otras credenciales la cookie
    // se sobrescribe y todo queda consistente.
    const yaEnSuLogin = pathname.startsWith(fam.login);
    const userRole = (req.auth as { role?: string } | null)?.role ?? "broker";
    const familiaEsAdmin = fam.prefix === "/adminConsultas";
    const rolCoincideConFamilia =
      (familiaEsAdmin && userRole === "admin") ||
      (!familiaEsAdmin && userRole === "broker");
    if (yaEnSuLogin && rolCoincideConFamilia) {
      return NextResponse.redirect(new URL(fam.home, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
