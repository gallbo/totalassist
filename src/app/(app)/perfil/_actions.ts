"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { ApiError } from "@/lib/api/client";
import {
  brokerApi,
  type ActualizarPerfilInput,
  type CambiarPasswordInput,
  type PerfilBroker,
} from "@/lib/api/brokers";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; code?: string };

async function withToken<T>(
  fn: (token: string) => Promise<T>,
): Promise<ActionResult<T>> {
  const token = await getServerAccessToken();
  if (!token) {
    return {
      ok: false,
      message: "Tu sesión expiró. Vuelve a iniciar sesión.",
      code: "no_autenticado",
    };
  }
  try {
    const data = await fn(token);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, code: error.code };
    }
    return {
      ok: false,
      message:
        "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.",
    };
  }
}

export async function actualizarPerfilAction(
  input: ActualizarPerfilInput,
): Promise<ActionResult<PerfilBroker>> {
  const result = await withToken((t) => brokerApi.actualizarPerfil(t, input));
  if (result.ok) {
    revalidatePath("/perfil");
    // El header lee /me con cache; invalidar el tag fuerza un refetch en la
    // proxima navegacion para que nombre y apellidos se actualicen.
    updateTag("broker-me");
  }
  return result;
}

export async function cambiarPasswordAction(
  input: CambiarPasswordInput,
): Promise<ActionResult<{ mensaje: string }>> {
  return withToken((t) => brokerApi.cambiarPassword(t, input));
}

export async function subirLogoAction(
  formData: FormData,
): Promise<ActionResult<PerfilBroker>> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona un archivo válido." };
  }
  const result = await withToken((t) => brokerApi.subirLogo(t, file));
  if (result.ok) {
    revalidatePath("/perfil");
    // Invalida el cache del header para que el avatar se sincronice.
    updateTag("broker-me");
  }
  return result;
}
