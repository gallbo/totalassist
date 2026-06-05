import { notFound, redirect } from "next/navigation";

// El cuestionario se contesta dentro del form de editar caso (sección de
// acordeón). Esta ruta queda como redirect para no romper enlaces guardados.
export default async function CuestionarioCasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const casoId = Number(id);
  if (!Number.isFinite(casoId) || casoId <= 0) notFound();

  redirect(`/casos/${casoId}/editar`);
}
