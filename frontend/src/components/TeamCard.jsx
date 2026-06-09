import React from "react";
import { accent, formatNumber } from "@/lib/style";
import { TEST_IDS } from "@/constants/testIds";
import Flag from "@/components/Flag";

const MemberRow = ({ index, member, accentKey, testId }) => {
  const a = accent(accentKey);
  return (
    <div
      data-testid={testId}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.025] transition-colors"
    >
      <span className="font-mono-wc text-[10px] text-[var(--wc-text-dim)] w-4">
        {index}
      </span>
      <span
        className={`flex-1 font-medium ${
          member.found ? "text-[var(--wc-text)]" : "text-[var(--wc-text-dim)] italic"
        }`}
      >
        {member.found ? member.leaderboard_name : `${member.label} (TBD)`}
      </span>
      <span className={`font-mono-wc text-xs ${a.text}`}>
        {formatNumber(member.points)}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--wc-text-dim)] w-14 text-right">
        {member.branch || "—"}
      </span>
    </div>
  );
};

export default function TeamCard({ team }) {
  const a = accent(team.accent);
  return (
    <div
      data-testid={TEST_IDS.teams.card(team.code)}
      className={`wc-card scan-line p-5 transition-transform hover:-translate-y-0.5 hover:${a.glow}`}
    >
      <span className="country-watermark">{team.code}</span>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.soft} border ${a.border}`}
          >
            <span className={`font-display text-sm ${a.text}`}>{team.code}</span>
          </div>
          <div>
            <div className="font-display uppercase text-lg leading-none tracking-wider flex items-center gap-2">
              <Flag code={team.flag_code} emoji={team.flag} size="md" alt={team.country} />
              <span>{team.country}</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--wc-text-dim)] mt-1">
              4 Counsellors · 1 Squad
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 h-[2px] w-full bg-gradient-to-r ${a.bar} opacity-70`}
      />

      <div className="mt-3 flex flex-col">
        {team.members.map((m, idx) => (
          <MemberRow
            key={m.label}
            index={idx + 1}
            member={m}
            accentKey={team.accent}
            testId={TEST_IDS.teams.member(team.code, m.label)}
          />
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--wc-border-soft)] pt-3 flex items-end justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--wc-text-dim)]">
          Team Total Points
        </div>
        <div
          data-testid={TEST_IDS.teams.total(team.code)}
          className={`font-display text-2xl ${a.text}`}
        >
          {formatNumber(team.total_points)}
        </div>
      </div>
    </div>
  );
}
