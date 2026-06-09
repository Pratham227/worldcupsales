# KIME Sales World Cup 2026 — PRD

## Original Problem
Build a premium FIFA-style world cup site for the KIME Sales tournament (June–July 2026). 8 teams (countries), 4 members each, live integration with the KIME Monthly leaderboard. Match the existing kime leaderboard premium dark/neon aesthetic and the provided reference screenshots. 3-tab nav: Teams · Bracket · Schedule. No captain labels. QF = all 8 teams compete openly, top 4 advance. SF1 = R1 vs R4, SF2 = R2 vs R3. Final = SF winners. Each phase resets points to zero. Refresh leaderboard every 5 minutes.

## Tech stack
- Frontend: React 19 + Tailwind + shadcn/ui + framer-motion + lucide-react. Routes: /teams, /bracket, /schedule.
- Backend: FastAPI (single `server.py`) + MongoDB (motor) + httpx for KIME API polling.
- KIME source: `https://leaderboard.kimeedu.co.in/api/leaderboard?period=Monthly` (no auth).

## Core Requirements
1. Dark premium theme with neon orange/green/cyan/amber accents and grid background.
2. Header: title, subtitle, 4 stat cards (8 Teams · 4 Per Team · ₹15K · 31 Days), live time + manual refresh button.
3. Teams page: golden "Winning Team Prize" card + 8 country cards with code watermark, flag, member rows (no captain), branch beside each name, live total points.
4. Bracket page: QF standings table (top 4 Qualified / bottom 4 Eliminated), SF1/SF2 cards (R1 vs R4, R2 vs R3), Final card, Champion card with prize chips.
5. Schedule page: vertical timeline (QF / SF / Final) + Full Contest Rules block.
6. Phase math: QF = current monthly. SF = current − qf_end snapshot. Final = current − sf_end snapshot. Boundary snapshots captured automatically by background loop.
7. Auto refresh every 5 minutes (backend cache + frontend React Query polling).

## Team → Counsellor mapping
| Country | Members |
|---|---|
| Brazil | Netra Chinta · Akshata Shirawale · Diksh Shaikh · Bhagyashree Palan |
| Germany | Prasad Deshpande · Ashwini Nikam · Evana Manohar · Vighnesh Iyer |
| Netherlands | Rahul Dembda · Darshan Gandhi · Sujitha (TBD) · Kanchan Pathare |
| Spain | Ayesha Khan · Priyanshu (TBD) · Gaurav Kadam · Amod Tripathi |
| France | Vineeth Prashant · Suwarnaprabha Dive · Mansi Sharma · Shresth (TBD) |
| Argentina | Sai Das · Astha Pande · Vijay Badsiwal · Vrushabh (TBD) |
| Portugal | Shamal Dhanawade · Aachal Dahikar · Harshit Amuley · Kajal Tiwari |
| England | Janhavi Nakshulwar · Ishita Bahl · Shraddha Singh · Janhavi Gunde |

Names marked **TBD** are not present on the KIME leaderboard and render greyed/italic with 0 points until added.

## Implemented (2026-06-08)
- Backend `/api/teams`, `/api/standings`, `/api/leaderboard`, `/api/health`, `/api/refresh` endpoints.
- 5-minute background polling loop + on-demand snapshotting at every phase boundary.
- Frontend Teams / Bracket / Schedule pages with premium dark theme + neon glow + grid overlay.
- React Query polling (5 min) + manual refresh button.

## Backlog (P1/P2)
- P1: Per-member daily activity sparkline (tie-breaker insight).
- P1: Phase countdown widgets on header (e.g. "QF ends in 6d 12h").
- P2: Public share/OG image generator with current champion.
- P2: Admin endpoint to override unmatched counsellor names via DB doc.
- P2: Push notifications when a team takes the lead.
