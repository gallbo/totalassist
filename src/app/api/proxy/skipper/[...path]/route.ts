import { NextRequest, NextResponse } from "next/server";
import { getServerAccessToken } from "@/lib/auth-tokens";

/**
 * Proxy catch-all `/api/proxy/skipper/*` -> Skipper backend con Bearer.
 *
 * Los componentes client-side (formularios de nueva consulta, botones de
 * responder, subida de imagen/audio, etc.) llaman a este proxy en lugar
 * de pegarle al backend directo. Ventajas:
 *   - El access_token vive solo en la cookie httpOnly. Nunca toca el
 *     bundle JS ni queda expuesto a XSS.
 *   - Un solo lugar centraliza el ruteo de headers, timeouts y errores
 *     para todo el modulo Consultas.
 *   - En dev el proxy corre en localhost:3000 mismo que la UI, asi no
 *     hay CORS entre el navegador y el proxy — el CORS solo aplica del
 *     proxy hacia Skipper (server-to-server, se salta).
 *
 * Ruta:
 *   Client hace fetch("/api/proxy/skipper/api/brokers/consultas", ...)
 *   => Aqui reenviamos a `${SKIPPER_URL}/api/brokers/consultas` con
 *      Authorization: Bearer <access_token de la cookie>.
 */

const SKIPPER_URL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";

const METHODS_CON_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function proxy(request: NextRequest, path: string[]) {
  const token = await getServerAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Sin sesión." }, { status: 401 });
  }

  const upstream = new URL(`${SKIPPER_URL}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((v, k) => {
    upstream.searchParams.set(k, v);
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  // Preservamos Content-Type: en particular multipart/form-data lleva el
  // boundary autogenerado; si lo forzamos a application/json aqui, el
  // upload de imagenes/audio se rompe.
  const ct = request.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);

  const init: RequestInit = {
    method: request.method,
    headers,
    // Solo pasamos body si el metodo lo lleva. Streaming lo maneja fetch.
    body: METHODS_CON_BODY.has(request.method)
      ? await request.arrayBuffer()
      : undefined,
    // Skipper no lo cachea; nosotros tampoco.
    cache: "no-store",
    // Node fetch en Next: `duplex: 'half'` es requerido para stream,
    // pero con arrayBuffer ya viene materializado, no hace falta.
  };

  const res = await fetch(upstream.toString(), init);

  // Reenvia body y headers relevantes. NO reenviamos Set-Cookie ni CORS —
  // esos los maneja Next para la peticion cliente-a-proxy.
  const resHeaders = new Headers();
  const ctRes = res.headers.get("content-type");
  if (ctRes) resHeaders.set("Content-Type", ctRes);

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

// Handlers para cada verbo — Next.js requiere exports explicitos.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await ctx.params).path);
}
