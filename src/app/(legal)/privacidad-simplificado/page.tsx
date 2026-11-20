import { PageCard } from "@/components/layout/page-card";
import { AvisoPrivacidadSimplificadoContenido } from "@/components/aviso-privacidad-simplificado-contenido";

export const metadata = {
  title: "Aviso de privacidad simplificado",
};

export default function PrivacidadSimplificadoPage() {
  return (
    <PageCard>
      <AvisoPrivacidadSimplificadoContenido integralHref="/privacidad" />
    </PageCard>
  );
}
