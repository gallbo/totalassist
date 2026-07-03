import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const links = [
  { label: "Condiciones de uso", href: "/condiciones" },
  { label: "Aviso de privacidad", href: "/privacidad" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:items-start sm:px-6 lg:px-8">
        <Logo variant="shield" className="h-12 w-auto" />

        <div className="flex flex-col items-center gap-3 text-xs text-neutral-600 sm:items-end">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 sm:justify-end">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-brand-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-center text-[11px] text-neutral-500 sm:text-right">
            &copy; {new Date().getFullYear()} Copyright. Todos los derechos
            reservados www.totalassist.com.mx. | Marca registrada.
          </p>
        </div>
      </div>
    </footer>
  );
}
