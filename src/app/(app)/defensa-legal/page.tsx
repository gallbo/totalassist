import {
  Building2,
  Scale,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BotonSolicitaInfo } from "@/components/whatsapp/boton-solicita-info";

/**
 * Landing "Defensa legal del agente de seguros" (pestaña del broker).
 * Página informativa con un único call to action: WhatsApp a comercial.
 *
 * Textos tomados del servicio "Defensa legal del agente de seguros" de la
 * sección #servicios de totalassist-site (homeServicios en
 * src/lib/site-config.ts de ese proyecto). Si cambian allá, actualizar aquí.
 */

const COBERTURAS: { icono: LucideIcon; titulo: string; texto: string }[] = [
  {
    icono: Users,
    titulo: "Responsabilidad civil frente al asegurado",
    texto:
      "Respaldo ante reclamos de tus asegurados derivados de tu labor como agente.",
  },
  {
    icono: Building2,
    titulo: "Faltas administrativas ante la CNSF",
    texto:
      "Acompañamiento en la responsabilidad por faltas administrativas ante la Comisión Nacional de Seguros y Fianzas.",
  },
  {
    icono: Scale,
    titulo: "Consultoría jurídica general",
    texto:
      "Asesoría jurídica general para tu actividad, bajo la figura de coordinador.",
  },
];

export default function DefensaLegalPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="bg-brand-navy overflow-hidden rounded-2xl px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-brand-yellow flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Defensa legal
          </span>
          <h1 className="text-2xl leading-tight font-bold sm:text-4xl">
            Defensa legal del agente de seguros
          </h1>
          <p className="text-sm text-white/80 sm:text-base">
            Respaldo legal especializado para que ejerzas tu actividad como
            agente de seguros con mayor seguridad y confianza, protegiendo tu
            labor profesional ante riesgos legales, administrativos y
            regulatorios.
          </p>
          <div className="pt-2">
            <BotonSolicitaInfo tema="defensaLegal" claro />
          </div>
        </div>
      </section>

      {/* Qué cubre */}
      <section className="flex flex-col gap-4">
        <h2 className="text-brand-navy text-lg font-bold">Qué cubre</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {COBERTURAS.map((c) => (
            <li
              key={c.titulo}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5"
            >
              <span className="bg-brand-yellow/20 text-brand-navy flex h-10 w-10 items-center justify-center rounded-full">
                <c.icono className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-brand-navy text-sm font-semibold">
                {c.titulo}
              </h3>
              <p className="text-sm text-neutral-600">{c.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA final */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-brand-navy text-lg font-bold">
            Ejerce tu actividad con mayor seguridad
          </h2>
          <p className="text-sm text-neutral-600">
            Escríbenos por WhatsApp y te explicamos cómo funciona la defensa
            legal de Total Assist.
          </p>
        </div>
        <BotonSolicitaInfo tema="defensaLegal" />
      </section>
    </div>
  );
}
