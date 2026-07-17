import {
  PRIVACIDAD_INTEGRAL,
  PRIVACIDAD_INTRO,
  PRIVACIDAD_SUBTITULO,
  PRIVACIDAD_TITULO,
  PRIVACIDAD_VERSION,
} from "@/lib/privacidad";

export function AvisoPrivacidadContenido() {
  return (
    <div>
      <h1 className="text-brand-navy text-xl font-bold sm:text-2xl">
        {PRIVACIDAD_TITULO}
      </h1>
      <p className="text-brand-navy mt-1 text-sm font-semibold tracking-wide sm:text-base">
        {PRIVACIDAD_SUBTITULO}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Versión {PRIVACIDAD_VERSION}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700">
        <p>{PRIVACIDAD_INTRO}</p>

        {PRIVACIDAD_INTEGRAL.map((seccion, i) => (
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
      </div>
    </div>
  );
}
