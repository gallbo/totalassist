/**
 * Layout del login del panel /adminConsultas.
 *
 * Passthrough: la pagina se pinta a pantalla completa con su propio
 * fondo (estilo splash de Connect). No hereda el chrome del `(app)/layout`
 * (esa carpeta es un route group separado).
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
