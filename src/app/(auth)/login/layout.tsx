import { GoogleTagManager } from "@/components/analitica/google-tag-manager";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GoogleTagManager />
    </>
  );
}
