"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
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
    <LayoutGroup id="nav-pills">
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
                "relative rounded-full px-5 py-2 text-sm font-medium",
                orientation === "vertical" && "w-full text-left",
                isActive
                  ? "text-brand-navy"
                  : "text-brand-navy/70 hover:text-brand-navy",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="bg-brand-yellow absolute inset-0 rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
