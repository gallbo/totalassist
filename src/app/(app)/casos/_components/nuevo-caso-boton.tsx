"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { Modal } from "@/components/ui/modal";
import { MensajeAltaDemanda } from "@/components/mensaje-alta-demanda";

export function NuevoCasoBoton({
  habilitado,
  tieneCupo,
}: {
  habilitado: boolean;
  tieneCupo: boolean;
}) {
  const [open, setOpen] = useState(false);

  const bloqueo = !habilitado ? "alta_demanda" : !tieneCupo ? "sin_cupo" : null;

  if (!bloqueo) {
    return (
      <BrandButton
        type="button"
        render={<Link href="/casos/nuevo" />}
        className="h-11 px-6"
      >
        <Plus className="mr-1 h-4 w-4" /> Nuevo caso
      </BrandButton>
    );
  }

  return (
    <>
      <BrandButton
        type="button"
        className="h-11 px-6"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-1 h-4 w-4" /> Nuevo caso
      </BrandButton>

      {bloqueo === "alta_demanda" ? (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Registro de casos en pausa"
          footer={
            <BrandButton
              type="button"
              className="h-10 px-6"
              onClick={() => setOpen(false)}
            >
              Aceptar
            </BrandButton>
          }
        >
          <MensajeAltaDemanda />
        </Modal>
      ) : (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Sin casos disponibles"
          footer={
            <>
              <BrandButton
                type="button"
                tone="secondary"
                className="h-10 px-6"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </BrandButton>
              <BrandButton
                type="button"
                render={<Link href="/paquetes" />}
                className="h-10 px-6"
              >
                Ver mis paquetes
              </BrandButton>
            </>
          }
        >
          Ya usaste todos los casos disponibles de tu paquete. Revisa tus
          paquetes para conocer la vigencia y los casos restantes.
        </Modal>
      )}
    </>
  );
}
