"use client";

import type { NuevoCasoSchema } from "../_schema";
import type { RespuestasCuestionario } from "../../_components/cuestionario-secciones";

/**
 * Autoguardado del formulario de "Registro de caso" (/casos/nuevo) en
 * localStorage. Alicia (jul-2026): "Estaría muy bien que el formato se
 * pudiera autoguardar sin necesidad del botón, que quedara como una
 * especie de borrador en caso de que el siniestro no se quisiera cargar
 * inmediatamente por algún dato con el que no se cuenta".
 *
 * Alcance:
 *   - Solo aplica a /casos/nuevo (registro nuevo). La edición no usa
 *     borrador — ahí ya persistimos contra backend.
 *   - Se guardan los datos del form (react-hook-form) + las respuestas
 *     del cuestionario dinámico (state local del componente).
 *   - NO se guardan los archivos adjuntos (blobs no se pueden serializar
 *     de forma segura). Al restaurar, el broker tendrá que volver a
 *     subir la póliza y los documentos.
 *   - Al crear el caso exitosamente, se borra el borrador.
 *
 * Clave por broker: si en el futuro hay multi-broker en el mismo browser
 * (raro), se puede segregar por user id. Por ahora una sola clave global
 * es suficiente.
 */

const CLAVE_BORRADOR = "totalassist:borrador-caso-nuevo";
const VERSION_BORRADOR = 1;

type BorradorPayload = {
  version: number;
  guardadoEn: string; // ISO date
  datosForm: Partial<NuevoCasoSchema>;
  respuestasCuestionario: RespuestasCuestionario;
};

/** Serializa y guarda el snapshot actual del form + cuestionario. */
export function guardarBorrador(
  datosForm: Partial<NuevoCasoSchema>,
  respuestasCuestionario: RespuestasCuestionario,
) {
  if (typeof window === "undefined") return;
  try {
    const payload: BorradorPayload = {
      version: VERSION_BORRADOR,
      guardadoEn: new Date().toISOString(),
      datosForm,
      respuestasCuestionario,
    };
    window.localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(payload));
  } catch (err) {
    // El storage puede fallar por quota o modo privado — silenciamos
    // porque el broker no debe enterarse de este detalle técnico.
    console.warn("No se pudo guardar el borrador:", err);
  }
}

/** Lee el borrador si existe y es de la versión actual. */
export function leerBorrador(): BorradorPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLAVE_BORRADOR);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BorradorPayload;
    if (parsed.version !== VERSION_BORRADOR) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Elimina el borrador — se llama al enviar el caso o al descartarlo. */
export function borrarBorrador() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLAVE_BORRADOR);
  } catch {
    // No pasa nada si falla — el próximo borrador lo sobrescribe igual.
  }
}

/** ¿Hay borrador guardado hoy o antes? Útil para mostrar el banner. */
export function existeBorrador(): boolean {
  return leerBorrador() !== null;
}
