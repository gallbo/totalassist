// Piloto de las secciones nuevas del portal (Juan, oct-2026): Consultas,
// Conferencias, Defensa Legal, "Instalar app" y el filtro de rechazo previo
// al crear un caso. Mientras Jorge las probaba, solo las veía el broker de
// pruebas que él usa (BROKERS_PILOTO).
//
// Liberado a todos los brokers el 21-oct-2026: PILOTO_LIBERADO = true. Para
// volver a restringirlo, ponerlo en false.

export const PILOTO_LIBERADO = true;

/** BrokerUsuarios.id que ven las secciones en piloto. 2 = Jorge Valdez (pruebas). */
export const BROKERS_PILOTO: readonly number[] = [2];

export function esBrokerPiloto(brokerId: number | null | undefined): boolean {
  if (brokerId == null) return false;
  return PILOTO_LIBERADO || BROKERS_PILOTO.includes(Number(brokerId));
}
