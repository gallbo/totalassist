import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import {
  brokerApi,
  type DashboardData,
  type FeedbackResumen,
  type CasoResumen,
  type ListaCasos,
} from "@/lib/api/brokers";
import { ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/auth-tokens";
import { EstadoCasosBloque } from "./_components/estado-casos-bloque";
import { FeedbackClientesCard } from "./_components/feedback-clientes-card";
import { MasRecientes } from "./_components/mas-recientes";
import { RegistroCasosChart } from "./_components/registro-casos-chart";

/**
 * Dashboard del broker — rediseño jul-2026 (Alicia):
 *
 * Layout de 2 columnas 7/5 con la izquierda dominante:
 *
 *   ┌───────────────────────────────────────┬─────────────────────┐
 *   │  Estado de los casos                  │  Comentarios        │
 *   │  (barras + botón Comprar + alerta)    │  (feedback promedio)│
 *   │                                       │                     │
 *   ├───────────────────────────────────────┤                     │
 *   │  Más recientes                        ├─────────────────────┤
 *   │  (últimos 2 casos + compartir + ver)  │  Registro de casos  │
 *   │                                       │  (gráfica anual)    │
 *   └───────────────────────────────────────┴─────────────────────┘
 *
 * Los counter cards del header (Casos en proceso / restantes / interrumpidos)
 * se retiraron: la misma info vive dentro del bloque "Estado de los casos".
 * "Tus favoritos" también se retiró — el broker prefiere ver sus últimos 2
 * casos (Alicia, jul-2026).
 */
export default async function DashboardPage() {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/login");
  }

  let data: DashboardData | null = null;
  let feedback: FeedbackResumen = { promedio: 0, total: 0 };
  let ultimosCasos: CasoResumen[] = [];
  try {
    // Traemos en paralelo el dashboard, el feedback y los últimos 2
    // casos del broker (para el bloque "Más recientes").
    const [dashboardResp, feedbackResp, casosResp] = await Promise.all([
      brokerApi.getDashboard(token),
      brokerApi.getFeedbackResumen(token).catch(() => ({
        promedio: 0,
        total: 0,
      })),
      brokerApi
        .getCasos(token, { page: 1, per_page: 2 })
        .catch<ListaCasos>(() => ({
          data: [],
          total: 0,
          page: 1,
          per_page: 2,
          total_pages: 1,
        })),
    ]);
    data = dashboardResp;
    feedback = feedbackResp;
    ultimosCasos = casosResp.data ?? [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
        <p className="text-sm text-neutral-600">
          No pudimos cargar el dashboard. Intenta de nuevo en unos segundos.
        </p>
      </div>
    );
  }

  const nombre =
    data.broker.nombre?.trim() ||
    data.broker.apellido_paterno?.trim() ||
    "Broker";

  const tieneCasos = data.casos_counts.total > 0;
  const delta = data.registro_casos.delta_porcentaje;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-brand-navy text-2xl font-bold lg:text-3xl">
        ¡Hola, {nombre}!
      </h1>

      {/* Grid principal — izquierda dominante (7/5).
          En móvil se apila normal, izquierda primero. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[7fr_5fr]">
        {/* ── Columna izquierda: bloque principal ────────────────── */}
        <div className="flex flex-col gap-5">
          <EstadoCasosBloque
            counts={data.casos_counts}
            paqueteActivo={data.paquete_activo}
          />
          <MasRecientes casos={ultimosCasos} />
        </div>

        {/* ── Columna derecha: secundarios más compactos ─────────── */}
        <div className="flex flex-col gap-5">
          <FeedbackClientesCard
            promedio={feedback.promedio}
            total={feedback.total}
          />

          <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
            <header className="flex items-start justify-between">
              <div>
                <h2 className="text-brand-navy text-base font-bold">
                  Registro de casos
                </h2>
                {tieneCasos ? (
                  <p
                    className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${
                      delta >= 0 ? "text-state-success" : "text-state-danger"
                    }`}
                  >
                    {delta >= 0 ? (
                      <ArrowUp className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <ArrowDown className="h-4 w-4" strokeWidth={3} />
                    )}
                    {Math.abs(delta)}%
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-500">
                    Últimos 12 meses
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-brand-navy text-3xl font-bold tabular-nums">
                  {data.registro_casos.total}
                </div>
                <div className="text-xs text-neutral-500">Total</div>
              </div>
            </header>

            {tieneCasos ? (
              <RegistroCasosChart serie={data.registro_casos.serie} />
            ) : (
              <Vacio
                titulo="Aún no hay casos registrados"
                texto="Cuando empieces a cargar casos, aquí verás tu actividad mensual."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-blue-50/50 px-4 py-8 text-center">
      <FileText className="text-brand-navy/40 h-8 w-8" strokeWidth={1.5} />
      <div className="text-brand-navy text-sm font-semibold">{titulo}</div>
      <div className="max-w-xs text-xs text-neutral-600">{texto}</div>
    </div>
  );
}
