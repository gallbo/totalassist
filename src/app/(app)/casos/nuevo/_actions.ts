"use server";

import { revalidatePath } from "next/cache";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { ApiError } from "@/lib/api/client";
import {
  brokerApi,
  type CasoArchivo,
  type RegistrarCasoInput,
  type RegistrarCasoResponse,
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

export async function registrarCasoAction(
  input: RegistrarCasoInput,
): Promise<ActionResult<RegistrarCasoResponse>> {
  const result = await withToken((t) => brokerApi.registrarCaso(t, input));
  if (result.ok) {
    revalidatePath("/casos");
    revalidatePath("/paquetes");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function subirArchivoCasoAction(
  casoId: number,
  formData: FormData,
): Promise<ActionResult<CasoArchivo>> {
  const file = formData.get("archivo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona un archivo válido." };
  }
  const result = await withToken((t) =>
    brokerApi.subirArchivoCaso(t, casoId, file),
  );
  if (result.ok) {
    revalidatePath(`/casos/${casoId}`);
  }
  return result;
}

export async function subirArchivoPolizaAction(
  casoId: number,
  polizaId: number,
  formData: FormData,
): Promise<
  ActionResult<{ archivo_nombre: string | null; tiene_archivo: boolean }>
> {
  const file = formData.get("archivo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona un archivo válido." };
  }
  const result = await withToken((t) =>
    brokerApi.subirArchivoPoliza(t, casoId, polizaId, file),
  );
  if (result.ok) {
    revalidatePath(`/casos/${casoId}`);
  }
  return result;
}
