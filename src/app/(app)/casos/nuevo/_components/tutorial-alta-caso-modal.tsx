"use client";

import { useState, useSyncExternalStore } from "react";
import { Modal } from "@/components/ui/modal";
import { BrandButton } from "@/components/ui/brand-button";

const VIDEO_URL =
  "https://sttcamediaprod.blob.core.windows.net/tutoriales/alta-de-caso.mp4";
const STORAGE_KEY = "tutorial_alta_caso_omitir";

// Lee la preferencia "no volver a mostrar" de localStorage de forma segura para
// SSR: en el servidor devuelve true (modal oculto, sin parpadeo ni mismatch de
// hidratacion); en el cliente lee el valor real tras la hidratacion.
function useTutorialOmitido() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => true,
  );
}

export function TutorialAltaCasoModal() {
  const omitido = useTutorialOmitido();
  const [cerrado, setCerrado] = useState(false);
  const [noMostrar, setNoMostrar] = useState(false);

  const cerrar = () => {
    if (noMostrar) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // localStorage no disponible: se mostrara de nuevo la proxima vez.
      }
    }
    setCerrado(true);
  };

  return (
    <Modal
      open={!omitido && !cerrado}
      onClose={cerrar}
      title="¿Cómo dar de alta un caso?"
      className="max-w-2xl"
      footer={
        <>
          <label className="mr-auto flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={noMostrar}
              onChange={(e) => setNoMostrar(e.target.checked)}
              className="text-brand-navy h-4 w-4 rounded border-neutral-300"
            />
            No volver a mostrar
          </label>
          <BrandButton type="button" onClick={cerrar}>
            Omitir
          </BrandButton>
        </>
      }
    >
      <p className="mb-3 text-sm text-neutral-600">
        Mira este breve tutorial para registrar un caso paso a paso.
      </p>
      <video
        controls
        preload="metadata"
        className="aspect-video w-full rounded-xl bg-black"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
    </Modal>
  );
}
