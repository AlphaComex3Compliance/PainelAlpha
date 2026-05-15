import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'danger' | 'ghost';
    icon?: React.ReactNode;
}

export const ButtonLoading = ({ 
    isLoading, 
    variant = 'primary', 
    icon, 
    children, 
    className, 
    disabled, 
    ...props 
}: ButtonProps) => {
    
    const baseStyles = "cursor-pointer flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20",
        danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20",
        ghost: "bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5"
    };

    return (
        <button
            {...props}
            disabled={isLoading || disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {isLoading ? (
                <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Processando...</span>
                </>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};