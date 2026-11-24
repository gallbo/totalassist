"use client";

import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import {
  marcarTutorialMostradoAction,
  marcarTutorialVistoAction,
} from "@/app/(app)/_actions/tutorial";

/**
 * Recorrido guiado del portal (requerimiento 4 de "Ajustes y mejoras Total
 * Assist", nov-2026). Se abre solo una vez al día mientras el agente no lo
 * termine ni elija «No volver a mostrar» (cerrarlo con la X solo lo pospone
 * a mañana). Siempre se puede repetir desde "Ver tutorial" en el menú del
 * usuario. Distingue claramente Casos (siniestros) de Consultas
 * (técnico-jurídicas), que es la confusión que se quiere evitar.
 */

const EVENTO = "ta:abrir-tutorial";

/** Abre el recorrido desde cualquier parte del portal (menú del usuario). */
export function abrirTutorial() {
  window.dispatchEvent(new Event(EVENTO));
}

type Paso = {
  /** data-tour del elemento a resaltar; sin él, el paso va al centro. */
  ancla?: string;
  titulo: string;
  texto: string;
  /** Texto extra cuando el elemento no está a la vista (menú ☰ en celular). */
  enMenu?: boolean;
};

const PASOS: Paso[] = [
  {
    titulo: "¡Bienvenido a Total Assist!",
    texto:
      "Te mostramos en un minuto dónde está cada cosa del portal. Puedes avanzar con los botones o con las flechas del teclado.",
  },
  {
    ancla: "nav-dashboard",
    titulo: "Dashboard",
    texto:
      "Tu resumen: cómo van tus casos, las evaluaciones de tus clientes y cuántos siniestros has registrado en el año.",
    enMenu: true,
  },
  {
    ancla: "estado-casos",
    titulo: "Estado de tus casos",
    texto:
      "Los casos en proceso, los que te quedan en tu paquete y los que están detenidos esperando algo de ti o de tu cliente.",
  },
  {
    ancla: "nav-casos",
    titulo: "Casos: registro y seguimiento de siniestros",
    texto:
      "Cuando tu cliente sufrió un siniestro, regístralo aquí con el botón «Registrar caso». En esta misma sección das seguimiento a cada siniestro: avance, documentos y resultado.",
    enMenu: true,
  },
  {
    ancla: "nav-paquetes",
    titulo: "Paquetes",
    texto:
      "Los casos que tienes disponibles y la opción de contratar más cuando los necesites.",
    enMenu: true,
  },
  {
    ancla: "nav-consultas",
    titulo: "Consultas técnico-jurídicas",
    texto:
      "Para dudas técnicas, jurídicas o de interpretación de pólizas y del sector asegurador. Te responde un especialista por este mismo canal. Una consulta no registra un siniestro: si tu cliente ya tuvo uno, regístralo en Casos.",
    enMenu: true,
  },
  {
    ancla: "nav-conferencias",
    titulo: "Conferencias",
    texto: "Cursos, talleres y conferencias para agentes de seguros.",
    enMenu: true,
  },
  {
    ancla: "nav-defensa-legal",
    titulo: "Defensa Legal",
    texto:
      "Si necesitas apoyo legal para ti o tu cliente, desde aquí nos contactas directamente.",
    enMenu: true,
  },
  {
    ancla: "menu-usuario",
    titulo: "Tu perfil y esta guía",
    texto:
      "Aquí actualizas tus datos y tu logo. Si quieres repasar el portal, elige «Ver tutorial» y esta guía se abre otra vez.",
    enMenu: true,
  },
  {
    titulo: "¡Listo!",
    texto:
      "Ya conoces el portal. Si tienes cualquier duda, escríbenos por WhatsApp y con gusto te ayudamos.",
  },
];

/** El elemento visible con ese data-tour (la barra y el menú ☰ tienen copias). */
function visible(ancla: string): Element | undefined {
  return Array.from(document.querySelectorAll(`[data-tour="${ancla}"]`)).find(
    (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    },
  );
}

function construirPasos(): DriveStep[] {
  return PASOS.flatMap((p): DriveStep[] => {
    const hayEnPagina = p.ancla
      ? document.querySelector(`[data-tour="${p.ancla}"]`)
      : true;
    // Secciones que no existen para este broker o en esta página se omiten.
    if (!hayEnPagina) return [];
    const el = p.ancla ? visible(p.ancla) : undefined;
    const nota =
      p.ancla && !el && p.enMenu ? " Lo encuentras en el menú ☰." : "";
    return [
      {
        element: el,
        popover: {
          title: p.titulo,
          description: p.texto + nota,
          side: "bottom",
          align: "start",
        },
      },
    ];
  });
}

export function TutorialPortal({ autoIniciar }: { autoIniciar: boolean }) {
  const activo = useRef(false);
  const yaVisto = useRef(false);

  useEffect(() => {
    /** Ya no se abre solo: terminó el recorrido o pidió no volver a verlo. */
    const marcarVisto = () => {
      if (yaVisto.current) return;
      yaVisto.current = true;
      void marcarTutorialVistoAction();
    };

    const iniciar = (automatico: boolean) => {
      if (activo.current) return;
      activo.current = true;
      const d = driver({
        steps: construirPasos(),
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Terminar",
        closeBtnLabel: "Cerrar",
        popoverClass: "ta-tour",
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 14,
        // «No volver a mostrar» en cada paso, debajo de los botones.
        onPopoverRender: (popover) => {
          const omitir = document.createElement("button");
          omitir.type = "button";
          omitir.className = "ta-tour-omitir";
          omitir.textContent = "No volver a mostrar";
          omitir.addEventListener("click", () => {
            marcarVisto();
            d.destroy();
          });
          popover.wrapper.appendChild(omitir);
        },
        // Llegar al último paso cuenta como terminado; la X antes de eso
        // solo lo pospone (vuelve a abrirse solo mañana).
        onDestroyStarted: () => {
          if (d.isLastStep()) marcarVisto();
          d.destroy();
        },
        onDestroyed: () => {
          activo.current = false;
          // El día cuenta cuando el agente la cierra (no al abrirse): si la
          // página se recarga antes de que la vea, vuelve a salir.
          if (automatico && !yaVisto.current)
            void marcarTutorialMostradoAction();
        },
      });
      d.drive();
    };

    const manual = () => iniciar(false);
    window.addEventListener(EVENTO, manual);
    // Espera a que la página termine de pintarse.
    const t = autoIniciar
      ? window.setTimeout(() => iniciar(true), 700)
      : undefined;
    return () => {
      window.removeEventListener(EVENTO, manual);
      if (t) window.clearTimeout(t);
    };
  }, [autoIniciar]);

  return null;
}
