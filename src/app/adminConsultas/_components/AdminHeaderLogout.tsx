"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

/**
 * Boton de logout del panel /adminConsultas. Llama a NextAuth signOut, que
 * limpia la cookie httpOnly localmente y (via el event `signOut` en
 * src/lib/auth.ts) hace fire-and-forget al endpoint
 * /api/totalassist/admin/logout de Skipper para revocar el refresh token
 * server-side.
 */
export function AdminHeaderLogout() {
  const [submitting, setSubmitting] = useState(false);

  const onClick = async () => {
    if (submitting) return;
    setSubmitting(true);
    await signOut({ callbackUrl: "/adminConsultas/login" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting}
      className="flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm whitespace-nowrap hover:bg-white/10 disabled:opacity-60"
      aria-label="Cerrar sesión y volver al login"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>{submitting ? "Cerrando..." : "Cerrar sesión"}</span>
    </button>
  );
}
