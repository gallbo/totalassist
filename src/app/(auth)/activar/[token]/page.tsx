"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { PasswordInput } from "@/components/ui/password-input";
import { BrandButton } from "@/components/ui/brand-button";
import { Field } from "@/components/forms/field";
import { RequisitosPassword } from "@/components/forms/requisitos-password";
import { CamposDomicilio } from "@/components/forms/campos-domicilio";
import {
  activarCuentaSchema,
  type ActivarCuentaFormInput,
} from "@/lib/schemas/auth";
import { brokerApi, type ActivacionInfo } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";

/**
 * Activación de cuenta (registro en dos pasos, Skipper migración 144): el
 * agente llega desde el correo de bienvenida, crea su contraseña y completa
 * su perfil con domicilio y RFC.
 */
export default function ActivarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [info, setInfo] = useState<ActivacionInfo | null>(null);
  const [error, setError] = useState<{ code?: string; message: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    brokerApi
      .getActivacion(token)
      .then(setInfo)
      .catch((e) =>
        setError(
          e instanceof ApiError
            ? { code: e.code, message: e.message }
            : { message: "No pudimos validar tu liga. Intenta de nuevo." },
        ),
      );
  }, [token]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ActivarCuentaFormInput>({
    resolver: zodResolver(activarCuentaSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      password_confirmation: "",
      rfc: "",
      domicilio: "",
      ciudad: "",
      estado: "",
      codigo_postal: "",
    },
  });
  const valores = useWatch({ control });
  const completo = activarCuentaSchema.safeParse(valores).success;

  const onSubmit = async (values: ActivarCuentaFormInput) => {
    setSubmitting(true);
    try {
      await brokerApi.activarCuenta({ token, ...values });
      router.push("/login?activada=1");
    } catch (e) {
      if (e instanceof ApiError && e.code && e.code !== "validacion") {
        setError({ code: e.code, message: e.message });
      } else {
        toast.error(
          e instanceof ApiError
            ? (Object.values(e.fieldErrors ?? {})[0]?.[0] ?? e.message)
            : "Ocurrió un problema, intenta de nuevo. Si persiste, contáctanos.",
        );
      }
      setSubmitting(false);
    }
  };

  if (error) {
    const activada = error.code === "cuenta_activada";
    return (
      <div className="flex flex-col gap-5 text-center">
        <h1 className="text-brand-navy text-3xl font-bold">
          {activada ? "Tu cuenta ya está activa" : "Liga no válida"}
        </h1>
        <p className="text-sm text-neutral-600">{error.message}</p>
        <div className="flex justify-center">
          <BrandButton
            type="button"
            render={<Link href={activada ? "/login" : "/activar"} />}
          >
            {activada ? "Iniciar sesión" : "Pedir una liga nueva"}
          </BrandButton>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <p className="text-center text-sm text-neutral-500">Validando tu liga…</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-brand-navy text-3xl font-bold">Activa tu cuenta</h1>
        <p className="text-sm text-neutral-600">
          Hola, {info.nombre}. Crea tu contraseña y completa tu perfil para
          empezar a registrar siniestros y consultas.
        </p>
        <p className="text-xs text-neutral-500">{info.email}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-brand-navy text-sm font-bold tracking-wide uppercase">
          1. Tu contraseña
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Contraseña"
            htmlFor="password"
            error={errors.password?.message}
          >
            <div className="group flex flex-col gap-1.5">
              <PasswordInput
                id="password"
                autoComplete="new-password"
                disabled={submitting}
                {...register("password")}
              />
              <RequisitosPassword
                valor={valores.password ?? ""}
                className="hidden group-focus-within:block"
              />
            </div>
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-brand-navy text-sm font-bold tracking-wide uppercase">
          2. Completa tu perfil
        </h2>
        <CamposDomicilio
          register={register}
          errors={errors}
          disabled={submitting}
        />
      </section>

      <div className="flex justify-center">
        <BrandButton type="submit" disabled={submitting || !completo}>
          {submitting ? "Activando..." : "Activar mi cuenta"}
        </BrandButton>
      </div>
    </form>
  );
}
