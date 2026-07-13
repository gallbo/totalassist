"use client";

import { useEffect } from "react";
import {
  useFieldArray,
  useWatch,
  Controller,
  type Control,
  type UseFormRegister,
  type FieldArrayPath,
  type FieldPath,
} from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select-input";
import { BrandButton } from "@/components/ui/brand-button";
import type { NuevoCasoSchema } from "../nuevo/_schema";
import type { CasoAsegurado, Estado } from "@/lib/api/brokers";

type Ctl = Control<NuevoCasoSchema>;
type Reg = UseFormRegister<NuevoCasoSchema>;

// Helpers de paths: RHF tipa los nombres dinámicos como template-literals; los
// componentes reciben el prefijo del asegurado o representante y arman las rutas.
function path(p: string) {
  return p as FieldPath<NuevoCasoSchema>;
}
function arrayPath(p: string) {
  return p as FieldArrayPath<NuevoCasoSchema>;
}

export function aseguradoFisicaVacio() {
  return {
    tipo_persona: "fisica" as const,
    nombre: "",
    rfc: "",
    correo: "",
    telefono: "",
    direcciones: [],
    contactos_atencion: [],
  };
}

export function aseguradoMoralVacio() {
  return {
    tipo_persona: "moral" as const,
    razon_social: "",
    nombre_comercial: "",
    rfc: "",
    correo: "",
    telefono: "",
    representantes: [representanteVacio()],
  };
}

function representanteVacio() {
  return {
    nombre: "",
    cargo: "",
    rfc: "",
    correo: "",
    telefono: "",
    direcciones: [],
    contactos_atencion: [],
  };
}

// Convierte la forma del form (estado_id como string del select, strings vacíos)
// a la del API (estado_id número o null, vacíos como null).
type AseguradosForm = NuevoCasoSchema["asegurados"];
type DireccionForm = NonNullable<AseguradosForm[number]["direcciones"]>[number];
type ContactoForm = NonNullable<
  AseguradosForm[number]["contactos_atencion"]
>[number];

function normDireccion(d: DireccionForm) {
  return {
    domicilio: d.domicilio || null,
    estado_id: d.estado_id ? Number(d.estado_id) : null,
    ciudad: d.ciudad || null,
    codigo_postal: d.codigo_postal || null,
  };
}

function normContacto(c: ContactoForm) {
  return {
    nombre: c.nombre || null,
    telefono: c.telefono || null,
    email: c.email || null,
    relacion_asegurado: c.relacion_asegurado || null,
  };
}

// Convierte la forma del API (edición) a la del form: estado_id número → string,
// nulls → "". Si no hay asegurados (caso legacy) arranca con una física vacía.
function dirAForm(d: NonNullable<CasoAsegurado["direcciones"]>[number]) {
  return {
    domicilio: d.domicilio ?? "",
    estado_id: d.estado_id != null ? String(d.estado_id) : "",
    ciudad: d.ciudad ?? "",
    codigo_postal: d.codigo_postal ?? "",
  };
}

function contactoAForm(
  c: NonNullable<CasoAsegurado["contactos_atencion"]>[number],
) {
  return {
    nombre: c.nombre ?? "",
    telefono: c.telefono ?? "",
    email: c.email ?? "",
    relacion_asegurado: c.relacion_asegurado ?? "",
  };
}

export function aseguradosAForm(
  asegurados: CasoAsegurado[] | undefined,
): AseguradosForm {
  if (!asegurados || asegurados.length === 0) {
    return [aseguradoFisicaVacio()];
  }
  return asegurados.map((a) => {
    const base = {
      nombre: a.nombre ?? "",
      razon_social: a.razon_social ?? "",
      nombre_comercial: a.nombre_comercial ?? "",
      rfc: a.rfc ?? "",
      correo: a.correo ?? "",
      telefono: a.telefono ?? "",
    };
    if (a.tipo_persona === "moral") {
      return {
        ...base,
        tipo_persona: "moral" as const,
        representantes: (a.representantes ?? []).map((r) => ({
          nombre: r.nombre ?? "",
          cargo: r.cargo ?? "",
          rfc: r.rfc ?? "",
          correo: r.correo ?? "",
          telefono: r.telefono ?? "",
          direcciones: (r.direcciones ?? []).map(dirAForm),
          contactos_atencion: (r.contactos_atencion ?? []).map(contactoAForm),
        })),
      };
    }
    return {
      ...base,
      tipo_persona: "fisica" as const,
      direcciones: (a.direcciones ?? []).map(dirAForm),
      contactos_atencion: (a.contactos_atencion ?? []).map(contactoAForm),
    };
  });
}

