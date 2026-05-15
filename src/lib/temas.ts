export interface TemaAlpha {
    text: string;
    bg: string;
    border: string;
    glow: string;
    shadow: string;
    accent: string;
}

export const CONFIG_TEMAS: Record<string, TemaAlpha> = {
    blue: {
        text: "text-blue-500", bg: "bg-blue-600", border: "border-blue-500/20",
        glow: "bg-blue-600/10", shadow: "shadow-blue-500/20", accent: "37, 99, 235"
    },
    emerald: {
        text:

            "text-emerald-500", bg: "bg-emerald-600", border: "border-emerald-500/20",
        glow: "bg-emerald-600/10", shadow: "shadow-emerald-500/20", accent: "16, 185, 129"
    },
    rose: {
        text: "text-rose-500", bg: "bg-rose-600", border: "border-rose-500/20",
        glow: "bg-rose-600/10", shadow: "shadow-rose-500/20", accent: "225, 29, 72"
    },
    amber: {
        text: "text-amber-500", bg: "bg-amber-600", border: "border-amber-500/20",
        glow: "bg-amber-600/10", shadow: "shadow-amber-500/20", accent: "245, 158, 11"
    },
    violet: {
        text: "text-violet-500", bg: "bg-violet-600", border: "border-violet-500/20",
        glow: "bg-violet-600/10", shadow: "shadow-violet-500/20", accent: "124, 58, 237"
    },

    cyan: {
        text: "text-cyan-400", bg: "bg-cyan-500", border: "border-cyan-500/20",
        glow: "bg-cyan-500/10", shadow: "shadow-cyan-500/20", accent: "34, 211, 238"
    },
    fuchsia: {
        text: "text-fuchsia-500", bg: "bg-fuchsia-600", border: "border-fuchsia-500/20",
        glow: "bg-fuchsia-600/10", shadow: "shadow-fuchsia-500/20", accent: "192, 38, 211"
    },
    toxic: {
        text: "text-lime-400", bg: "bg-gradient-to-r from-lime-600 to-emerald-600", border: "border-lime-500/20",
        glow: "bg-lime-500/10", shadow: "shadow-lime-500/20", accent: "163, 230, 53"
    },
    crimson: {
        text: "text-red-500", bg: "bg-gradient-to-r from-red-600 to-rose-700", border: "border-red-500/20",
        glow: "bg-red-500/10", shadow: "shadow-red-500/20", accent: "220, 38, 38"
    },
    midnight: {
        text: "text-indigo-400", bg: "bg-gradient-to-r from-indigo-700 to-slate-900", border: "border-indigo-500/20",
        glow: "bg-indigo-500/10", shadow: "shadow-indigo-500/20", accent: "79, 70, 229"
    },
    lavender: {
        text: "text-purple-400", bg: "bg-purple-500", border: "border-purple-500/20",
        glow: "bg-purple-500/10", shadow: "shadow-purple-500/20", accent: "167, 139, 250"
    },
    pink: {
        text: "text-pink-500", bg: "bg-pink-600", border: "border-pink-500/20",
        glow: "bg-pink-600/10", shadow: "shadow-pink-500/20", accent: "236, 72, 153"
    }
};

export const getTema = (nome?: string): TemaAlpha => CONFIG_TEMAS[nome || "blue"] || CONFIG_TEMAS.blue;
