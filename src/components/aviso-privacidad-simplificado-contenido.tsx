import Link from "next/link";
import {
  PRIVACIDAD_SIMPLIFICADO,
  PRIVACIDAD_SIMPLIFICADO_TITULO,
  PRIVACIDAD_SUBTITULO,
  PRIVACIDAD_VERSION,
} from "@/lib/privacidad";

export function AvisoPrivacidadSimplificadoContenido({
  integralHref,
}: {
  integralHref: string;
}) {
  return (
    <div>
      <h1 className="text-brand-navy text-xl font-bold sm:text-2xl">
        {PRIVACIDAD_SIMPLIFICADO_TITULO}
      </h1>
      <p className="text-brand-navy mt-1 text-sm font-semibold tracking-wide sm:text-base">
        {PRIVACIDAD_SUBTITULO}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Versión {PRIVACIDAD_VERSION}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700">
        {PRIVACIDAD_SIMPLIFICADO.map((seccion, i) => (
          <div key={i} className="space-y-2">
            {seccion.titulo && (
              <h2 className="text-brand-navy text-base font-semibold">
                {seccion.titulo}
              </h2>
            )}
            {seccion.parrafos?.map((parrafo, j) => (
              <p key={j}>{parrafo}</p>
            ))}
            {seccion.incisos && (
              <ul className="list-disc space-y-1 pl-6">
                {seccion.incisos.map((inciso, j) => (
                  <li key={j}>{inciso}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <p>
          Este Aviso de Privacidad es simplificado. Para consultar el Aviso de
          Privacidad Integral, ingrese al siguiente enlace:{" "}
          <Link
            href={integralHref}
            className="text-brand-navy font-semibold underline"
          >
            Aviso de Privacidad Integral
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
