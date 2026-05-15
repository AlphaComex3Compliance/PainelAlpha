import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Habilitação RADAR – Alpha",
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Toaster position="top-right" richColors />
      {children}
    </div>
  );
}
