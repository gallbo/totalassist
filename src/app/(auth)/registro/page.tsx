"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { brokerApi } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { TERMINOS_VERSION } from "@/lib/terminos";
import { TerminosModal } from "@/components/terminos-modal";

const ERROR_FIELD_MAP: Record<string, keyof RegisterInput> = {
  email_duplicado: "email",
  cedula_invalida: "cedula",
};

export default function RegistroPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      telefono: "",
      cedula: "",
      password: "",
      password_confirmation: "",
      acepta_terminos: false,
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setSubmitting(true);
    try {
      await brokerApi.registrar({
        nombre: values.nombre,
        apellido_paterno: values.apellido_paterno,
        apellido_materno: values.apellido_materno || null,
        email: values.email,
        telefono: values.telefono,
        cedula: values.cedula,
        password: values.password,
        acepta_terminos: values.acepta_terminos,
        terminos_version: TERMINOS_VERSION,
      });

      toast.success("Cuenta creada. Inicia sesión con tus credenciales.");
      router.push("/login");
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <h1 className="text-brand-navy text-center text-3xl font-bold">
        Crear cuenta
      </h1>

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
          label="Apellido materno"
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
          label="Teléfono"
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

        <Field
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            disabled={submitting}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirmar contraseña"
          htmlFor="password_confirmation"
          error={errors.password_confirmation?.message}
        >
          <PasswordInput
            id="password_confirmation"
            autoComplete="new-password"
            disabled={submitting}
            {...register("password_confirmation")}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3 text-sm text-neutral-600">
          <input
            id="acepta_terminos"
            type="checkbox"
            disabled={submitting}
            className="text-brand-navy focus:ring-brand-navy/20 mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-300"
            {...register("acepta_terminos")}
          />
          <label htmlFor="acepta_terminos">
            He leído y acepto los{" "}
            <TerminosModal triggerClassName="text-brand-navy font-medium underline" />{" "}
            y el aviso de privacidad.
          </label>
        </div>
        {errors.acepta_terminos && (
          <p className="text-state-danger text-xs font-medium">
            {errors.acepta_terminos.message}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <BrandButton type="submit" disabled={submitting}>
          {submitting ? "Registrando..." : "Registrarme"}
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
  );
}
