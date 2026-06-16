import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStandings } from "@/lib/api";
import { accent, formatNumber } from "@/lib/style";
import { Trophy, Crown, Star, CheckCircle2 } from "lucide-react";
import { TEST_IDS } from "@/constants/testIds";
import Flag from "@/components/Flag";

const PhaseHeader = ({ label, dates, days, color, icon: Icon }) => (
  <div className="text-center">
    <div
      className={`font-display tracking-[0.28em] text-xs sm:text-sm flex items-center justify-center gap-2 ${color}`}
    >
      {Icon ? <Icon className="w-4 h-4" /> : null}
      {label}
    </div>
    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)] mt-1">
      {dates} · {days}
    </div>
  </div>
);

const QualifiedCard = ({ team, fallbackRank, testId }) => {
  if (!team) {
    return (
      <div
        data-testid={testId}
        className="wc-card px-4 py-4 min-w-[230px] max-w-[280px] border-dashed opacity-60"
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)]">
          <span>RANK {fallbackRank}</span>
          <span>TBD</span>
        </div>
        <div className="mt-3 text-[var(--wc-text-dim)] italic text-sm">
          Awaiting points…
        </div>
      </div>
    );
  }
  const a = accent(team.accent);
  return (
    <div
      data-testid={testId}
      className={`wc-card px-4 py-4 min-w-[230px] max-w-[280px] wc-fade-up relative overflow-hidden ${a.glow}`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
        <span className={`font-display ${a.text}`}>RANK {team.qf_rank}</span>
        <span className="inline-flex items-center gap-1 text-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          QUALIFIED
        </span>
      </div>
      <div className={`mt-3 h-[2px] w-full bg-gradient-to-r ${a.bar} opacity-70`} />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Flag code={team.flag_code} emoji={team.flag} size="md" alt={team.country} />
          <div className="min-w-0">
            <div className="font-display tracking-wide text-base truncate">
              {team.country}
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)]">
              {team.code}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono-wc text-lg ${a.text}`}>
            {formatNumber(team.total_points)}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--wc-text-dim)]">
            pts
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamRow = ({ team, isWinner, pointsField, seedLabel }) => {
  if (!team) {
    return (
      <div className="flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-2">
          {seedLabel ? (
            <span className="text-[10px] font-display tracking-[0.18em] text-[var(--wc-text-dim)] w-10">
              {seedLabel}
            </span>
          ) : null}
          <span className="text-[var(--wc-text-dim)] italic">TBD</span>
        </div>
        <span className="font-mono-wc text-[var(--wc-text-dim)]">—</span>
      </div>
    );
  }
  const a = accent(team.accent);
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 min-w-0">
        {seedLabel ? (
          <span className="text-[10px] font-display tracking-[0.18em] text-[var(--wc-text-dim)] w-10">
            {seedLabel}
          </span>
        ) : null}
        <Flag code={team.flag_code} emoji={team.flag} size="sm" alt={team.country} />
        <span
          className={`font-display tracking-wide text-sm ${
            isWinner ? a.text : "text-[var(--wc-text)]"
          } flex items-center gap-1 truncate`}
        >
          {team.country}
          {isWinner ? <Star className={`w-3 h-3 ${a.text}`} fill="currentColor" /> : null}
        </span>
      </div>
      <span
        className={`font-mono-wc text-sm ${
          isWinner ? a.text : "text-[var(--wc-text-soft)]"
        }`}
      >
        {formatNumber(team[pointsField] ?? 0)}
      </span>
    </div>
  );
};

const MatchCard = ({
  match,
  teamA,
  teamB,
  winner,
  pointsField,
  variant = "default",
  testId,
  dateRange,
  seedLabelA,
  seedLabelB,
}) => {
  const isFinal = variant === "final";
  const cardClass = isFinal
    ? "wc-card border-amber-500/40 champion-glow"
    : "wc-card";
  const headerColor = isFinal
    ? "text-amber-300"
    : variant === "sf"
      ? "text-cyan-300"
      : "text-sky-300";

  return (
    <div
      data-testid={testId}
      className={`${cardClass} relative px-4 py-3 min-w-[230px] max-w-[280px] wc-fade-up`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
        <span className={`font-display ${headerColor}`}>
          {isFinal ? (
            <span className="inline-flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {match || "FINAL"}
            </span>
          ) : (
            match
          )}
        </span>
        <span className="text-[var(--wc-text-dim)]">{dateRange}</span>
      </div>
      <div className="h-px bg-[var(--wc-border-soft)] my-2" />
      <TeamRow
        team={teamA}
        isWinner={winner?.code === teamA?.code}
        pointsField={pointsField}
        seedLabel={seedLabelA}
      />
      <div className="h-px bg-[var(--wc-border-soft)] my-1" />
      <TeamRow
        team={teamB}
        isWinner={winner?.code === teamB?.code}
        pointsField={pointsField}
        seedLabel={seedLabelB}
      />
    </div>
  );
};

const ChampionCard = ({ champion }) => (
  <div
    data-testid={TEST_IDS.bracket.champion}
    className="rounded-2xl champion-glow p-5 sm:p-6 text-center min-w-[230px] max-w-[280px] mx-auto wc-fade-up"
  >
    <Crown className="w-9 h-9 text-amber-300 mx-auto" />
    <div className="mt-2 font-display uppercase tracking-[0.28em] text-amber-200 text-[10px]">
      KIME Champion
    </div>
    {champion ? (
      <>
        <div className="mt-3 flex justify-center">
          <Flag code={champion.flag_code} emoji={champion.flag} size="xl" alt={champion.country} />
        </div>
        <div className="mt-2 font-display text-2xl neon-amber">
          {champion.country.toUpperCase()}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-amber-200/70">
          Winning Points · {formatNumber(champion.final_points)}
        </div>
      </>
    ) : (
      <div className="mt-3 text-xs text-amber-200/70 italic">
        Crowned on Jul 1, 2026.
      </div>
    )}
    <div className="mt-3 px-3 py-2 rounded-lg border border-amber-400/40 bg-amber-500/5 text-[10px] uppercase tracking-[0.18em] text-amber-200/80 leading-relaxed">
      ₹20,000 + Official WC Jersey
      <br /> + Football + Merch
    </div>
  </div>
);

const BracketGrid = ({ qualified, semiFinals, finalBlock, champion }) => {
  const [sf1, sf2] = semiFinals;

  // Ensure we always render 4 slots in the QF column (even if fewer teams).
  const slots = [0, 1, 2, 3].map((i) => qualified?.[i] || null);

  return (
    <div className="relative">
      {/* Column headers */}
      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr_1fr] gap-4 mb-6">
        <PhaseHeader
          label="QUARTER FINALS"
          dates="Jun 1 – 14"
          days="Top 4 advance"
          color="text-emerald-300"
        />
        <div className="hidden lg:block">
          <PhaseHeader
            label="SEMI FINAL 1"
            dates="Jun 15 – 23"
            days="R1 vs R4"
            color="text-cyan-300"
          />
        </div>
        <div className="hidden lg:block">
          <PhaseHeader
            label="FINAL"
            dates="Jun 24 – Jul 1"
            days="10 days"
            color="text-amber-300"
            icon={Trophy}
          />
        </div>
        <div className="hidden lg:block">
          <PhaseHeader
            label="SEMI FINAL 2"
            dates="Jun 15 – 23"
            days="R2 vs R3"
            color="text-cyan-300"
          />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.1fr_1fr] gap-x-4 gap-y-6 items-center">
        {/* Column 1: 4 qualified teams stacked */}
        <div className="flex flex-col gap-4">
          {slots.map((team, idx) => (
            <QualifiedCard
              key={idx}
              team={team}
              fallbackRank={idx + 1}
              testId={TEST_IDS.bracket.qualified(idx + 1)}
            />
          ))}
        </div>

        {/* Column 2: SF1 (R1 vs R4) */}
        <div className="hidden lg:flex flex-col justify-center">
          <MatchCard
            match="SF 1"
            teamA={sf1?.teamA}
            teamB={sf1?.teamB}
            winner={sf1?.winner}
            pointsField="sf_points"
            variant="sf"
            dateRange="JUN 15-23"
            seedLabelA="R1"
            seedLabelB="R4"
            testId={TEST_IDS.bracket.sf(1)}
          />
        </div>

        {/* Column 3: Final + Champion (center) */}
        <div className="hidden lg:flex flex-col items-center gap-5">
          <MatchCard
            match="FINAL"
            teamA={finalBlock?.teamA}
            teamB={finalBlock?.teamB}
            winner={champion}
            pointsField="final_points"
            variant="final"
            dateRange="JUN 24 - JUL 1"
            testId={TEST_IDS.bracket.final}
          />
          <ChampionCard champion={champion} />
        </div>

        {/* Column 4: SF2 (R2 vs R3) */}
        <div className="hidden lg:flex flex-col justify-center">
          <MatchCard
            match="SF 2"
            teamA={sf2?.teamA}
            teamB={sf2?.teamB}
            winner={sf2?.winner}
            pointsField="sf_points"
            variant="sf"
            dateRange="JUN 15-21"
            seedLabelA="R2"
            seedLabelB="R3"
            testId={TEST_IDS.bracket.sf(2)}
          />
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="lg:hidden mt-8 space-y-5">
        <div className="text-center font-display tracking-[0.28em] text-cyan-300 text-xs">
          SEMI FINALS · Jun 15 – 23
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MatchCard
            match="SF 1"
            teamA={sf1?.teamA}
            teamB={sf1?.teamB}
            winner={sf1?.winner}
            pointsField="sf_points"
            variant="sf"
            dateRange="JUN 15-23"
            seedLabelA="R1"
            seedLabelB="R4"
            testId={TEST_IDS.bracket.sf(1) + "-mobile"}
          />
          <MatchCard
            match="SF 2"
            teamA={sf2?.teamA}
            teamB={sf2?.teamB}
            winner={sf2?.winner}
            pointsField="sf_points"
            variant="sf"
            dateRange="JUN 15-23"
            seedLabelA="R2"
            seedLabelB="R3"
            testId={TEST_IDS.bracket.sf(2) + "-mobile"}
          />
        </div>
        <div className="text-center font-display tracking-[0.28em] text-amber-300 text-xs mt-6">
          FINAL · Jun 24 – Jul 1
        </div>
        <MatchCard
          match="FINAL"
          teamA={finalBlock?.teamA}
          teamB={finalBlock?.teamB}
          winner={champion}
          pointsField="final_points"
          variant="final"
          dateRange="JUN 24 - JUL 1"
          testId={TEST_IDS.bracket.final + "-mobile"}
        />
        <ChampionCard champion={champion} />
      </div>
    </div>
  );
};

export default function BracketPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["standings"],
    queryFn: fetchStandings,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <div
        data-testid={TEST_IDS.bracket.page}
        className="max-w-7xl mx-auto px-5 sm:px-8 py-12 text-center text-[var(--wc-text-dim)] uppercase tracking-widest text-sm"
      >
        Loading bracket…
      </div>
    );
  }

  return (
    <div
      data-testid={TEST_IDS.bracket.page}
      className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 relative z-10"
    >
      {/* Bonus Points Announcement */}
      <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/[0.08] px-4 py-3 text-[12px] sm:text-sm text-amber-100 leading-relaxed animate-pulse">
        <span className="text-amber-300 font-display tracking-wider">
          BONUS POINTS ALERT
        </span>{" "}
        — On <span className="text-yellow-300 font-semibold">13 June & 14 June</span>,
        every successful admission will earn an additional{" "}
        <span className="text-yellow-300 font-bold">+50 BONUS POINTS</span>.
        These bonus points will be added to the Quarter Final rankings and can be
        crucial for securing a Top 4 qualification spot.
     </div>

      <div className="rounded-xl border border-sky-500/40 bg-sky-500/[0.05] px-4 py-3 text-[12px] sm:text-sm text-sky-100/80 leading-relaxed">
        <span className="text-sky-300 font-display tracking-wider">
          OFFICIAL FIFA 2026 BRACKET PATH
        </span>{" "}
        — Top 4 ranked teams qualify from the QF window. Semi Finals pair{" "}
        <span className="text-cyan-300">R1 vs R4</span> and{" "}
        <span className="text-cyan-300">R2 vs R3</span>. Each phase is a{" "}
        <span className="text-emerald-300">fresh points window</span>.
      </div>

      <div className="mt-8">
        <BracketGrid
          qualified={data.qualified_teams || []}
          semiFinals={data.semi_finals || []}
          finalBlock={data.final}
          champion={data.champion}
        />
      </div>

      {/* Full QF ranking (all 8 teams) */}
      <div className="mt-12 wc-card p-5 sm:p-6">
        <header className="flex items-center justify-between mb-4">
          <h2 className="font-display tracking-[0.22em] text-emerald-300 text-sm">
            QF RANKING · LIVE TEAM POINTS
          </h2>
          <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)]">
            All 8 teams · Top 4 advance
          </span>
        </header>
        <div className="overflow-x-auto no-scrollbar">
          <table
            data-testid={TEST_IDS.bracket.qfTable}
            className="w-full text-sm"
          >
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-[var(--wc-text-dim)] border-b border-[var(--wc-border-soft)]">
                <th className="py-2 w-10">#</th>
                <th className="py-2">Country</th>
                <th className="py-2 text-right">Points</th>
                <th className="py-2 text-right pr-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.qf_standings || []).map((t) => {
                const a = accent(t.accent);
                const qual = t.qf_status === "Qualified";
                return (
                  <tr
                    key={t.code}
                    data-testid={TEST_IDS.bracket.qfRow(t.code)}
                    className="border-b border-[var(--wc-border-soft)] last:border-0"
                  >
                    <td className="py-2.5">
                      <span
                        className={`font-display text-base ${
                          qual ? a.text : "text-[var(--wc-text-dim)]"
                        }`}
                      >
                        {t.qf_rank}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Flag code={t.flag_code} emoji={t.flag} size="sm" alt={t.country} />
                        <span className="font-display tracking-wider text-sm">
                          {t.country}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`font-mono-wc ${a.text}`}>
                        {formatNumber(t.total_points)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right pr-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display tracking-[0.18em] uppercase border ${
                          qual
                            ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/10"
                            : "text-red-300 border-red-400/40 bg-red-500/10"
                        }`}
                      >
                        {t.qf_status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
