"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
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

type HeaderProps = {
  session: Session | null;
  broker?: BrokerMe | null;
};

export function Header({ session, broker }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const userEmail = session?.user?.email ?? "";
  const nombreCompleto = broker
    ? [broker.nombre, broker.apellido_paterno].filter(Boolean).join(" ")
    : "";
  const userName = nombreCompleto || userEmail || "Broker";
  const logoUrl = broker?.logo_url ?? null;

  return (
    <header>
      <div className="flex w-full items-center justify-between gap-4 py-2">
        <div className="flex items-center">
          <Logo variant="compact" className="lg:hidden" />
          <Logo variant="full" className="hidden lg:flex" />
        </div>

        <div className="hidden lg:flex">
          <NavPills />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-col items-end text-right leading-tight"
          >
            <span className="text-brand-navy text-sm font-semibold">
              {userName}
            </span>
            <span className="hover:text-brand-navy text-xs text-neutral-500 transition-colors">
              Cerrar sesión
            </span>
          </button>
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
                <Logo variant="compact" />
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
                orientation="vertical"
                onNavigate={() => setOpen(false)}
              />
            </div>

            <div className="border-t border-neutral-200 p-4">
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
