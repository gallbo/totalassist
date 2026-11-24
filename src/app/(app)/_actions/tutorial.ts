"use server";

import { updateTag } from "next/cache";
import { brokerApi } from "@/lib/api/brokers";
import { getServerAccessToken } from "@/lib/auth-tokens";

/** El broker terminó el recorrido o eligió «No volver a mostrar»: ya no se abre solo. */
export async function marcarTutorialVistoAction(): Promise<void> {
  const token = await getServerAccessToken();
  if (!token) return;
  try {
    await brokerApi.marcarTutorialVisto(token);
    // /me se lee con cache en el layout; sin esto se volvería a abrir.
    updateTag("broker-me");
  } catch {
    // No es crítico: en el peor caso se vuelve a mostrar en la siguiente visita.
  }
}

/** El recorrido se abrió solo hoy: no se vuelve a abrir solo hasta mañana. */
export async function marcarTutorialMostradoAction(): Promise<void> {
  const token = await getServerAccessToken();
  if (!token) return;
  try {
    await brokerApi.marcarTutorialMostrado(token);
    updateTag("broker-me");
  } catch {
    // No es crítico: en el peor caso se vuelve a abrir en la siguiente visita.
  }
}
