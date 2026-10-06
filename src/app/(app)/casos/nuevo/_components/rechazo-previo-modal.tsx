"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  CircleX,
  Gavel,
  Info,
  MessageCircle,
  SearchCheck,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { urlWhatsappComercial } from "@/lib/whatsapp-comercial";

/**
 * Filtro previo a la creación de un caso (oct-2026): Total Assist no atiende
 * casos que ya tienen un rechazo de la aseguradora. Se pregunta cada vez que
 * se abre /casos/nuevo.
 *
 *  - NO  → `onContinuar()`: sigue el flujo normal (tutorial + formulario).
 *  - SÍ  → mensaje de GALLBO (Segunda Opinión / Reclamación Judicial) con
 *          CTA a WhatsApp de comercial ("Hablar con un asesor") o "No, gracias" → dashboard.
 *  - No tiene cruz ni se cierra con Escape o clic afuera: solo se sale
 *    respondiendo, para que nadie se salte la pregunta.
 */
export function RechazoPrevioModal({
  onContinuar,
}: {
  onContinuar: () => void;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(true);
  const [conRechazo, setConRechazo] = useState(false);

  const irAlDashboard = () => {
    setAbierto(false);
    router.push("/dashboard");
  };

  const continuar = () => {
    setAbierto(false);
    onContinuar();
  };

  // "Cancelar y regresar": vuelve a la página anterior del portal (lista de
  // casos, dashboard...). Si se entró directo a la URL o se viene de otro
  // sitio, va al dashboard para no sacar al broker de Total Assist.
  const cancelar = () => {
    let vieneDelPortal = false;
    try {
      vieneDelPortal =
        !!document.referrer &&
        new URL(document.referrer).origin === window.location.origin;
    } catch {
      // referrer inválido: se trata como entrada directa.
    }
    setAbierto(false);
    if (vieneDelPortal && window.history.length > 1) router.back();
    else router.push("/dashboard");
  };

  // Bloquea el scroll de la página mientras el modal está abierto.
  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rechazo-titulo"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {conRechazo ? (
          <PasoConRechazo
            onVolver={() => setConRechazo(false)}
            onNoInteresado={irAlDashboard}
          />
        ) : (
          <PasoPregunta
            onSi={() => setConRechazo(true)}
            onNo={continuar}
            onCancelar={cancelar}
          />
        )}
      </div>
    </div>
  );
}

// ─── Paso 1: la pregunta ──────────────────────────────────────────────

function PasoPregunta({
  onSi,
  onNo,
  onCancelar,
}: {
  onSi: () => void;
  onNo: () => void;
  onCancelar: () => void;
}) {
  return (
    <>
      <header className="from-brand-navy flex flex-col items-center gap-3 bg-gradient-to-br to-[#1a3463] px-6 pt-6 pb-5 text-center text-white sm:pt-8 sm:pb-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <Image
            src="/brand/totalassist-shield.png"
            alt=""
            width={64}
            height={72}
            className="h-10 w-auto"
          />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id="rechazo-titulo" className="text-xl font-bold sm:text-2xl">
            ¡Bienvenido a Total Assist!
          </h2>
          <p className="text-sm text-white/75">
            Estás a punto de registrar un nuevo caso.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-1 text-center">
          <p className="text-sm text-neutral-600">
            Antes de continuar, ayúdanos a saber un poco más de tu caso.
          </p>
          <p className="text-brand-navy text-base font-semibold sm:text-lg">
            ¿Tu cliente ya cuenta con un rechazo por parte de la aseguradora?
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OpcionCard
            icono={CircleCheck}
            titulo="No, aún no hay rechazo"
            texto="Continúa con el registro de tu caso."
            destacada
            onClick={onNo}
          />
          <OpcionCard
            icono={CircleX}
            titulo="Sí, ya hay un rechazo"
            texto="La aseguradora ya rechazó la reclamación."
            onClick={onSi}
          />
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-xs text-neutral-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Total Assist acompaña la reclamación desde el aviso del siniestro,
          antes de que la aseguradora emita un rechazo.
        </p>

        <button
          type="button"
          onClick={onCancelar}
          className="text-brand-navy/70 hover:text-brand-navy mx-auto flex items-center gap-1 text-xs font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Cancelar y regresar
        </button>
      </div>
    </>
  );
}

