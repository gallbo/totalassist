"use server";

import { revalidatePath } from "next/cache";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { ApiError } from "@/lib/api/client";
import {
  brokerApi,
  type ActualizarCasoInput,
  type CasoArchivo,
  type CasoDetalle,
  type CompartirCasoResponse,
  type MensajeResponse,
} from "@/lib/api/brokers";

// (las actions del cuestionario viven aquí desde que el cuestionario se contesta
// dentro del form de editar; la ruta /casos/[id]/cuestionario quedó como redirect)

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
  if (result.ok) revalidatePath(`/casos/${casoId}`);
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
  if (result.ok) revalidatePath(`/casos/${casoId}`);
  return result;
}

export async function borrarArchivoCasoAction(
  casoId: number,
  archivoId: number,
): Promise<ActionResult<MensajeResponse>> {
  const result = await withToken((t) =>
    brokerApi.borrarArchivoCaso(t, casoId, archivoId),
  );
  if (result.ok) revalidatePath(`/casos/${casoId}`);
  return result;
}

export async function compartirCasoAction(
  casoId: number,
  opts: { regenerar?: boolean; enviar_correo?: boolean } = {},
): Promise<ActionResult<CompartirCasoResponse>> {
  return withToken((t) => brokerApi.compartirCaso(t, casoId, opts));
}

export async function actualizarCasoAction(
  casoId: number,
  input: ActualizarCasoInput,
): Promise<ActionResult<CasoDetalle>> {
  const result = await withToken((t) =>
    brokerApi.actualizarCaso(t, casoId, input),
  );
  if (result.ok) {
    revalidatePath(`/casos/${casoId}`);
    revalidatePath("/casos");
  }
  return result;
}

export async function guardarCuestionarioAction(
  casoId: number,
  respuestas: Record<string, string>,
): Promise<ActionResult<MensajeResponse>> {
  const result = await withToken((t) =>
    brokerApi.guardarCuestionario(t, casoId, respuestas),
  );
  if (result.ok) revalidatePath(`/casos/${casoId}`);
  return result;
}
