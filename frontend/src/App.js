import React, { useState } from "react";
import "@/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import SiteHeader from "@/components/SiteHeader";
import TeamsPage from "@/pages/TeamsPage";
import BracketPage from "@/pages/BracketPage";
import SchedulePage from "@/pages/SchedulePage";
import { fetchTeams, triggerRefresh } from "@/lib/api";

function Shell() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { data } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    refetchInterval: 5 * 60 * 1000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      await queryClient.invalidateQueries();
    } catch (_e) {
      // swallow; UI will show stale state
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <SiteHeader
        lastFetchedAt={data?.last_fetched_at}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      <main className="relative">
        <Routes>
          <Route path="/" element={<Navigate to="/teams" replace />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/bracket" element={<BracketPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="*" element={<Navigate to="/teams" replace />} />
        </Routes>
      </main>
      <footer className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-8 text-[10px] uppercase tracking-[0.22em] text-[var(--wc-text-dim)] text-center">
        © 2026 KIME · Sales World Cup · Powered by KIME Leaderboard
      </footer>
    </>
  );
}

export default function App() {
  return (
    <div className="App wc-grid">
      <BrowserRouter basename="/worldcupsales">
        <Shell />
      </BrowserRouter>
    </div>
  );
}
