import { PageCard } from "@/components/layout/page-card";
import { AvisoPrivacidadContenido } from "@/components/aviso-privacidad-contenido";

export const metadata = {
  title: "Aviso de privacidad",
};

export default function PrivacidadPage() {
  return (
    <PageCard>
      <AvisoPrivacidadContenido />
    </PageCard>
  );
}
