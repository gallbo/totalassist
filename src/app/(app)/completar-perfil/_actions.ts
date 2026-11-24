"use server";

import { updateTag } from "next/cache";
import { brokerApi } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import type { DomicilioInput } from "@/lib/schemas/auth";

/** Guarda RFC y domicilio; con eso Skipper marca el perfil completo (migración 144). */
export async function completarPerfilAction(
  input: DomicilioInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const token = await getServerAccessToken();
  if (!token)
    return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };
  try {
    const perfil = await brokerApi.actualizarPerfil(token, {
      rfc: input.rfc,
      direcciones: [
        {
          domicilio: input.domicilio,
          ciudad: input.ciudad,
          estado: input.estado,
          codigo_postal: input.codigo_postal,
          principal: true,
        },
      ],
    });
    updateTag("broker-me");
    if (!perfil.perfil_completo) {
      return {
        ok: false,
        message: "No pudimos completar tu perfil. Revisa tus datos.",
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof ApiError
          ? (Object.values(e.fieldErrors ?? {})[0]?.[0] ?? e.message)
          : "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.",
    };
  }
}
