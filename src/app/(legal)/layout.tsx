import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Footer } from "@/components/layout/footer";
import { BackgroundPattern } from "@/components/layout/background-pattern";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="relative flex-1 overflow-hidden">
        <BackgroundPattern variant="subtle" />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
          <Link href="/login" className="inline-flex">
            <Logo variant="full" />
          </Link>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
