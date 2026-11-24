"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { toast } from "@/lib/toast";
import { brokerApi } from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";

/** Confirmación del registro inicial (Skipper, migración 144). */
export function CorreoEnviado({ email }: { email: string }) {
  const [reenviando, setReenviando] = useState(false);

  const reenviar = async () => {
    setReenviando(true);
    try {
      const r = await brokerApi.reenviarActivacion(email);
      toast.success(r.mensaje);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No pudimos reenviar el correo. Intenta de nuevo en unos minutos.",
      );
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="bg-brand-yellow/20 flex h-16 w-16 items-center justify-center rounded-full">
        <MailCheck className="text-brand-navy h-8 w-8" aria-hidden />
      </div>
      <h1 className="text-brand-navy text-3xl font-bold">Revisa tu correo</h1>
      <p className="text-sm leading-relaxed text-neutral-600">
        Te enviamos un correo de bienvenida a{" "}
        <strong className="text-brand-navy">{email}</strong> con una liga para
        activar tu cuenta. Ahí vas a crear tu contraseña y completar tu perfil
        con tu domicilio y RFC.
      </p>
      <p className="text-xs text-neutral-500">
        La liga vence en 7 días. Si no lo ves, revisa tu carpeta de correo no
        deseado.
      </p>
      <button
        type="button"
        onClick={reenviar}
        disabled={reenviando}
        className="text-brand-navy text-sm font-semibold hover:underline disabled:opacity-50"
      >
        {reenviando ? "Reenviando..." : "Reenviar correo"}
      </button>
      <Link href="/login" className="text-sm text-neutral-600 hover:underline">
        Ir a iniciar sesión
      </Link>
    </div>
  );
}
