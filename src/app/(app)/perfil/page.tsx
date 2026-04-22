import Link from "next/link";
import { MessageSquare, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandButton } from "@/components/ui/brand-button";
import { PageCard } from "@/components/layout/page-card";
import { StarRating } from "@/components/domain/star-rating";
import { PeopleTable } from "@/components/domain/people-table";
import { broker, contactosAtencion } from "@/lib/mocks";

const filledInput = "border-brand-navy/30 bg-transparent";

export default function PerfilPage() {
  return (
    <PageCard>
      <div className="flex flex-col gap-6">
        <h1 className="text-brand-navy text-xl font-bold">Mi perfil</h1>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
              <span className="text-brand-navy text-xs font-semibold">
                {broker.agencia}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-brand-navy flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Editar logo"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="bg-brand-navy flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Eliminar logo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <h2 className="text-brand-navy text-base font-bold">
                Información del asegurado
              </h2>
              <Link
                href="/dashboard/comentarios"
                className="text-brand-navy/70 hover:text-brand-navy text-sm"
              >
                Ver comentarios ›
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-600">Nombre(s)</span>
                <Input defaultValue={broker.nombre} className={filledInput} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-600">Apellidos(s)</span>
                <Input
                  defaultValue={broker.apellidos}
                  className={filledInput}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-600">Correo</span>
                <Input defaultValue={broker.correo} className={filledInput} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-600">Teléfono</span>
                <Input defaultValue={broker.telefono} className={filledInput} />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-neutral-600">
                  Feedback de clientes
                </span>
                <StarRating value={broker.rating} />
              </div>
              <Button
                variant="secondary"
                className="bg-brand-navy hover:bg-brand-navy-hover h-10 rounded-full px-5 text-white hover:text-white"
                render={<Link href="/dashboard/comentarios" />}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Ver comentarios
              </Button>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
          <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-600">Domicilio</span>
            <Input defaultValue={broker.domicilio} className={filledInput} />
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-600">Estado</span>
              <Input defaultValue={broker.estado} className={filledInput} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-600">Ciudad</span>
              <Input defaultValue={broker.ciudad} className={filledInput} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-600">Código postal</span>
              <Input
                defaultValue={broker.codigoPostal}
                className={filledInput}
              />
            </label>
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-6">
          <PeopleTable
            title="Contacto de atención"
            initial={contactosAtencion}
          />
        </section>

        <div className="flex justify-center pt-4">
          <BrandButton className="px-10">Editar</BrandButton>
        </div>
      </div>
    </PageCard>
  );
}
