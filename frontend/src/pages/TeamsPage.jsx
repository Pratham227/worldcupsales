import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTeams } from "@/lib/api";
import WinningPrize from "@/components/WinningPrize";
import TeamCard from "@/components/TeamCard";
import { TEST_IDS } from "@/constants/testIds";

const PHASE_LABEL = {
  pre: "Pre-Tournament Preview",
  qf: "Quarter Finals",
  sf: "Semi Finals",
  final: "Final",
  ended: "Tournament Complete",
};

export default function TeamsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div
      data-testid={TEST_IDS.teams.page}
      className="max-w-7xl mx-auto px-5 sm:px-8 py-8 relative z-10"
    >
      <WinningPrize />

      <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)]">
        <span className="live-dot" />
        <span>
          Live Standings · Phase:{" "}
          <span className="text-[var(--wc-cyan)]">
            {PHASE_LABEL[data?.active_phase] || "—"}
          </span>
        </span>
        {data?.last_error ? (
          <span className="ml-3 text-red-400 normal-case">
            ({data.last_error})
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-10 text-center text-[var(--wc-text-dim)] uppercase tracking-widest text-sm">
          Loading squads…
        </div>
      ) : isError ? (
        <div className="mt-10 text-center text-red-400 uppercase tracking-widest text-sm">
          Unable to load teams.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {data?.teams?.map((team) => (
            <TeamCard key={team.code} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
