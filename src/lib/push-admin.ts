/**
 * Notificaciones push de la app de Consultas del admin (Manuel).
 *
 * Flujo: se registra /sw-admin.js con scope /adminConsultas/, se pide permiso
 * (solo con un toque del usuario: Apple lo exige), el navegador crea la
 * suscripción con la llave pública VAPID de Skipper y la registramos en
 * Skipper. Skipper manda el aviso cuando entra una consulta o un mensaje; no
 * hay polling.
 *
 * En iPhone solo funciona con la app agregada a la pantalla de inicio
 * (iOS 16.4+), no en una pestaña de Safari.
 */

import { apiClient } from "@/lib/api/consultas";

export const SW_URL = "/sw-admin.js";
export const SW_SCOPE = "/adminConsultas/";

export type EstadoPush =
  | "no-soportado" // navegador sin Service Worker / Push
  | "ios-sin-instalar" // iPhone en Safari: hay que agregarla a inicio
  | "bloqueado" // el usuario negó el permiso
  | "inactivo" // se puede activar
  | "activo"; // suscrito y registrado en Skipper

export function esIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function esAppInstalada(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function soportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function registro(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
}

/** Llave VAPID en base64url → bytes, como la pide pushManager.subscribe. */
function llaveABytes(base64url: string): Uint8Array<ArrayBuffer> {
  const relleno = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + relleno).replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

async function registrarEnSkipper(sub: PushSubscription): Promise<void> {
  await apiClient(
    "/api/totalassist/admin/push/suscripcion",
    { method: "POST", body: JSON.stringify(sub.toJSON()) },
    "activar notificaciones",
  );
}

/**
 * Estado actual sin pedir nada al usuario. Si ya hay suscripción, la vuelve a
 * registrar en Skipper (por si Skipper la borró o cambió).
 */
export async function estadoPush(): Promise<EstadoPush> {
  if (esIOS() && !esAppInstalada()) return "ios-sin-instalar";
  if (!soportado()) return "no-soportado";
  if (Notification.permission === "denied") return "bloqueado";
  if (Notification.permission !== "granted") return "inactivo";

  const reg = await registro();
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return "inactivo";
  try {
    await registrarEnSkipper(sub);
  } catch {
    // Sin red o sesión vencida: se reintenta la próxima vez que abra la app.
  }
  return "activo";
}

/** Debe llamarse desde un toque del usuario (botón). */
export async function activarPush(): Promise<EstadoPush> {
  if (!soportado()) return esIOS() ? "ios-sin-instalar" : "no-soportado";

  const permiso = await Notification.requestPermission();
  if (permiso === "denied") return "bloqueado";
  if (permiso !== "granted") return "inactivo";

  const config = await apiClient<{ habilitado: boolean; public_key: string }>(
    "/api/totalassist/admin/push/config",
    { method: "GET" },
    "activar notificaciones",
  );
  if (!config.habilitado || !config.public_key) {
    throw new Error("Las notificaciones aún no están disponibles.");
  }

  const reg = await registro();
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: llaveABytes(config.public_key),
    }));

  await registrarEnSkipper(sub);
  return "activo";
}
