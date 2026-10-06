export type NavItem = {
  label: string;
  href: string;
  /** Solo visible para los brokers en piloto (src/lib/piloto.ts). */
  piloto?: boolean;
};

// Cambio jul-2026 (Alicia): reducir a 3 los tabs de la barra principal —
// son los que interesan al broker día a día. "Perfil" se movió al
// dropdown de usuario en el header, no aparece más aquí.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Casos", href: "/casos" },
  { label: "Paquetes", href: "/paquetes" },
  { label: "Consultas", href: "/consultas", piloto: true }, // Juan, ago-2026 — módulo estilo Connect
  { label: "Conferencias", href: "/conferencias", piloto: true }, // Juan, oct-2026 — eventos de Connect
  { label: "Defensa Legal", href: "/defensa-legal", piloto: true }, // Juan, oct-2026 — landing con CTA a WhatsApp
];
