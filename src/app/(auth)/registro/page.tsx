"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { brokerApi } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { TERMINOS_VERSION } from "@/lib/terminos";
import {
  PRIVACIDAD_CONSENTIMIENTO,
  PRIVACIDAD_SIMPLIFICADO_PATH,
  PRIVACIDAD_VERSION,
} from "@/lib/privacidad";
import { registrarEvento } from "@/lib/analitica";
import { CorreoEnviado } from "@/components/correo-enviado";

const ERROR_FIELD_MAP: Record<string, keyof RegisterInput> = {
  email_duplicado: "email",
  cedula_invalida: "cedula",
};

export default function RegistroPage() {
  const [submitting, setSubmitting] = useState(false);
  // Registro en dos pasos: al terminar se muestra "revisa tu correo".
  const [correoEnviado, setCorreoEnviado] = useState<string | null>(null);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [privacidadAceptada, setPrivacidadAceptada] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    // Los errores aparecen al salir de cada campo; el botón de envío se
    // habilita solo cuando todo el formulario es válido (ver formularioCompleto).
    mode: "onTouched",
    defaultValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      telefono: "",
      cedula: "",
    },
  });

  const valores = useWatch({ control });
  const formularioCompleto = registerSchema.safeParse(valores).success;

  const confirmarRegistro = async (values: RegisterInput) => {
    setSubmitting(true);
    try {
      await brokerApi.registrar({
        nombre: values.nombre,
        apellido_paterno: values.apellido_paterno,
        apellido_materno: values.apellido_materno || null,
        email: values.email,
        telefono: values.telefono,
        cedula: values.cedula,
        acepta_terminos: true,
        terminos_version: TERMINOS_VERSION,
        acepta_privacidad: true,
        privacidad_version: PRIVACIDAD_VERSION,
      });

      registrarEvento("registro_completo");
      setCorreoEnviado(values.email);
    } catch (error) {
      if (error instanceof ApiError && error.code) {
        const field = ERROR_FIELD_MAP[error.code];
        if (field) {
          setError(field, { type: "server", message: error.message });
        }
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // El botón de envío queda bloqueado hasta que el formulario esté completo y
  // válido y ambas casillas estén marcadas.
  const onValid = (values: RegisterInput) => {
    void confirmarRegistro(values);
  };

  if (correoEnviado) {
    return <CorreoEnviado email={correoEnviado} />;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onValid)}
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-brand-navy text-3xl font-bold">Crear cuenta</h1>
          <p className="text-sm text-neutral-600">
            Déjanos tus datos y te enviaremos un correo para activar tu cuenta y
            crear tu contraseña.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nombre(s)"
            htmlFor="nombre"
            error={errors.nombre?.message}
          >
            <Input id="nombre" disabled={submitting} {...register("nombre")} />
          </Field>

          <Field
            label="Apellido paterno"
            htmlFor="apellido_paterno"
            error={errors.apellido_paterno?.message}
          >
            <Input
              id="apellido_paterno"
              disabled={submitting}
              {...register("apellido_paterno")}
            />
          </Field>

          <Field
            label={
              <>
                Apellido materno
                <span className="ml-1 text-xs font-normal text-neutral-400">
                  (opcional)
                </span>
              </>
            }
            htmlFor="apellido_materno"
            error={errors.apellido_materno?.message}
          >
            <Input
              id="apellido_materno"
              disabled={submitting}
              {...register("apellido_materno")}
            />
          </Field>

          <Field
            label="Cédula CNSF"
            htmlFor="cedula"
            error={errors.cedula?.message}
          >
            <Input
              id="cedula"
              autoCapitalize="characters"
              placeholder="Ej. A123456"
              disabled={submitting}
              {...register("cedula")}
            />
          </Field>

          <Field label="Correo" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={submitting}
              {...register("email")}
            />
          </Field>

          <Field
            label="Teléfono celular"
            htmlFor="telefono"
            error={errors.telefono?.message}
          >
            <Input
              id="telefono"
              type="tel"
              autoComplete="tel"
              disabled={submitting}
              {...register("telefono")}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-neutral-100 p-4 text-xs leading-relaxed text-neutral-600">
            <input
              type="checkbox"
              checked={terminosAceptados}
              onChange={(e) => setTerminosAceptados(e.target.checked)}
              className="accent-brand-navy mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
            />
            <span>
              He leído y acepto los{" "}
              <a
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy font-semibold hover:underline"
              >
                Términos y Condiciones
              </a>
              .
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-neutral-100 p-4 text-xs leading-relaxed text-neutral-600">
            <input
              type="checkbox"
              checked={privacidadAceptada}
              onChange={(e) => setPrivacidadAceptada(e.target.checked)}
              className="accent-brand-navy mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
            />
            <span>
              {PRIVACIDAD_CONSENTIMIENTO.pre}
              <a
                href={PRIVACIDAD_SIMPLIFICADO_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy font-semibold hover:underline"
              >
                {PRIVACIDAD_CONSENTIMIENTO.simplificado}
              </a>
              {PRIVACIDAD_CONSENTIMIENTO.mid}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy font-semibold hover:underline"
              >
                totalclaimassist.app/privacidad
              </a>
              {PRIVACIDAD_CONSENTIMIENTO.post}
            </span>
          </label>
        </div>

        <div className="flex justify-center">
          <BrandButton
            type="submit"
            disabled={
              submitting ||
              !formularioCompleto ||
              !terminosAceptados ||
              !privacidadAceptada
            }
          >
            {submitting ? "Registrando..." : "Crear cuenta"}
          </BrandButton>
        </div>

        <Separator />

        <p className="text-brand-navy text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold italic hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </>
  );
}
