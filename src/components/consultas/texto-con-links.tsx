import { Fragment } from "react";

const URL_RE = /(https?:\/\/[^\s]+)/g;

/**
 * Renderiza texto plano convirtiendo las URLs http(s) en links clickeables.
 * Solo genera <a> para http/https (nada de javascript: ni otros esquemas);
 * el resto se pinta como texto, asi que no hay riesgo de inyectar HTML.
 */
export function TextoConLinks({ texto }: { texto: string }) {
  const partes = texto.split(URL_RE);
  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={parte}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline"
          >
            {parte}
          </a>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
    </>
  );
}
