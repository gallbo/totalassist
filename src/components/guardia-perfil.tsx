"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const RUTA = "/completar-perfil";

/**
 * Perfil incompleto (migración 144). El layout redirige en cargas completas,
 * pero al navegar con ligas internas el layout no se vuelve a ejecutar; este
 * guardia sí ve cada cambio de ruta y regresa a Completar perfil. Mientras
 * tanto oculta el contenido (sin quitarlo del árbol: si el layout dejara de
 * renderizar la página, el router de Next la volvería a pedir sin parar).
 */
export function GuardiaPerfil({
  incompleto,
  children,
}: {
  incompleto: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const fuera = incompleto && !pathname.startsWith(RUTA);

  useEffect(() => {
    if (fuera) router.replace(RUTA);
  }, [fuera, router]);

  return <div className={fuera ? "hidden" : "contents"}>{children}</div>;
}
