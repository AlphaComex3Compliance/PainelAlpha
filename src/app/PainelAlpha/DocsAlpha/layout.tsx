import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Painel Alpha | Gerenciamento Arquivos",
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div> 
    <Toaster richColors position="top-right" />
       {children}
    </div>
  );
  
}
