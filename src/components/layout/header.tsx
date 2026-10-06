"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Logo } from "@/components/layout/logo";
import { NavPills } from "@/components/layout/nav-pills";
import { AgencyBadge } from "@/components/layout/agency-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { BrokerMe } from "@/lib/api/brokers";
import { esBrokerPiloto } from "@/lib/piloto";
import { InstallAppButton } from "@/components/pwa/install-app-button";

type HeaderProps = {
  session: Session | null;
  broker?: BrokerMe | null;
};

export function Header({ session, broker }: HeaderProps) {
  const [open, setOpen] = useState(false);
  // Dropdown de usuario (Perfil / Cerrar sesión) — solo desktop.
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  const userEmail = session?.user?.email ?? "";
  const nombreCompleto = broker
    ? [broker.nombre, broker.apellido_paterno].filter(Boolean).join(" ")
    : "";
  const userName = nombreCompleto || userEmail || "Broker";
  const logoUrl = broker?.logo_url ?? null;
  const mostrarPiloto = esBrokerPiloto(broker?.id);

  // Cerrar el menú al hacer click fuera o presionar Escape (patrón estándar
  // de dropdowns accesibles sin depender de una librería adicional).
  useEffect(() => {
    if (!menuAbierto) return;
    const onClickFuera = (ev: MouseEvent) => {
      if (!menuWrapRef.current) return;
      if (!menuWrapRef.current.contains(ev.target as Node)) {
        setMenuAbierto(false);
      }
    };
    const onEscape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("mousedown", onClickFuera);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuAbierto]);

  return (
    <header>
      <div className="flex w-full items-center justify-between gap-4 py-2">
        <Link
          href="/dashboard"
          aria-label="Total Assist, ir al dashboard"
          className="flex items-center"
        >
          <Logo variant="compact" className="lg:hidden" />
          <Logo variant="full" className="hidden lg:flex" />
        </Link>

        <div className="hidden lg:flex">
          <NavPills mostrarPiloto={mostrarPiloto} />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Instalar app: en piloto, solo para BROKERS_PILOTO (src/lib/piloto.ts). */}
          {mostrarPiloto ? <InstallAppButton compacto /> : null}
          {/* Dropdown Perfil / Cerrar sesión.
              Antes el bloque del nombre disparaba signOut() directamente,
              lo que era confuso: el broker esperaba entrar a su perfil.
              Ahora abre un menú con las dos opciones esperadas. */}
          <div className="relative" ref={menuWrapRef}>
            <button
              type="button"
              onClick={() => setMenuAbierto((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              className="flex items-center gap-1.5 text-right leading-tight"
            >
              <span className="text-brand-navy text-sm font-semibold whitespace-nowrap">
                {userName}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-neutral-500 transition-transform ${
                  menuAbierto ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            {menuAbierto && (
              <div
                role="menu"
                className="absolute top-full right-0 z-30 mt-2 w-52 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
              >
                <Link
                  href="/perfil"
                  role="menuitem"
                  onClick={() => setMenuAbierto(false)}
                  className="hover:text-brand-navy flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <User className="h-4 w-4" aria-hidden />
                  Perfil
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuAbierto(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="hover:text-brand-navy flex w-full items-center gap-2 border-t border-neutral-100 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <AgencyBadge name={userName} logoUrl={logoUrl} />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <SheetHeader className="border-b border-neutral-200 text-left">
              <SheetTitle>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  aria-label="Total Assist, ir al dashboard"
                >
                  <Logo variant="compact" />
                </Link>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 px-4 py-4">
              <div className="flex items-center gap-3">
                <AgencyBadge name={userName} logoUrl={logoUrl} />
                <div className="flex flex-col leading-tight">
                  <span className="text-brand-navy text-sm font-semibold">
                    {userName}
                  </span>
                  {userEmail ? (
                    <span className="text-xs text-neutral-500">
                      {userEmail}
                    </span>
                  ) : null}
                </div>
              </div>

              <Separator />

              <NavPills
                mostrarPiloto={mostrarPiloto}
                orientation="vertical"
                onNavigate={() => setOpen(false)}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-neutral-200 p-4">
              {mostrarPiloto ? (
                <InstallAppButton className="justify-center" />
              ) : null}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