function OpcionCard({
  icono: Icono,
  titulo,
  texto,
  destacada = false,
  onClick,
}: {
  icono: LucideIcon;
  titulo: string;
  texto: string;
  destacada?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition",
        destacada
          ? "border-brand-yellow bg-brand-yellow/10 hover:bg-brand-yellow/20"
          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          destacada
            ? "bg-brand-yellow text-brand-navy"
            : "bg-neutral-100 text-neutral-600",
        )}
      >
        <Icono className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-brand-navy flex items-center gap-1 text-sm font-bold">
        {titulo}
        {destacada ? (
          <ArrowRight
            className="h-4 w-4 transition group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        ) : null}
      </span>
      <span className="text-xs text-neutral-600">{texto}</span>
    </button>
  );
}

// ─── Paso 2: ya hay rechazo → servicios de GALLBO ─────────────────────

const SERVICIOS_GALLBO: { icono: LucideIcon; titulo: string; texto: string }[] =
  [
    {
      icono: SearchCheck,
      titulo: "Segunda Opinión",
      texto:
        "Análisis especializado del rechazo para valorar las opciones de tu cliente.",
    },
    {
      icono: Gavel,
      titulo: "Reclamación Judicial",
      texto:
        "Defensa legal de los intereses de tu cliente frente a la aseguradora.",
    },
  ];

function PasoConRechazo({
  onVolver,
  onNoInteresado,
}: {
  onVolver: () => void;
  onNoInteresado: () => void;
}) {
  const urlWhatsapp = urlWhatsappComercial("rechazoPrevio");

  return (
    <>
      <header className="from-brand-navy flex flex-col items-center gap-3 bg-gradient-to-br to-[#1a3463] px-6 pt-6 pb-5 text-center text-white sm:pt-8 sm:pb-6">
        <span className="bg-brand-yellow/20 text-brand-yellow flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-white/20">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 id="rechazo-titulo" className="text-xl font-bold">
            Lo sentimos
          </h2>
          <p className="text-sm text-white/75">
            Este caso no puede registrarse en Total Assist.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-2 text-sm text-neutral-600">
          <p>
            Como ya existe un rechazo previo, no es posible prestarte el
            servicio de Total Assist.
          </p>
          <p>
            Sin embargo, para estos casos{" "}
            <a
              href="https://gallbo.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GALLBO, S.C. (abre gallbo.com en otra pestaña)"
              className="text-brand-navy decoration-brand-yellow hover:decoration-brand-navy font-bold underline decoration-2 underline-offset-2"
            >
              GALLBO, S.C.
            </a>{" "}
            te ofrece los siguientes servicios para que apoyes a tu cliente en
            la defensa de sus intereses:
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {SERVICIOS_GALLBO.map((s) => (
            <li
              key={s.titulo}
              className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-col sm:gap-2 sm:p-4"
            >
              <span className="bg-brand-navy flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white">
                <s.icono className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-0.5 sm:gap-2">
                <span className="text-brand-navy text-sm font-bold">
                  {s.titulo}
                </span>
                <span className="text-xs text-neutral-600">{s.texto}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <p className="text-brand-navy text-center text-base font-semibold">
            ¿Te interesa conocer más?
          </p>
          {urlWhatsapp ? (
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar con un asesor por WhatsApp (se abre en otra pestaña)"
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Hablar con un asesor
            </a>
          ) : null}
          <button
            type="button"
            onClick={onNoInteresado}
            aria-label="No, gracias. Volver al dashboard"
            className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            No, gracias
          </button>
          <button
            type="button"
            onClick={onVolver}
            className="text-brand-navy/70 hover:text-brand-navy mx-auto flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Me equivoqué, mi cliente no tiene rechazo
          </button>
        </div>
      </div>
    </>
  );
}
