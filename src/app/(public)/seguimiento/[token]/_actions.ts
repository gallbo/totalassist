"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api/client";
import {
  publicoApi,
  type EnviarEvaluacionInput,
  type EvaluacionPublica,
} from "@/lib/api/publico";

export type EnviarEvaluacionResult =
  | { ok: true; data: EvaluacionPublica }
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
