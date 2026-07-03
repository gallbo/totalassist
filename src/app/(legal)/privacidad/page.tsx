import { PageCard } from "@/components/layout/page-card";

export const metadata = {
  title: "Aviso de privacidad",
};

export default function PrivacidadPage() {
  return (
    <PageCard>
      <h1 className="text-brand-navy text-2xl font-semibold">
        Aviso de privacidad
      </h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-neutral-600">
        <p>
          En Total Assist protegemos tus datos personales. Este aviso describe
          cómo recabamos, usamos y resguardamos la información que nos
          proporcionas al utilizar la plataforma.
        </p>

        <div>
          <h2 className="text-brand-navy text-base font-semibold">
            Responsable del tratamiento
          </h2>
          <p className="mt-2">
            Total Assist es responsable del uso y protección de tus datos
            personales, conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares.
          </p>
        </div>

        <div>
          <h2 className="text-brand-navy text-base font-semibold">
            Datos que recabamos
          </h2>
          <p className="mt-2">
            Recabamos los datos que registras al crear tu cuenta y al dar de
            alta casos: datos de identificación y contacto, información
            profesional del corredor y los datos necesarios para gestionar cada
            reclamación.
          </p>
        </div>

        <div>
          <h2 className="text-brand-navy text-base font-semibold">
            Finalidad del tratamiento
          </h2>
          <p className="mt-2">
            Usamos tus datos para operar tu cuenta, gestionar los casos que
            registras, darte seguimiento y mantener contacto contigo sobre el
            servicio.
          </p>
        </div>

        <div>
          <h2 className="text-brand-navy text-base font-semibold">
            Tus derechos
          </h2>
          <p className="mt-2">
            Puedes acceder, rectificar, cancelar u oponerte al tratamiento de
            tus datos personales, así como limitar su uso o divulgación,
            contactándonos por los medios que ponemos a tu disposición.
          </p>
        </div>

        <p className="text-xs text-neutral-500">
          Este aviso de privacidad puede actualizarse. Te notificaremos
          cualquier cambio a través de la plataforma.
        </p>
      </div>
    </PageCard>
  );
}
