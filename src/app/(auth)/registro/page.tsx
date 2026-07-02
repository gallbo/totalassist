"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check } from "lucide-react";
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
  const [terminosOpen, setTerminosOpen] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [pendiente, setPendiente] = useState<RegisterInput | null>(null);

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
    },
  });

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
        password: values.password,
        acepta_terminos: true,
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

  // Formulario valido: si ya aceptó los términos, reintenta el registro directo
  // (sin volver a abrir el modal). Si no, abre el modal de términos.
  const onValid = (values: RegisterInput) => {
    if (terminosAceptados) {
      void confirmarRegistro(values);
      return;
    }
    setPendiente(values);
    setTerminosOpen(true);
  };

  const aceptarTerminos = () => {
    if (!pendiente) return;
    setTerminosAceptados(true);
    setTerminosOpen(false);
    void confirmarRegistro(pendiente);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onValid)}
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

        {terminosAceptados ? (
          <p className="text-state-success flex items-center justify-center gap-1.5 text-center text-sm font-medium">
            <Check className="h-4 w-4" />
            Términos y condiciones aceptados
          </p>
        ) : (
          <p className="text-center text-sm text-neutral-500">
            Al continuar te mostraremos los términos y condiciones que debes
            aceptar para crear tu cuenta.
          </p>
        )}

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

      <TerminosModal
        open={terminosOpen}
        onClose={() => setTerminosOpen(false)}
        onAccept={aceptarTerminos}
      />
    </>
  );
}
