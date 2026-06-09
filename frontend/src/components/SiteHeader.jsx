import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, RefreshCw } from "lucide-react";
import { TEST_IDS } from "@/constants/testIds";

const NAV_ITEMS = [
  { to: "/teams", label: "Teams", testId: TEST_IDS.nav.teams },
  { to: "/bracket", label: "Bracket", testId: TEST_IDS.nav.bracket },
  { to: "/schedule", label: "Schedule", testId: TEST_IDS.nav.schedule },
];

const HeaderStat = ({ value, label, accent, testId }) => (
  <div
    className="flex flex-col items-center justify-center px-4 sm:px-6"
    data-testid={testId}
  >
    <div
      className={`font-display text-2xl sm:text-3xl lg:text-4xl ${accent}`}
    >
      {value}
    </div>
    <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[var(--wc-text-dim)] mt-1">
      {label}
    </div>
  </div>
);

export default function SiteHeader({ lastFetchedAt, onRefresh, refreshing }) {
  const location = useLocation();
  const formatted = lastFetchedAt
    ? new Date(lastFetchedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <header className="relative z-10 border-b border-[var(--wc-border-soft)] bg-gradient-to-b from-[#06182f] via-[#040d1c] to-transparent">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-7 pb-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
          {/* Title block */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06192e] to-[#03101f] border border-[var(--wc-border)] flex items-center justify-center shadow-[0_0_28px_-6px_rgba(56,189,248,0.7)]">
                <Trophy className="w-6 h-6 text-[var(--wc-blue)]" />
              </div>
              <span className="absolute -bottom-1 -right-1 live-dot" />
            </div>
            <div>
              <h1
                data-testid={TEST_IDS.header.title}
                className="font-display neon-blue text-xl sm:text-2xl lg:text-3xl leading-none"
              >
                KIME SALES WORLD CUP 2026
              </h1>
              <p
                data-testid={TEST_IDS.header.subtitle}
                className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[var(--wc-text-soft)]"
              >
                <span className="text-cyan-300">Official KIME Sales Tournament</span>
                <span className="mx-2 text-[var(--wc-text-dim)]">·</span>
                QF <span className="text-[var(--wc-blue)]">→</span> SF{" "}
                <span className="text-[var(--wc-blue)]">→</span> Final
                <span className="mx-2 text-[var(--wc-text-dim)]">·</span>
                June–July 2026
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-stretch wc-card-soft rounded-2xl py-3">
            <HeaderStat
              value="8"
              label="Teams"
              accent="neon-blue"
              testId={TEST_IDS.header.stat("teams")}
            />
            <div className="wc-stat-divider" />
            <HeaderStat
              value="4"
              label="Per Team"
              accent="neon-cyan"
              testId={TEST_IDS.header.stat("members")}
            />
            <div className="wc-stat-divider" />
            <HeaderStat
              value="₹20K"
              label="Prize"
              accent="neon-amber"
              testId={TEST_IDS.header.stat("prize")}
            />
            <div className="wc-stat-divider" />
            <HeaderStat
              value="31"
              label="Days"
              accent="neon-green"
              testId={TEST_IDS.header.stat("days")}
            />
          </div>
        </div>

        {/* Nav row */}
        <div className="mt-5 flex items-center justify-between border-t border-[var(--wc-border-soft)] pt-3">
          <nav className="flex items-center gap-6 sm:gap-9 relative">
            {NAV_ITEMS.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to === "/teams" && location.pathname === "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-testid={item.testId}
                  className={`nav-link font-display uppercase text-[11px] sm:text-xs tracking-[0.28em] ${
                    active
                      ? "text-[var(--wc-blue)] nav-active"
                      : "text-[var(--wc-text-soft)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)]">
            <span className="live-dot" />
            <span>Live · {formatted} IST</span>
            <button
              onClick={onRefresh}
              data-testid={TEST_IDS.nav.refresh}
              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--wc-border)] hover:border-[var(--wc-blue)] hover:text-[var(--wc-blue)] transition-colors text-[10px]"
            >
              <RefreshCw
                className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
