"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MessageCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SECCIONES: {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  activa: (path: string) => boolean;
}[] = [
  {
    href: "/adminConsultas",
    etiqueta: "Consultas",
    icono: MessageCircle,
    // La bandeja y el detalle de cada consulta (/adminConsultas/{id}).
    activa: (p) => !p.startsWith("/adminConsultas/conferencias"),
  },
  {
    href: "/adminConsultas/conferencias",
    etiqueta: "Conferencias",
    icono: CalendarDays,
    activa: (p) => p.startsWith("/adminConsultas/conferencias"),
  },
];

/**
 * Pestañas de sección del panel admin, debajo del encabezado. La activa se
 * resalta (mismo amarillo que el portal del broker) y se anuncia a
 * VoiceOver con aria-current="page". En celular cada pestaña ocupa la
 * mitad del ancho.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel"
      className="border-b border-neutral-200 bg-white"
    >
      <ul className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-1 px-4 py-2 sm:flex sm:gap-2">
        {SECCIONES.map((s) => {
          const activa = s.activa(pathname);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
                  activa
                    ? "bg-brand-yellow text-brand-navy"
                    : "text-brand-navy/70 hover:text-brand-navy hover:bg-neutral-100",
                )}
              >
                <s.icono className="h-4 w-4" aria-hidden="true" />
                {s.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
