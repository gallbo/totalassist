const FALLBACK = "—";

export function formatearFechaLarga(
  input: string | Date | null | undefined,
): string {
  if (!input) return FALLBACK;

  const fecha =
    typeof input === "string"
      ? new Date(input.includes("T") ? input : `${input}T00:00:00`)
      : input;

  if (Number.isNaN(fecha.getTime())) {
    return typeof input === "string" ? input : FALLBACK;
  }

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = fecha.toLocaleString("es-MX", { month: "long" }).toUpperCase();
  const anio = fecha.getFullYear();

  return `${dia}-${mes}-${anio}`;
}
