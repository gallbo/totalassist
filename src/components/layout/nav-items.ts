export type NavItem = {
  label: string;
  href: string;
};

// Cambio jul-2026 (Alicia): reducir a 3 los tabs de la barra principal —
// son los que interesan al broker día a día. "Perfil" se movió al
// dropdown de usuario en el header, no aparece más aquí.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Casos", href: "/casos" },
  { label: "Paquetes", href: "/paquetes" },
];
