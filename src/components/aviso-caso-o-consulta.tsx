import Link from "next/link";
import { MessageSquare } from "lucide-react";

/**
 * Aviso arriba del formulario de Nuevo caso (nov-2026). Varios agentes
 * registraban como caso lo que era una duda técnico-jurídica, y el equipo de
 * TotalAssist le dedicaba tiempo de gestión de siniestro. Los manda a Consultas.
 */
export function AvisoCasoOConsulta() {
  return (
    <div className="border-brand-yellow/60 bg-brand-yellow/10 flex flex-col items-start gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center">
      <span className="bg-brand-yellow text-brand-navy inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex-1 text-sm">
        <p className="text-brand-navy font-semibold">¿Solo tienes una duda?</p>
        <p className="text-neutral-700">
          Registra un caso solo si tu asegurado tuvo un siniestro que hay que
          reclamar. Para preguntas sobre una póliza, una cobertura o el criterio
          de una aseguradora, haz una consulta: te responde directamente el
          equipo técnico y jurídico.
        </p>
      </div>
      <Link
        href="/consultas/nueva"
        className="bg-brand-navy hover:bg-brand-navy/90 shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white"
      >
        Hacer una consulta
      </Link>
    </div>
  );
}
