import { Logo } from "@/components/layout/logo";
import { Footer } from "@/components/layout/footer";
import { BackgroundPattern } from "@/components/layout/background-pattern";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="relative flex flex-1 flex-col lg:flex-row">
        <aside className="relative hidden flex-1 items-center justify-center overflow-hidden px-8 py-12 lg:flex">
          <BackgroundPattern variant="auth" />
          <Logo
            variant="full"
            className="relative z-10 h-24 w-auto scale-[1.75]"
          />
        </aside>

        <section className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-8 lg:py-16">
          <BackgroundPattern className="lg:hidden" />
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo variant="full" />
            </div>
            {children}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
