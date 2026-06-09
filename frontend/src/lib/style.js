// Static metadata for visual styling of each country team. The backend is
// the source of truth for members and points; this map only defines look
// & feel that the API doesn't need to know about.

export const ACCENTS = {
  amber: {
    text: "text-amber-300",
    glow: "shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)]",
    bar: "from-amber-400 to-amber-600",
    ring: "ring-amber-400/40",
    hex: "#fbbf24",
    soft: "bg-amber-500/10",
    border: "border-amber-500/40",
  },
  slate: {
    text: "text-slate-200",
    glow: "shadow-[0_0_28px_-6px_rgba(148,163,184,0.45)]",
    bar: "from-slate-300 to-slate-500",
    ring: "ring-slate-300/30",
    hex: "#cbd5e1",
    soft: "bg-slate-400/10",
    border: "border-slate-400/40",
  },
  orange: {
    text: "text-orange-400",
    glow: "shadow-[0_0_28px_-6px_rgba(251,146,60,0.55)]",
    bar: "from-orange-400 to-orange-600",
    ring: "ring-orange-400/40",
    hex: "#fb923c",
    soft: "bg-orange-500/10",
    border: "border-orange-500/40",
  },
  rose: {
    text: "text-rose-400",
    glow: "shadow-[0_0_28px_-6px_rgba(251,113,133,0.55)]",
    bar: "from-rose-400 to-rose-600",
    ring: "ring-rose-400/40",
    hex: "#fb7185",
    soft: "bg-rose-500/10",
    border: "border-rose-500/40",
  },
  blue: {
    text: "text-sky-400",
    glow: "shadow-[0_0_28px_-6px_rgba(56,189,248,0.55)]",
    bar: "from-sky-400 to-sky-600",
    ring: "ring-sky-400/40",
    hex: "#38bdf8",
    soft: "bg-sky-500/10",
    border: "border-sky-500/40",
  },
  cyan: {
    text: "text-cyan-300",
    glow: "shadow-[0_0_28px_-6px_rgba(34,211,238,0.55)]",
    bar: "from-cyan-300 to-cyan-500",
    ring: "ring-cyan-300/40",
    hex: "#22d3ee",
    soft: "bg-cyan-500/10",
    border: "border-cyan-500/40",
  },
  red: {
    text: "text-red-400",
    glow: "shadow-[0_0_28px_-6px_rgba(248,113,113,0.55)]",
    bar: "from-red-400 to-red-600",
    ring: "ring-red-400/40",
    hex: "#f87171",
    soft: "bg-red-500/10",
    border: "border-red-500/40",
  },
  violet: {
    text: "text-violet-300",
    glow: "shadow-[0_0_28px_-6px_rgba(167,139,250,0.55)]",
    bar: "from-violet-300 to-violet-500",
    ring: "ring-violet-300/40",
    hex: "#a78bfa",
    soft: "bg-violet-500/10",
    border: "border-violet-500/40",
  },
  green: {
    text: "text-emerald-300",
    glow: "shadow-[0_0_28px_-6px_rgba(52,211,153,0.55)]",
    bar: "from-emerald-300 to-emerald-500",
    ring: "ring-emerald-300/40",
    hex: "#34d399",
    soft: "bg-emerald-500/10",
    border: "border-emerald-500/40",
  },
};

export const accent = (key) => ACCENTS[key] || ACCENTS.green;

export const formatNumber = (n) =>
  new Intl.NumberFormat("en-IN").format(Math.round(Number(n) || 0));
