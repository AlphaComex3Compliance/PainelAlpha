"use client";

import { logout } from "@/actions/logout";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "absolute" | "inline";
}

export default function LogoutButton({ variant = "inline" }: LogoutButtonProps) {
  return (
    <Button
      onClick={() => logout()}
      className={`
        flex items-center justify-center gap-2
        h-11 px-4
        rounded-2xl
        bg-red-600/20 text-red-500 font-black uppercase text-[10px] tracking-widest
        border border-red-500/20
        hover:bg-red-600 hover:text-white transition-all duration-300
        active:scale-95 cursor-pointer
        ${variant === "absolute" ? "fixed bottom-8 right-8 w-auto shadow-2xl" : "w-full relative"}
      `}
    >
      <LogOut size={16} />
      Encerrar Sessão
    </Button>
  );
}
