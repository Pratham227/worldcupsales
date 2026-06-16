import React from "react";
import { Zap, Flame, Trophy, Target, ChevronRight } from "lucide-react";
import { TEST_IDS } from "@/constants/testIds";

const phases = [
  {
    key: "qf",
    icon: Zap,
    label: "QUARTER FINALS",
    accent: "text-emerald-300",
    border: "border-emerald-500/40",
    soft: "bg-emerald-500/5",
    date: "JUN 1 – 14",
    days: "14 days",
    color: "emerald",
    bullets: [
      ["Format:", "All 8 teams compete together in one open ranking window."],
      ["Scoring:", "Sum of every member's KIME monthly leaderboard points."],
      ["Qualification:", "Top 4 ranked teams qualify for Semi Finals."],
      ["Ranking:", "Updates in real time, refreshed every 5 minutes."],
      ["Tie-breaker:", "Highest single-day combined score during the window."],
    ],
  },
  {
    key: "sf",
    icon: Flame,
    label: "SEMI FINALS",
    accent: "text-cyan-300",
    border: "border-cyan-500/40",
    soft: "bg-cyan-500/5",
    date: "JUN 15 – 23 ",
    days: "8 days",
    color: "cyan",
    bullets: [
      ["Teams:", "Top 4 qualifiers — Match 1: Rank 1 vs Rank 4. Match 2: Rank 2 vs Rank 3."],
      ["Fresh Start:", "Points reset to zero. QF points do NOT carry over."],
      ["Scoring:", "Combined points of all 4 members across 8 days."],
      ["Advance:", "Higher team points in each matchup advance to the Final."],
      ["Pressure:", "7 days — every member must fire daily to win."],
    ],
  },
  {
    key: "final",
    icon: Trophy,
    label: "THE FINAL",
    accent: "text-amber-300",
    border: "border-amber-500/40",
    soft: "bg-amber-500/5",
    date: "JUN 24 – JUL 1",
    days: "7 days",
    color: "amber",
    bullets: [
      ["Teams:", "The 2 Semi Final winners. One match. Winner takes all."],
      ["Fresh Start:", "Points reset again. Clean fight to the finish."],
      ["Scoring:", "Combined leaderboard points of all 4 members over 7 days."],
      ["Winner:", "Team with highest total points on Jul 1, 11:00 IST = KIME World Cup Champion."],
      ["Prize:", "₹15,000 cash + Official WC Jersey + Football + WC Merchandise."],
    ],
  },
];

const RULES = [
  ["Team Points:", "Each phase = sum of all 4 members' individual leaderboard points in that window. Every member matters."],
  ["Points Reset:", "QF, SF and Final each start from zero. Performance does not carry forward."],
  ["Qualification:", "QF → Top 4 Teams · SF → Top 2 Teams · Final → Champion."],
  ["Tie-breaker:", "Highest single-day combined score in the window. Second: most days where the team led their opponent."],
  ["Leaderboard:", "Points are fetched automatically from the official KIME Monthly leaderboard. No manual entries accepted."],
  ["Refresh:", "Standings update every 5 minutes during all phases. Snapshots are captured at every phase boundary."],
];

export default function SchedulePage() {
  return (
    <div
      data-testid={TEST_IDS.schedule.page}
      className="max-w-5xl mx-auto px-5 sm:px-8 py-8 relative z-10"
    >
      <div className="relative pl-7">
        {/* timeline rail */}
        <div className="absolute left-2 top-3 bottom-3 w-px bg-gradient-to-b from-emerald-500/50 via-cyan-500/50 to-amber-500/50" />

        {phases.map((p) => {
          const Icon = p.icon;
          return (
            <section
              key={p.key}
              data-testid={TEST_IDS.schedule.phase(p.key)}
              className="relative mb-7"
            >
              <span
                className={`absolute -left-[22px] top-3 w-3 h-3 rounded-full border-2 ${
                  p.color === "emerald"
                    ? "border-emerald-400 bg-emerald-500/30"
                    : p.color === "cyan"
                    ? "border-cyan-400 bg-cyan-500/30"
                    : "border-amber-400 bg-amber-500/30"
                } shadow-[0_0_12px_currentColor]`}
              />
              <div className={`wc-card ${p.border} ${p.soft}`}>
                <header
                  className={`flex items-start justify-between px-5 py-4 border-b ${p.border}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${p.accent}`} />
                    <h2
                      className={`font-display tracking-[0.22em] text-lg ${p.accent}`}
                    >
                      {p.label}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className={`font-display text-base ${p.accent}`}>
                      {p.date}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)]">
                      {p.days}
                    </div>
                  </div>
                </header>
                <ul className="px-5 py-4 space-y-3">
                  {p.bullets.map(([label, value]) => (
                    <li
                      key={label}
                      className="flex gap-2 text-sm leading-relaxed"
                    >
                      <ChevronRight
                        className={`w-4 h-4 mt-0.5 ${p.accent} flex-shrink-0`}
                      />
                      <div>
                        <span className="font-display tracking-wider text-[var(--wc-text)]">
                          {label}
                        </span>{" "}
                        <span className="text-[var(--wc-text-soft)]">
                          {value}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {/* Full Rules */}
      <section
        data-testid={TEST_IDS.schedule.rules}
        className="wc-card border-emerald-500/30 p-5"
      >
        <header className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-300" />
          <h2 className="font-display tracking-[0.22em] text-base text-emerald-300">
            FULL CONTEST RULES
          </h2>
        </header>
        <ul className="space-y-3">
          {RULES.map(([label, value]) => (
            <li
              key={label}
              className="flex gap-2 text-sm leading-relaxed border-b border-[var(--wc-border-soft)] pb-3 last:border-0"
            >
              <ChevronRight className="w-4 h-4 mt-0.5 text-emerald-300 flex-shrink-0" />
              <div>
                <span className="font-display tracking-wider text-[var(--wc-text)]">
                  {label}
                </span>{" "}
                <span className="text-[var(--wc-text-soft)]">{value}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
