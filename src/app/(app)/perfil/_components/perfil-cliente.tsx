"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { PeopleTable, type PeopleRow } from "@/components/domain/people-table";
import type {
  ContactoAtencion,
  DireccionBroker,
  PerfilBroker,
} from "@/lib/api/brokers";
import {
  actualizarPerfilAction,
  cambiarPasswordAction,
  subirLogoAction,
} from "../_actions";

const filledInput = "border-brand-navy/30 bg-transparent";

const perfilSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre"),
  apellido_paterno: z.string().trim().min(2, "Ingresa tu apellido paterno"),
  apellido_materno: z
    .string()
    .trim()
    .max(150, "Apellido materno demasiado largo")
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .trim()
    .min(8, "Ingresa un teléfono válido")
    .regex(/^[0-9+\-\s()]+$/, "Solo números y símbolos de teléfono"),
  domicilio: z.string().trim().min(3, "Ingresa tu domicilio"),
  estado: z.string().trim().min(2, "Ingresa tu estado"),
  ciudad: z.string().trim().min(2, "Ingresa tu ciudad"),
  codigo_postal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
});

type PerfilInput = z.infer<typeof perfilSchema>;

const passwordSchema = z
  .object({
    password_actual: z.string().min(1, "Escribe tu contraseña actual"),
    password_nueva: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{10,}$/,
        "Tu contraseña debe tener al menos 10 caracteres, con mayúsculas, minúsculas, números y un símbolo.",
      ),
    password_nueva_confirmation: z.string(),
  })
  .refine((d) => d.password_nueva === d.password_nueva_confirmation, {
    path: ["password_nueva_confirmation"],
    message: "Las contraseñas no coinciden",
  })
  .refine((d) => d.password_nueva !== d.password_actual, {
    path: ["password_nueva"],
    message: "La nueva contraseña debe ser distinta a la actual.",
  });

type PasswordInput = z.infer<typeof passwordSchema>;

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function direccionPrincipal(
  direcciones: DireccionBroker[],
): DireccionBroker | null {
  if (direcciones.length === 0) return null;
  return direcciones.find((d) => d.principal) ?? direcciones[0] ?? null;
}

function contactosToRows(contactos: ContactoAtencion[]): PeopleRow[] {
  return contactos.map((c, i) => ({
    id: c.id ? String(c.id) : `existente-${i}`,
    nombre: c.nombre,
    telefono: c.telefono,
  }));
}

function rowsToContactos(rows: PeopleRow[]): ContactoAtencion[] {
  return rows.map((r) => {
    const numericId = Number(r.id);
    const out: ContactoAtencion = {
      nombre: r.nombre,
      telefono: r.telefono,
    };
    if (Number.isInteger(numericId) && numericId > 0) out.id = numericId;
    return out;
  });
}

type Props = { initial: PerfilBroker };

