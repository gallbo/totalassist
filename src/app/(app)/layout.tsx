import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackgroundPattern } from "@/components/layout/background-pattern";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="relative flex-1 overflow-hidden">
        <BackgroundPattern variant="subtle" />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          <Header session={session} />
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
