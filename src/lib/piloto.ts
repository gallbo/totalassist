// Piloto de las secciones nuevas del portal (Juan, oct-2026): Consultas,
// Conferencias y Defensa Legal. Mientras Jorge las prueba, solo las ve el
// broker de pruebas que él usa. Para abrirlas a todos, borrar `piloto: true`
// en nav-items.ts y los layout.tsx de esas secciones (o agregar ids aquí).

/** BrokerUsuarios.id que ven las secciones en piloto. 2 = Jorge Valdez (pruebas). */
export const BROKERS_PILOTO: readonly number[] = [2];

export function esBrokerPiloto(brokerId: number | null | undefined): boolean {
  return brokerId != null && BROKERS_PILOTO.includes(Number(brokerId));
}