export function PerfilCliente({ initial }: Props) {
  const [perfil, setPerfil] = useState<PerfilBroker>(initial);
  const [contactos, setContactos] = useState<PeopleRow[]>(
    contactosToRows(initial.contactos_atencion),
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initial.logo_url ?? null,
  );
  const [submittingPerfil, startPerfilTransition] = useTransition();
  const [submittingPassword, startPasswordTransition] = useTransition();
  const [submittingLogo, startLogoTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const direccion = direccionPrincipal(perfil.direcciones);

  const perfilForm = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: perfil.nombre,
      apellido_paterno: perfil.apellido_paterno,
      apellido_materno: perfil.apellido_materno ?? "",
      telefono: perfil.telefono ?? "",
      domicilio: direccion?.domicilio ?? "",
      estado: direccion?.estado ?? "",
      ciudad: direccion?.ciudad ?? "",
      codigo_postal: direccion?.codigo_postal ?? "",
    },
  });

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password_actual: "",
      password_nueva: "",
      password_nueva_confirmation: "",
    },
  });

  const submitPerfil = perfilForm.handleSubmit((values) => {
    startPerfilTransition(async () => {
      const direccionPayload: DireccionBroker = {
        ...(direccion?.id ? { id: direccion.id } : {}),
        domicilio: values.domicilio,
        estado: values.estado,
        ciudad: values.ciudad,
        codigo_postal: values.codigo_postal,
        principal: true,
      };

      const result = await actualizarPerfilAction({
        nombre: values.nombre,
        apellido_paterno: values.apellido_paterno,
        apellido_materno: values.apellido_materno || null,
        telefono: values.telefono,
        direcciones: [direccionPayload],
        contactos_atencion: rowsToContactos(contactos),
      });

      if (result.ok) {
        setPerfil(result.data);
        setContactos(contactosToRows(result.data.contactos_atencion));
        setLogoUrl(result.data.logo_url ?? null);
        toast.success("Perfil actualizado.");
      } else {
        toast.error(result.message);
      }
    });
  });

  const submitPassword = passwordForm.handleSubmit((values) => {
    startPasswordTransition(async () => {
      const result = await cambiarPasswordAction(values);
      if (result.ok) {
        toast.success(
          "Contraseña actualizada. Te enviamos un correo confirmando el cambio.",
        );
        passwordForm.reset();
      } else if (result.code === "password_actual_incorrecta") {
        passwordForm.setError("password_actual", {
          type: "server",
          message: result.message,
        });
      } else {
        toast.error(result.message);
      }
    });
  });

  const onLogoSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("El logo debe ser una imagen (PNG, JPG o similar).");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("El logo no debe pesar más de 2 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    startLogoTransition(async () => {
      const result = await subirLogoAction(formData);
      if (result.ok) {
        setPerfil(result.data);
        setLogoUrl(result.data.logo_url ?? null);
        toast.success("Logo actualizado.");
      } else {
        toast.error(result.message);
      }
    });
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-brand-navy text-xl font-bold">Mi perfil</h1>

      <form onSubmit={submitPerfil} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={128}
                  height={128}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-brand-navy text-xs font-semibold">
                  Sin logo
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={submittingLogo}
                className="bg-brand-navy hover:bg-brand-navy-hover flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-50"
                aria-label={
                  submittingLogo ? "Subiendo logo..." : "Cambiar logo"
                }
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLogoSelected(file);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-brand-navy text-base font-bold">
              Datos personales
            </h2>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Nombre(s)"
                htmlFor="nombre"
                error={perfilForm.formState.errors.nombre?.message}
              >
                <Input
                  id="nombre"
                  className={filledInput}
                  disabled={submittingPerfil}
                  {...perfilForm.register("nombre")}
                />
              </Field>
              <Field
                label="Apellido paterno"
                htmlFor="apellido_paterno"
                error={perfilForm.formState.errors.apellido_paterno?.message}
              >
                <Input
                  id="apellido_paterno"
                  className={filledInput}
                  disabled={submittingPerfil}
                  {...perfilForm.register("apellido_paterno")}
                />
              </Field>
              <Field
                label="Apellido materno"
                htmlFor="apellido_materno"
                error={perfilForm.formState.errors.apellido_materno?.message}
              >
                <Input
                  id="apellido_materno"
                  className={filledInput}
                  disabled={submittingPerfil}
                  {...perfilForm.register("apellido_materno")}
                />
              </Field>
              <Field
                label="Teléfono"
                htmlFor="telefono"
                error={perfilForm.formState.errors.telefono?.message}
              >
                <Input
                  id="telefono"
                  className={filledInput}
                  disabled={submittingPerfil}
                  {...perfilForm.register("telefono")}
                />
              </Field>
              <Field label="Correo" htmlFor="email">
                <Input
                  id="email"
                  value={perfil.email}
                  readOnly
                  disabled
                  className={`${filledInput} cursor-not-allowed`}
                />
                <p className="text-xs text-neutral-500">
                  El correo no se puede modificar aquí. Si necesitas cambiarlo,
                  contáctanos.
                </p>
              </Field>
              <Field label="Cédula CNSF" htmlFor="cedula">
                <Input
                  id="cedula"
                  value={perfil.cedula}
                  readOnly
                  disabled
                  className={`${filledInput} cursor-not-allowed`}
                />
              </Field>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-4 border-t border-neutral-200 pt-6">
          <h2 className="text-brand-navy text-base font-bold">Dirección</h2>
          <Field
            label="Domicilio"
            htmlFor="domicilio"
            error={perfilForm.formState.errors.domicilio?.message}
          >
            <Input
              id="domicilio"
              className={filledInput}
              disabled={submittingPerfil}
              {...perfilForm.register("domicilio")}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="Estado"
              htmlFor="estado"
              error={perfilForm.formState.errors.estado?.message}
            >
              <Input
                id="estado"
                className={filledInput}
                disabled={submittingPerfil}
                {...perfilForm.register("estado")}
              />
            </Field>
            <Field
              label="Ciudad"
              htmlFor="ciudad"
              error={perfilForm.formState.errors.ciudad?.message}
            >
              <Input
                id="ciudad"
                className={filledInput}
                disabled={submittingPerfil}
                {...perfilForm.register("ciudad")}
              />
            </Field>
            <Field
              label="Código postal"
              htmlFor="codigo_postal"
              error={perfilForm.formState.errors.codigo_postal?.message}
            >
              <Input
                id="codigo_postal"
                className={filledInput}
                disabled={submittingPerfil}
                {...perfilForm.register("codigo_postal")}
              />
            </Field>
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-6">
          <PeopleTable
            title="Contactos de atención"
            value={contactos}
            onChange={setContactos}
            disabled={submittingPerfil}
          />
        </section>

        <div className="flex justify-center pt-4">
          <BrandButton
            type="submit"
            className="px-10"
            disabled={submittingPerfil}
          >
            {submittingPerfil ? "Guardando..." : "Guardar cambios"}
          </BrandButton>
        </div>
      </form>

      <form
        onSubmit={submitPassword}
        noValidate
        className="flex flex-col gap-4 border-t border-neutral-200 pt-6"
      >
        <h2 className="text-brand-navy text-base font-bold">
          Cambiar contraseña
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Contraseña actual"
            htmlFor="password_actual"
            error={passwordForm.formState.errors.password_actual?.message}
          >
            <PasswordInput
              id="password_actual"
              autoComplete="current-password"
              disabled={submittingPassword}
              {...passwordForm.register("password_actual")}
            />
          </Field>
          <Field
            label="Nueva contraseña"
            htmlFor="password_nueva"
            error={passwordForm.formState.errors.password_nueva?.message}
          >
            <PasswordInput
              id="password_nueva"
              autoComplete="new-password"
              disabled={submittingPassword}
              {...passwordForm.register("password_nueva")}
            />
          </Field>
          <Field
            label="Confirmar contraseña"
            htmlFor="password_nueva_confirmation"
            error={
              passwordForm.formState.errors.password_nueva_confirmation?.message
            }
          >
            <PasswordInput
              id="password_nueva_confirmation"
              autoComplete="new-password"
              disabled={submittingPassword}
              {...passwordForm.register("password_nueva_confirmation")}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <BrandButton
            type="submit"
            className="px-8"
            disabled={submittingPassword}
          >
            {submittingPassword ? "Guardando..." : "Cambiar contraseña"}
          </BrandButton>
        </div>
      </form>
    </div>
  );
}