export function normalizarAsegurados(
  asegurados: AseguradosForm,
): CasoAsegurado[] {
  return asegurados.map((a) => {
    const base = {
      tipo_persona: a.tipo_persona,
      nombre: a.nombre || null,
      razon_social: a.razon_social || null,
      nombre_comercial: a.nombre_comercial || null,
      rfc: a.rfc || null,
      correo: a.correo || null,
      telefono: a.telefono || null,
    };
    if (a.tipo_persona === "moral") {
      return {
        ...base,
        representantes: (a.representantes ?? []).map((r) => ({
          nombre: r.nombre || null,
          cargo: r.cargo || null,
          rfc: r.rfc || null,
          correo: r.correo || null,
          telefono: r.telefono || null,
          direcciones: (r.direcciones ?? []).map(normDireccion),
          contactos_atencion: (r.contactos_atencion ?? []).map(normContacto),
        })),
      };
    }
    return {
      ...base,
      direcciones: (a.direcciones ?? []).map(normDireccion),
      contactos_atencion: (a.contactos_atencion ?? []).map(normContacto),
    };
  });
}

function BotonAgregar({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-brand-navy hover:text-brand-navy-hover flex min-h-11 items-center gap-1 self-start text-sm font-semibold"
    >
      <Plus className="h-4 w-4" /> {children}
    </button>
  );
}

