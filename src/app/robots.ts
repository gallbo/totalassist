import type { MetadataRoute } from "next";

// Solo el login es público para buscadores; el resto del portal requiere sesión.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/login", disallow: "/" }],
  };
}
