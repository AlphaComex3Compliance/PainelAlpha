"use client";

import { LucideIcon } from "lucide-react";

interface CampoProps {
  label: string;
  icon?: LucideIcon;
  name?: string;
  defaultValue?: string;
  readOnly?: boolean;
  type?: "text" | "select" | "date" | "email";
  options?: string[];
  placeholder?: string;
}

export function CampoAlpha({ label, icon: Icon, name, defaultValue, readOnly, type = "text", options, placeholder }: CampoProps) {
  const baseClass = "w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-[11px] font-black uppercase outline-none transition-all";
  const focusClass = readOnly ? "text-slate-400 cursor-not-allowed" : "text-white focus:border-white/20 focus:bg-black/60";

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />}
        
        {type === "select" ? (
          <select 
            name={name} 
            defaultValue={defaultValue} 
            disabled={readOnly}
            className={`${baseClass} ${focusClass} ${Icon ? 'pl-12' : ''} appearance-none`}
          >
            <option value="">SELECIONE...</option>
            {options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            defaultValue={defaultValue}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`${baseClass} ${focusClass} ${Icon ? 'pl-12' : ''}`}
          />
        )}
      </div>
    </div>
  );
}
