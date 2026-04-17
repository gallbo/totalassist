"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

type NavPillsProps = {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
};

export function NavPills({
  orientation = "horizontal",
  onNavigate,
}: NavPillsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "horizontal"
          ? "items-center rounded-full bg-white/60 p-1"
          : "flex-col",
      )}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              orientation === "vertical" && "w-full text-left",
              isActive
                ? "bg-brand-yellow text-brand-navy shadow-sm"
                : "text-brand-navy/70 hover:text-brand-navy hover:bg-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
