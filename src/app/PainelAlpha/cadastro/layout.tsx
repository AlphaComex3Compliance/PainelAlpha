import { ThemeProviderAlpha } from "@/components/ThemeProviderAlpha";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Painel Alpha | Gerenciamento de Usuários",
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="painel-cadastro"> 
    <Toaster richColors position="top-right" />
    <ThemeProviderAlpha>
       {children}
    </ThemeProviderAlpha>
      
    </div>
  );
}