function DireccionesField({
  control,
  register,
  estados,
  prefijo,
}: {
  control: Ctl;
  register: Reg;
  estados: Estado[];
  prefijo: string;
}) {
  const fa = useFieldArray({
    control,
    name: arrayPath(`${prefijo}.direcciones`),
  });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
        Direcciones
      </p>
      {fa.fields.map((f, i) => (
        <div
          key={f.id}
          className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_1.2fr_1fr_0.8fr_auto]"
        >
          <Input
            placeholder="Domicilio"
            {...register(path(`${prefijo}.direcciones.${i}.domicilio`))}
          />
          <Controller
            control={control}
            name={path(`${prefijo}.direcciones.${i}.estado_id`)}
            render={({ field }) => (
              <SelectInput
                value={(field.value as string) ?? ""}
                onValueChange={field.onChange}
                placeholder="Estado"
                options={estados.map((e) => ({
                  value: String(e.id),
                  label: e.nombre,
                }))}
              />
            )}
          />
          <Input
            placeholder="Ciudad"
            {...register(path(`${prefijo}.direcciones.${i}.ciudad`))}
          />
          <Input
            placeholder="C.P."
            {...register(path(`${prefijo}.direcciones.${i}.codigo_postal`))}
          />
          <button
            type="button"
            onClick={() => fa.remove(i)}
            className="bg-brand-navy hover:bg-brand-navy-hover flex h-10 w-10 items-center justify-center self-end rounded-full text-white"
            aria-label="Eliminar dirección"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <BotonAgregar
        onClick={() =>
          fa.append({
            domicilio: "",
            estado_id: "",
            ciudad: "",
            codigo_postal: "",
          })
        }
      >
        Agregar dirección
      </BotonAgregar>
    </div>
  );
}

function ContactosField({
  control,
  register,
  prefijo,
}: {
  control: Ctl;
  register: Reg;
  prefijo: string;
}) {
  const fa = useFieldArray({
    control,
    name: arrayPath(`${prefijo}.contactos_atencion`),
  });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
        Contactos de atención
      </p>
      {fa.fields.map((f, i) => (
        <div
          key={f.id}
          className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <Input
            placeholder="Nombre"
            {...register(path(`${prefijo}.contactos_atencion.${i}.nombre`))}
          />
          <Input
            placeholder="Teléfono"
            {...register(path(`${prefijo}.contactos_atencion.${i}.telefono`))}
          />
          <Input
            placeholder="Correo"
            {...register(path(`${prefijo}.contactos_atencion.${i}.email`))}
          />
          <Input
            placeholder="Relación con el asegurado"
            {...register(
              path(`${prefijo}.contactos_atencion.${i}.relacion_asegurado`),
            )}
          />
          <button
            type="button"
            onClick={() => fa.remove(i)}
            className="bg-brand-navy hover:bg-brand-navy-hover flex h-10 w-10 items-center justify-center self-end rounded-full text-white"
            aria-label="Eliminar contacto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <BotonAgregar
        onClick={() =>
          fa.append({
            nombre: "",
            telefono: "",
            email: "",
            relacion_asegurado: "",
          })
        }
      >
        Agregar contacto
      </BotonAgregar>
    </div>
  );
}

function RepresentantesField({
  control,
  register,
  estados,
  prefijo,
}: {
  control: Ctl;
  register: Reg;
  estados: Estado[];
  prefijo: string;
}) {
  const fa = useFieldArray({
    control,
    name: arrayPath(`${prefijo}.representantes`),
  });
  return (
    <div className="flex flex-col gap-3">
      <p className="text-brand-navy text-sm font-bold">
        Representantes / apoderados legales
      </p>
      {fa.fields.map((f, i) => (
        <div
          key={f.id}
          className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-700">
              Representante {i + 1}
            </span>
            <button
              type="button"
              onClick={() => fa.remove(i)}
              className="text-neutral-500 hover:text-red-600"
              aria-label="Eliminar representante"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              placeholder="Nombre"
              {...register(path(`${prefijo}.representantes.${i}.nombre`))}
            />
            <Input
              placeholder="Cargo"
              {...register(path(`${prefijo}.representantes.${i}.cargo`))}
            />
            <Input
              placeholder="RFC"
              {...register(path(`${prefijo}.representantes.${i}.rfc`))}
            />
            <Input
              placeholder="Correo"
              {...register(path(`${prefijo}.representantes.${i}.correo`))}
            />
            <Input
              placeholder="Teléfono"
              {...register(path(`${prefijo}.representantes.${i}.telefono`))}
            />
          </div>
          <DireccionesField
            control={control}
            register={register}
            estados={estados}
            prefijo={`${prefijo}.representantes.${i}`}
          />
          <ContactosField
            control={control}
            register={register}
            prefijo={`${prefijo}.representantes.${i}`}
          />
        </div>
      ))}
      <BotonAgregar onClick={() => fa.append(representanteVacio())}>
        Agregar representante
      </BotonAgregar>
    </div>
  );
}

// Sección "Asegurados". En AUTO permite elegir física (N asegurados) o moral
// (un asegurado + N representantes). Fuera de AUTO siempre es física.
export function AseguradosFields({
  control,
  register,
  estados,
  esAuto,
}: {
  control: Ctl;
  register: Reg;
  estados: Estado[];
  esAuto: boolean;
}) {
  const fa = useFieldArray({ control, name: "asegurados" });
  const { replace } = fa;
  // El modo se deriva del primer asegurado. El toggle usa replace() del propio
  // field array (setValue desde el padre no sincroniza useFieldArray del hijo).
  const tipo = useWatch({ control, name: "asegurados.0.tipo_persona" });
  const modo: "fisica" | "moral" = tipo === "moral" ? "moral" : "fisica";

  const cambiarModo = (m: "fisica" | "moral") => {
    replace([m === "moral" ? aseguradoMoralVacio() : aseguradoFisicaVacio()]);
  };

  // Persona moral solo aplica en AUTO: al salir de AUTO se vuelve a física.
  useEffect(() => {
    if (!esAuto && modo === "moral") {
      replace([aseguradoFisicaVacio()]);
    }
  }, [esAuto, modo, replace]);

  return (
    <div className="flex flex-col gap-4">
      {esAuto ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-600">
            Tipo de asegurado:
          </span>
          {(["fisica", "moral"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => cambiarModo(m)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-semibold " +
                (modo === m
                  ? "bg-brand-yellow text-brand-navy"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300")
              }
            >
              {m === "fisica" ? "Persona física" : "Persona moral"}
            </button>
          ))}
        </div>
      ) : null}

      {modo === "moral" ? (
        // Un solo asegurado moral con sus representantes.
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              placeholder="Razón / Denominación social"
              {...register(path("asegurados.0.razon_social"))}
            />
            <Input
              placeholder="Nombre comercial"
              {...register(path("asegurados.0.nombre_comercial"))}
            />
            <Input placeholder="RFC" {...register(path("asegurados.0.rfc"))} />
            <Input
              placeholder="Correo"
              {...register(path("asegurados.0.correo"))}
            />
            <Input
              placeholder="Teléfono"
              {...register(path("asegurados.0.telefono"))}
            />
          </div>
          <RepresentantesField
            control={control}
            register={register}
            estados={estados}
            prefijo="asegurados.0"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {fa.fields.map((f, i) => (
            <div
              key={f.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-brand-navy text-sm font-bold">
                  Asegurado {i + 1}
                </span>
                {fa.fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => fa.remove(i)}
                    className="text-neutral-500 hover:text-red-600"
                    aria-label="Eliminar asegurado"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  placeholder="Nombre completo"
                  {...register(path(`asegurados.${i}.nombre`))}
                />
                <Input
                  placeholder="RFC"
                  {...register(path(`asegurados.${i}.rfc`))}
                />
                <Input
                  placeholder="Correo"
                  {...register(path(`asegurados.${i}.correo`))}
                />
                <Input
                  placeholder="Teléfono"
                  {...register(path(`asegurados.${i}.telefono`))}
                />
              </div>
              <DireccionesField
                control={control}
                register={register}
                estados={estados}
                prefijo={`asegurados.${i}`}
              />
              <ContactosField
                control={control}
                register={register}
                prefijo={`asegurados.${i}`}
              />
            </div>
          ))}
          <BrandButton
            type="button"
            tone="secondary"
            className="w-full sm:w-auto sm:self-start"
            onClick={() => fa.append(aseguradoFisicaVacio())}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar asegurado
          </BrandButton>
        </div>
      )}
    </div>
  );
}
