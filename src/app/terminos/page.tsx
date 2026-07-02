import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import {
  TERMINOS_INCISOS,
  TERMINOS_PARRAFOS,
  TERMINOS_TITULO,
  TERMINOS_VERSION,
} from "@/lib/terminos";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Total Assist.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-svh bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" aria-label="Total Assist — Inicio">
            <Logo variant="compact" />
          </Link>
          <Link
            href="/registro"
            className="hover:text-brand-navy inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al registro
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-brand-navy text-xl font-bold sm:text-2xl">
          {TERMINOS_TITULO}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Versión {TERMINOS_VERSION}
        </p>

        <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-700">
          {TERMINOS_PARRAFOS.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
          <div className="space-y-2 pl-4">
            {TERMINOS_INCISOS.map((inciso, i) => (
              <p key={i}>{inciso}</p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
