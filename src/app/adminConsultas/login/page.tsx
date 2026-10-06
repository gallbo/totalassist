"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChevronLeft } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/install-app-button";

/**
 * Login del modulo /adminConsultas.
 *
 * Reproduce la estetica del splash de Gallbo Connect (fondo navy con
 * estrellas, logo grande centrado, botones grandes) usando el branding de
 * TotalAssist. Se compone de dos vistas alternadas por state local:
 *
 *   1) Splash — logo + tagline + boton "Iniciar sesion" + install PWA.
 *   2) Form   — el formulario email/password.
 *
 * NO tiene "Registrarme" (a diferencia de Connect) porque solo Manuel y
 * la whitelist de TotalAssistAdminAccessPolicy pueden entrar aqui — el
 * password grant contra el client `totalassist-admin` en Skipper rechaza
 * a cualquier otro. Los brokers usan /login (portal broker).
 *
 * PWA: `beforeinstallprompt` habilita el boton "Instalar app" arriba a la
 * derecha, replicando lo que Manuel ya tenia en Connect. El manifest y
 * los iconos ya existen en /public.
 *
 * ACCESIBILIDAD (Manuel invidente, VoiceOver):
 * - `role="alert"` + `aria-live="assertive"` en el mensaje de error.
 * - Al abrir el form, el foco entra al campo de correo (para no tener
 *   que tabular buscando).
 * - Boton "Volver" en el form regresa al splash y devuelve el foco al
 *   boton "Iniciar sesion" (patron esperado por lectores de pantalla).
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [vista, setVista] = useState<"splash" | "form">("splash");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const btnIniciarRef = useRef<HTMLButtonElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  // Mover foco al abrir/cerrar el form (importante para VoiceOver).
  useEffect(() => {
    if (vista === "form") {
      emailRef.current?.focus();
    } else {
      btnIniciarRef.current?.focus();
    }
  }, [vista]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const message =
        result.error === "CredentialsSignin"
          ? "Correo o contraseña incorrectos, o esta cuenta no tiene acceso al panel."
          : "No pudimos iniciar sesión. Intenta de nuevo en un momento.";
      setError(message);
      setSubmitting(false);
      return;
    }

    router.push("/adminConsultas");
    router.refresh();
  };

  return (
    <div className="bg-brand-navy relative flex min-h-screen flex-col text-white">
      {/* Overlay sutil de gradiente para darle profundidad al centro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"
      />

      {/* Barra superior: PWA install + (en form) boton volver */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6">
        {vista === "form" ? (
          <button
            type="button"
            onClick={() => setVista("splash")}
            className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/20 sm:text-sm"
            aria-label="Volver al inicio"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <InstallAppButton variante="oscuro" />
      </header>

      {/* Contenido central */}
      <main
        role="main"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10"
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-8">
          {/* Logo TotalAssist */}
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/brand/totalassist-full-white-v3.png"
              alt="Total Assist"
              width={280}
              height={90}
              priority
              className="h-auto w-56 sm:w-64"
            />
          </div>

          {vista === "splash" ? (
            <div className="flex w-full flex-col items-center gap-6">
              <h1 className="text-center text-lg font-semibold sm:text-xl">
                Hola, ¡bienvenido al Panel de Consultas!
              </h1>

              <div className="flex w-full flex-col gap-3">
                <button
                  ref={btnIniciarRef}
                  type="button"
                  onClick={() => setVista("form")}
                  className="text-brand-navy rounded-full bg-white px-6 py-3.5 text-base font-semibold shadow-sm transition hover:bg-white/90"
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              aria-labelledby="titulo-login"
              className="flex w-full flex-col gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur"
              noValidate
            >
              <h1 id="titulo-login" className="text-lg font-semibold">
                Iniciar sesión
              </h1>
              <p className="text-sm text-white/80">
                Acceso exclusivo del panel de consultas administrativas.
              </p>

              {error ? (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-lg border border-red-400/60 bg-red-500/20 p-3 text-sm text-white"
                >
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white"
                >
                  Correo
                </label>
                <input
                  id="email"
                  ref={emailRef}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="focus:ring-brand-yellow text-brand-navy rounded-lg border border-white/30 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="focus:ring-brand-yellow text-brand-navy rounded-lg border border-white/30 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="text-brand-navy rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:bg-white/90 disabled:opacity-60"
              >
                {submitting ? "Iniciando..." : "Entrar al panel"}
              </button>

              <p className="text-center text-xs text-white/70">
                <Link href="/" className="underline hover:text-white">
                  Volver al inicio de Total Assist
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Tagline al fondo, replicando Connect */}
        {vista === "splash" ? (
          <p className="mt-10 max-w-xs text-center text-sm leading-snug font-semibold text-white/90 sm:mt-16 sm:text-base">
            Respalda, agiliza y fortalece
            <br />
            tu asesoría en seguros.
          </p>
        ) : null}
      </main>
    </div>
  );
}
