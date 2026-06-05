import { BackgroundPattern } from "@/components/layout/background-pattern";
import { Footer } from "@/components/layout/footer";

export default function SeguimientoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="relative flex-1 overflow-hidden">
        <BackgroundPattern variant="subtle" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-5 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
