export const TEST_IDS = {
  header: {
    title: "site-title",
    subtitle: "site-subtitle",
    stat: (key) => `header-stat-${key}`,
  },
  nav: {
    teams: "nav-teams",
    bracket: "nav-bracket",
    schedule: "nav-schedule",
    refresh: "nav-refresh",
  },
  teams: {
    page: "teams-page",
    prize: "winning-prize-card",
    card: (code) => `team-card-${code.toLowerCase()}`,
    member: (code, label) =>
      `team-member-${code.toLowerCase()}-${label.toLowerCase().replace(/\s/g, "-")}`,
    total: (code) => `team-total-${code.toLowerCase()}`,
  },
  bracket: {
    page: "bracket-page",
    qfTable: "qf-standings-table",
    qfRow: (code) => `qf-row-${code.toLowerCase()}`,
    qfMatch: (i) => `qf-match-${i}`,
    qualified: (i) => `qualified-slot-${i}`,
    sf: (i) => `sf-match-${i}`,
    final: "final-match",
    champion: "champion-card",
  },
  schedule: {
    page: "schedule-page",
    phase: (key) => `schedule-${key}`,
    rules: "schedule-rules",
  },
};

export default TEST_IDS;
