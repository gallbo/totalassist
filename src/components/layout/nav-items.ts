export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Casos", href: "/casos" },
  { label: "Paquetes", href: "/paquetes" },
  { label: "Perfil", href: "/perfil" },
];
