import type { Metadata } from "next";
import "./style.css";
import { Toaster } from "sonner";
import BibbleChat from "@/components/Bibble";
import { BibbleProvider } from "@/context/BibbleContext"; 
import { auth } from "../../../auth";

export const metadata: Metadata = {
  title: "Painel Alpha",
};


export default async function PainelLayout({

  
  children,
}: {
  children: React.ReactNode
}) {

  const session = await auth();

  
  return (
      <div className="painel-wrapper">
        <Toaster richColors position="top-right" />
        {children}
      </div>
  );
}

//para adicionar o bibble:
//<BibbleProvider> 
//{(session?.user as any)?.bibble_ativo !== false && <BibbleChat session={session}/>}