import React from "react";
import { IndianRupee, Shirt, CircleDot, Gift, Trophy } from "lucide-react";
import { TEST_IDS } from "@/constants/testIds";

const Item = ({ icon: Icon, value, label, glow }) => (
  <div className="flex flex-col items-center text-center px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 min-w-[120px]">
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${glow}`}
      style={{ background: "rgba(251,191,36,0.12)" }}
    >
      <Icon className="w-5 h-5 text-amber-300" />
    </div>
    <div className="font-display text-amber-200 text-base sm:text-lg leading-tight">
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70 mt-1">
      {label}
    </div>
  </div>
);

export default function WinningPrize() {
  return (
    <div
      data-testid={TEST_IDS.teams.prize}
      className="relative rounded-2xl border border-amber-500/40 champion-glow p-5 sm:p-7 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-400/50 flex items-center justify-center shadow-[0_0_28px_-6px_rgba(251,191,36,0.6)]">
            <Trophy className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="font-display neon-amber text-2xl sm:text-3xl">
              WINNING TEAM PRIZE
            </div>
            <div className="text-xs sm:text-sm text-amber-200/70 tracking-wider mt-1 uppercase">
              Highest combined leaderboard points in the Final
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 lg:ml-auto">
          <Item
            icon={IndianRupee}
            value="₹20,000"
            label="Cash"
            glow="shadow-[0_0_18px_-6px_rgba(251,191,36,0.7)]"
          />
          <Item
            icon={Shirt}
            value="Jersey"
            label="Official WC"
            glow="shadow-[0_0_18px_-6px_rgba(52,211,153,0.6)]"
          />
          <Item
            icon={CircleDot}
            value="Football"
            label="Official WC"
            glow="shadow-[0_0_18px_-6px_rgba(34,211,238,0.6)]"
          />
          <Item
            icon={Gift}
            value="Merch"
            label="WC Bundle"
            glow="shadow-[0_0_18px_-6px_rgba(251,146,60,0.6)]"
          />
        </div>
      </div>
    </div>
  );
}
