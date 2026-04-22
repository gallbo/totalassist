import { notFound } from "next/navigation";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/layout/page-card";
import { CasoStepper } from "@/components/domain/caso-stepper";
import { CasoEstatusBadge } from "@/components/domain/caso-estatus-badge";
import { PeopleTable } from "@/components/domain/people-table";
import { ArchivosTable } from "@/components/domain/archivos-table";
import { UploadZone } from "@/components/domain/upload-zone";
import { EvaluacionSection } from "@/components/domain/evaluacion-section";
import { casos } from "@/lib/mocks";

const filledInput = "border-brand-navy/30 bg-transparent";

export default async function CasoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caso = casos.find((c) => c.id === id);
  if (!caso) notFound();

  const esTerminado =
    caso.estatus === "finalizado" || caso.estatus === "indemnizado";

  return (
    <PageCard>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-brand-navy text-xl font-bold">
            Folio: {caso.folio}
          </h1>
          <CasoEstatusBadge estatus={caso.estatus} className="text-base" />
        </div>

        <CasoStepper current={caso.etapa} />

        <p className="text-brand-navy/80 text-center text-sm">
          {caso.etapaLabel}
        </p>

        <div className="flex flex-col gap-3 border-t border-b border-neutral-200 py-4 md:flex-row md:items-start md:justify-between">
          <dl className="grid flex-1 grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-neutral-500">Póliza</dt>
              <dd className="text-brand-navy font-medium">{caso.poliza}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Tipo</dt>
              <dd className="text-brand-navy font-medium">{caso.tipo}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Fecha inicial</dt>
              <dd className="text-brand-navy font-medium">
                {caso.fechaInicial}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Tiempo transcurrido</dt>
              <dd className="text-brand-navy font-medium">
                {caso.tiempoDias} días
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Tipo de persona</dt>
              <dd className="text-brand-navy font-medium">
                {caso.personaFisica ? "Persona física" : "Persona moral"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Aseguradora</dt>
              <dd className="text-brand-navy font-medium">
                {caso.aseguradora}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Fecha final</dt>
              <dd className="text-brand-navy font-medium">{caso.fechaFinal}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Broker</dt>
              <dd className="text-brand-navy font-medium">{caso.broker}</dd>
            </div>
          </dl>

          <Button
            variant="outline"
            className="text-brand-navy self-start rounded-full bg-white px-5 py-2 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            <Link2 className="mr-2 h-4 w-4" /> Copiar link
          </Button>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-brand-navy text-base font-bold">
            Información del asegurado
          </h2>

          {caso.personaFisica && caso.fisica ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LabeledInput label="Nombre(s)" value={caso.fisica.nombres} />
              <LabeledInput
                label="Apellidos(s)"
                value={caso.fisica.apellidos}
              />
              <LabeledInput label="Correo" value={caso.fisica.correo} />
              <LabeledInput label="Teléfono" value={caso.fisica.telefono} />
            </div>
          ) : caso.moral ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <LabeledInput
                  label="Razón social"
                  value={caso.moral.razonSocial}
                />
                <LabeledInput
                  label="Nombre comercial"
                  value={caso.moral.nombreComercial}
                />
                <LabeledInput
                  label="Identidad fiscal"
                  value={caso.moral.identidadFiscal}
                />
              </div>
              <h3 className="text-brand-navy pt-2 text-sm font-semibold">
                Representante legal
              </h3>
              <LabeledInput
                label="Nombre"
                value={caso.moral.representante.nombre}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <LabeledInput
                  label="Correo"
                  value={caso.moral.representante.correo}
                />
                <LabeledInput
                  label="Teléfono"
                  value={caso.moral.representante.telefono}
                />
              </div>
            </>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
          <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
          <LabeledInput label="Domicilio" value={caso.direccion.domicilio} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LabeledInput label="Estado" value={caso.direccion.estado} />
            <LabeledInput label="Ciudad" value={caso.direccion.ciudad} />
            <LabeledInput
              label="Código postal"
              value={caso.direccion.codigoPostal}
            />
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-6">
          <PeopleTable
            title="Contacto de atención"
            initial={caso.contactosAtencion}
          />
        </section>

        {caso.personaFisica && (
          <section className="border-t border-neutral-200 pt-6">
            <PeopleTable title="Beneficiarios" initial={caso.beneficiarios} />
          </section>
        )}

        {caso.archivos.length > 0 && (
          <section className="border-t border-neutral-200 pt-6">
            <ArchivosTable initial={caso.archivos} />
          </section>
        )}

        {!esTerminado && (
          <section className="border-t border-neutral-200 pt-6">
            <UploadZone />
          </section>
        )}

        {esTerminado && (
          <section className="border-t border-neutral-200 pt-6">
            <EvaluacionSection />
          </section>
        )}

        {!esTerminado && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-6">
            <Button
              variant="outline"
              className="bg-brand-navy hover:bg-brand-navy-hover h-11 rounded-full px-6 text-white hover:text-white"
              render={<Link href="/casos" />}
            >
              Cancelar
            </Button>
            <BrandButton tone="secondary" className="px-8">
              Guardar
            </BrandButton>
          </div>
        )}
      </div>
    </PageCard>
  );
}

function LabeledInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-neutral-600">{label}</span>
      <Input defaultValue={value} className={filledInput} />
    </label>
  );
}
