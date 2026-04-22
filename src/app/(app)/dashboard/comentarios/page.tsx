import { PageCard } from "@/components/layout/page-card";
import { StarRating } from "@/components/domain/star-rating";
import { comentarios } from "@/lib/mocks";

export default function ComentariosPage() {
  return (
    <PageCard>
      <section className="flex flex-col gap-6">
        <h1 className="text-brand-navy text-xl font-bold">
          Feedback de clientes
        </h1>

        <div className="flex flex-col">
          {comentarios.map((c, i) => (
            <article
              key={c.id}
              className={`flex flex-col gap-2 py-5 ${
                i !== comentarios.length - 1
                  ? "border-b border-neutral-200"
                  : ""
              }`}
            >
              <div className="text-brand-navy text-sm font-semibold">
                {c.autor}
              </div>
              <StarRating value={c.estrellas} size="md" />
              <p className="text-brand-navy/80 text-sm italic">
                &ldquo;{c.texto}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageCard>
  );
}
