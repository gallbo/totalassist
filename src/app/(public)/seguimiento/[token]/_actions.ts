"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import {
  publicoApi,
  type DocumentoPublico,
  type EnviarEvaluacionInput,
  type EvaluacionPublica,
} from "@/lib/api/publico";

export type EnviarEvaluacionResult =
  | { ok: true; data: EvaluacionPublica }
  | { ok: false; message: string; code?: string };

export type SubirDocumentoResult =
  | { ok: true; data: DocumentoPublico }
  | { ok: false; message: string; code?: string };

export async function enviarEvaluacionAction(
  token: string,
  input: EnviarEvaluacionInput,
): Promise<EnviarEvaluacionResult> {
  try {
    const data = await publicoApi.enviarEvaluacion(token, input);
    revalidatePath(`/seguimiento/${token}`);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, code: error.code };
    }
    return {
      ok: false,
      message:
        "No pudimos enviar tu evaluación. Intenta de nuevo en unos segundos.",
    };
  }
}

export async function subirDocumentoAction(
  token: string,
  formData: FormData,
): Promise<SubirDocumentoResult> {
  const file = formData.get("archivo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona un archivo válido." };
  }
  try {
    const data = await publicoApi.subirDocumento(token, file);
    revalidatePath(`/seguimiento/${token}`);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message, code: error.code };
    }
    return {
      ok: false,
      message:
        "No pudimos enviar el documento. Intenta de nuevo en unos segundos.",
    };
  }
}
