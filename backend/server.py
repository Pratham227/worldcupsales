"""KIME Sales World Cup 2026 — Backend API.

Fetches the KIME monthly leaderboard, aggregates points per country team,
maintains per-phase snapshots (QF / SF / Final), and exposes JSON endpoints
consumed by the React frontend.
"""
from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- Logging ----------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("kime-wc")

# ---------- Mongo ----------
mongo_url = os.environ["MONGO_URL"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ["DB_NAME"]]

# ---------- Config ----------
KIME_API_URL = os.environ.get(
    "KIME_API_URL",
    "https://leaderboard.kimeedu.co.in/api/leaderboard?period=Monthly",
)
REFRESH_INTERVAL_SECONDS = int(os.environ.get("REFRESH_INTERVAL_SECONDS", "300"))

IST = timezone(timedelta(hours=5, minutes=30))

# Tournament phases (Asia/Kolkata local time)
PHASES: Dict[str, Dict[str, Any]] = {
    "qf": {
        "key": "qf",
        "label": "Quarter Finals",
        "short": "QF",
        "start": datetime(2026, 6, 1, 0, 0, 0, tzinfo=IST),
        "end": datetime(2026, 6, 14, 23, 59, 59, tzinfo=IST),
        "date_range": "Jun 1 – Jun 14",
        "days": 14,
        "accent": "green",
    },
    "sf": {
        "key": "sf",
        "label": "Semi Finals",
        "short": "SF",
        "start": datetime(2026, 6, 15, 0, 0, 0, tzinfo=IST),
        "end": datetime(2026, 6, 21, 23, 59, 59, tzinfo=IST),
        "date_range": "Jun 15 – Jun 21",
        "days": 7,
        "accent": "cyan",
    },
    "final": {
        "key": "final",
        "label": "Final",
        "short": "FINAL",
        "start": datetime(2026, 6, 22, 0, 0, 0, tzinfo=IST),
        "end": datetime(2026, 7, 1, 11, 0, 0, tzinfo=IST),
        "date_range": "Jun 22 – Jul 1",
        "days": 10,
        "accent": "amber",
    },
}

# 8 country teams. `leaderboard_name` is the exact KIME counsellor name.
TEAMS: List[Dict[str, Any]] = [
    {
        "code": "BR",
        "country": "Brazil",
        "flag": "🇧🇷",
        "flag_code": "br",
        "accent": "amber",
        "members": [
            
            {"label": "Prasad", "leaderboard_name": "Prasad Deshpande"},
            {"label": "Ashwini", "leaderboard_name": "Ashwini Nikam"},
            {"label": "Manohar", "leaderboard_name": "Evana Manohar"},
            {"label": "Vighnesh", "leaderboard_name": "Vighnesh Iyer"},
        ],
    },
    {
        "code": "DE",
        "country": "Germany",
        "flag": "🇩🇪",
        "flag_code": "de",
        "accent": "slate",
        "members": [
            {"label": "Ayesha", "leaderboard_name": "Ayesha Khan"},
            {"label": "Priyanshu", "leaderboard_name": "Priyanshu Sharma"},
            {"label": "Gaurav", "leaderboard_name": "Gaurav Kadam"},
            {"label": "Amod", "leaderboard_name": "Amod Tripathi"},
        ],
    },
    {
        "code": "NL",
        "country": "Netherlands",
        "flag": "🇳🇱",
        "flag_code": "nl",
        "accent": "orange",
        "members": [
            {"label": "Netra", "leaderboard_name": "Netra Chinta"},
            {"label": "Akshata", "leaderboard_name": "Akshata Shirawale"},
            {"label": "Diksh", "leaderboard_name": "Diksh Shaikh"},
            {"label": "Bhagyalaxmi", "leaderboard_name": "Bhagyashree Palan"},
            
            
        ],
    },
    {
        "code": "ES",
        "country": "Spain",
        "flag": "🇪🇸",
        "flag_code": "es",
        "accent": "rose",
        "members": [
            {"label": "Shamal", "leaderboard_name": "Shamal Dhanawade"},
            {"label": "Aanchal", "leaderboard_name": "Aachal Dahikar"},
            {"label": "Harshit", "leaderboard_name": "Harshit Amuley"},
            {"label": "Kajal", "leaderboard_name": "Kajal Tiwari"},
            
        ],
    },
    {
        "code": "FR",
        "country": "France",
        "flag": "🇫🇷",
        "flag_code": "fr",
        "accent": "blue",
        "members": [
            
            {"label": "Janhavi G.", "leaderboard_name": "Janhavi Gunde"},
            {"label": "Ishita", "leaderboard_name": "Ishita Bahl"},
            {"label": "Shraddha", "leaderboard_name": "Shraddha Singh"},
            {"label": "Janhavi N.", "leaderboard_name": "Janhavi Nakshulwar"},
        ],
    },
    {
        "code": "AR",
        "country": "Argentina",
        "flag": "🇦🇷",
        "flag_code": "ar",
        "accent": "cyan",
        "members": [
            {"label": "Sai", "leaderboard_name": "Sai Das"},
            {"label": "Astha", "leaderboard_name": "Astha Pande"},
            {"label": "Vijay", "leaderboard_name": "Vijay Badsiwal"},
            {"label": "Vrushabraj", "leaderboard_name": "Vrushabraj Maharana"},
        ],
    },
    {
        "code": "PT",
        "country": "Portugal",
        "flag": "🇵🇹",
        "flag_code": "pt",
        "accent": "red",
        "members": [
            {"label": "Vineeth", "leaderboard_name": "Vineeth Prashant"},
            {"label": "Suwarna", "leaderboard_name": "Suwarnaprabha Dive"},
            {"label": "Mansi", "leaderboard_name": "Mansi Kamble"},
            {"label": "Shresth", "leaderboard_name": "Shreshth Kishore"},
        ],
    },
    {
        "code": "EN",
        "country": "England",
        "flag": "en",
        "flag_code": "gb-eng",
        "accent": "violet",
        "members": [
            {"label": "Rahul", "leaderboard_name": "Rahul Dembda"},
            {"label": "Darshan", "leaderboard_name": "Darshan Gandhi"},
            {"label": "Sujita", "leaderboard_name": "Sujit Pal"},
            {"label": "Kanchan", "leaderboard_name": "Kanchan Pathare"},
        ],
    },
]

# In-memory cache. Snapshots live in MongoDB so they persist across restarts.
state: Dict[str, Any] = {
    "leaderboard": [],          # raw list from KIME
    "by_name": {},              # name -> {points, branch, rank, ...}
    "last_fetched_at": None,    # ISO string
    "last_error": None,
}


def _now_ist() -> datetime:
    return datetime.now(IST)


def current_phase_key(now: Optional[datetime] = None) -> str:
    n = now or _now_ist()
    if n < PHASES["qf"]["start"]:
        return "pre"
    if n <= PHASES["qf"]["end"]:
        return "qf"
    if n <= PHASES["sf"]["end"]:
        return "sf"
    if n <= PHASES["final"]["end"]:
        return "final"
    return "ended"


def _normalize_name(name: str) -> str:
    return " ".join((name or "").strip().split()).lower()


async def fetch_leaderboard() -> List[Dict[str, Any]]:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(KIME_API_URL)
        r.raise_for_status()
        payload = r.json()
    if not isinstance(payload, dict) or not payload.get("ok"):
        raise RuntimeError(f"Unexpected leaderboard payload: {payload!r}")
    return payload.get("data", [])


async def _capture_snapshot_if_needed(boundary_key: str, boundary_time: datetime) -> None:
    """Persist a snapshot of per-counsellor points at a phase boundary.

    boundary_key looks like "qf_start" / "qf_end" / "sf_start" / etc.
    Snapshot is only captured once the boundary time has passed.
    """
    now = _now_ist()
    if now < boundary_time:
        return
    existing = await db.phase_snapshots.find_one({"boundary": boundary_key})
    if existing:
        return
    snapshot_points = {
        _normalize_name(row.get("name", "")): float(row.get("points", 0) or 0)
        for row in state["leaderboard"]
    }
    doc = {
        "boundary": boundary_key,
        "captured_at": now.isoformat(),
        "points": snapshot_points,
    }
    await db.phase_snapshots.insert_one(doc)
    logger.info("Captured phase snapshot %s with %d entries", boundary_key, len(snapshot_points))


async def _ensure_phase_snapshots() -> None:
    for key, phase in PHASES.items():
        await _capture_snapshot_if_needed(f"{key}_start", phase["start"])
        await _capture_snapshot_if_needed(f"{key}_end", phase["end"])


async def refresh_leaderboard() -> Dict[str, Any]:
    try:
        data = await fetch_leaderboard()
        state["leaderboard"] = data
        state["by_name"] = {_normalize_name(r.get("name", "")): r for r in data}
        state["last_fetched_at"] = _now_ist().isoformat()
        state["last_error"] = None
        logger.info("Leaderboard refreshed: %d counsellors", len(data))
        await _ensure_phase_snapshots()
    except Exception as exc:  # noqa: BLE001
        state["last_error"] = str(exc)
        logger.exception("Leaderboard refresh failed: %s", exc)
    return {
        "ok": state["last_error"] is None,
        "count": len(state["leaderboard"]),
        "last_fetched_at": state["last_fetched_at"],
        "error": state["last_error"],
    }


async def _load_snapshot(boundary_key: str) -> Dict[str, float]:
    doc = await db.phase_snapshots.find_one({"boundary": boundary_key})
    if not doc:
        return {}
    return doc.get("points") or {}


def _player_current_points(name: str) -> float:
    row = state["by_name"].get(_normalize_name(name))
    if not row:
        return 0.0
    return float(row.get("points", 0) or 0)


def _player_branch(name: str) -> str:
    row = state["by_name"].get(_normalize_name(name))
    if not row:
        return "—"
    return row.get("branch") or "—"


def _player_rank(name: str) -> Optional[int]:
    row = state["by_name"].get(_normalize_name(name))
    if not row:
        return None
    return row.get("rank")


def _player_found(name: str) -> bool:
    return _normalize_name(name) in state["by_name"]


async def compute_phase_points(name: str, phase_key: str) -> float:
    """Return the points accumulated by `name` during `phase_key`.

    The KIME monthly leaderboard resets on the 1st of every month. Phase
    boundaries are anchored to that reset:

    - QF starts on Jun 1 (month reset) → QF points = current monthly points.
    - SF starts on Jun 15 → SF points = current monthly - `qf_end` snapshot.
    - Final starts on Jun 22 → Final = current monthly - `sf_end` snapshot.

    End-of-phase snapshots are taken once the boundary passes, freezing the
    completed-phase value.
    """
    if phase_key in ("pre",):
        return 0.0
    if phase_key == "ended":
        phase_key = "final"

    norm = _normalize_name(name)
    cur_pts = _player_current_points(name)

    if phase_key == "qf":
        qf_end = await _load_snapshot("qf_end")
        if qf_end:
            return max(float(qf_end.get(norm, 0) or 0), 0.0)
        return max(cur_pts, 0.0)

    if phase_key == "sf":
        qf_end = await _load_snapshot("qf_end")
        if not qf_end:
            return 0.0
        base = float(qf_end.get(norm, 0) or 0)
        sf_end = await _load_snapshot("sf_end")
        if sf_end:
            return max(float(sf_end.get(norm, 0) or 0) - base, 0.0)
        return max(cur_pts - base, 0.0)

    if phase_key == "final":
        sf_end = await _load_snapshot("sf_end")
        if not sf_end:
            return 0.0
        base = float(sf_end.get(norm, 0) or 0)
        final_end = await _load_snapshot("final_end")
        if final_end:
            return max(float(final_end.get(norm, 0) or 0) - base, 0.0)
        return max(cur_pts - base, 0.0)

    return 0.0


async def build_team_payload(active_phase: str) -> List[Dict[str, Any]]:
    """Build per-team payload including member points for the active phase."""
    teams_out: List[Dict[str, Any]] = []
    for team in TEAMS:
        members_out = []
        team_total = 0.0
        for m in team["members"]:
            name = m["leaderboard_name"]
            found = _player_found(name)
            if active_phase in ("pre", "ended") and active_phase == "pre":
                # Pre-tournament preview: show live monthly points so the page is alive.
                pts = _player_current_points(name) if found else 0.0
            else:
                pts = await compute_phase_points(name, active_phase)
            team_total += pts
            members_out.append(
                {
                    "label": m["label"],
                    "leaderboard_name": name,
                    "branch": _player_branch(name) if found else "—",
                    "rank": _player_rank(name) if found else None,
                    "points": round(pts),
                    "found": found,
                }
            )
        teams_out.append(
            {
                "code": team["code"],
                "country": team["country"],
                "flag": team["flag"],
                "flag_code": team["flag_code"],
                "accent": team["accent"],
                "members": members_out,
                "total_points": round(team_total),
            }
        )
    return teams_out


def _phase_meta(key: str) -> Dict[str, Any]:
    p = PHASES[key]
    return {
        "key": p["key"],
        "label": p["label"],
        "short": p["short"],
        "date_range": p["date_range"],
        "days": p["days"],
        "accent": p["accent"],
        "start": p["start"].isoformat(),
        "end": p["end"].isoformat(),
    }


async def build_standings_payload() -> Dict[str, Any]:
    """Bracket payload — top-4 ranking model (SF1=R1vR4, SF2=R2vR3)."""
    active = current_phase_key()

    # ---- Quarter Finals (open ranking) ----
    qf_phase_key = "qf" if active not in ("pre",) else "pre"
    qf_teams = await build_team_payload(qf_phase_key)
    by_code = {t["code"]: t for t in qf_teams}

    qf_sorted = sorted(qf_teams, key=lambda t: t["total_points"], reverse=True)
    for idx, t in enumerate(qf_sorted, start=1):
        t["qf_rank"] = idx
        t["qf_status"] = "Qualified" if idx <= 4 else "Eliminated"

    qualified = qf_sorted[:4]

    # ---- Semi Finals: Rank 1 vs Rank 4, Rank 2 vs Rank 3 ----
    sf_teams_map: Dict[str, Dict[str, Any]] = {}
    if active in ("sf", "final", "ended"):
        sf_payload = await build_team_payload("sf")
        sf_teams_map = {t["code"]: t for t in sf_payload}

    def _sf_team(qf_team: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not qf_team:
            return None
        return {
            "code": qf_team["code"],
            "country": qf_team["country"],
            "flag": qf_team["flag"],
            "flag_code": qf_team.get("flag_code"),
            "accent": qf_team["accent"],
            "qf_rank": qf_team["qf_rank"],
            "qf_points": qf_team["total_points"],
            "sf_points": sf_teams_map.get(qf_team["code"], {}).get("total_points", 0),
        }

    sf1_a = qualified[0] if len(qualified) >= 1 else None
    sf1_b = qualified[3] if len(qualified) >= 4 else None
    sf2_a = qualified[1] if len(qualified) >= 2 else None
    sf2_b = qualified[2] if len(qualified) >= 3 else None

    sf_left = {
        "match": "SF1",
        "label": "Semi Final 1",
        "date_range": PHASES["sf"]["date_range"],
        "teamA": _sf_team(sf1_a),
        "teamB": _sf_team(sf1_b),
    }
    sf_right = {
        "match": "SF2",
        "label": "Semi Final 2",
        "date_range": PHASES["sf"]["date_range"],
        "teamA": _sf_team(sf2_a),
        "teamB": _sf_team(sf2_b),
    }

    def _sf_winner(m: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        a, b = m["teamA"], m["teamB"]
        if not a or not b:
            return None
        if active in ("pre", "qf"):
            return None
        if a["sf_points"] == 0 and b["sf_points"] == 0:
            return None
        return a if a["sf_points"] >= b["sf_points"] else b

    sf_left["winner"] = _sf_winner(sf_left)
    sf_right["winner"] = _sf_winner(sf_right)
    semi_finals = [sf_left, sf_right]

    # ---- Final ----
    final_teams_map: Dict[str, Dict[str, Any]] = {}
    if active in ("final", "ended"):
        f_payload = await build_team_payload("final")
        final_teams_map = {t["code"]: t for t in f_payload}

    def _final_team(sf_winner: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not sf_winner:
            return None
        base = by_code[sf_winner["code"]]
        return {
            "code": base["code"],
            "country": base["country"],
            "flag": base["flag"],
            "flag_code": base.get("flag_code"),
            "accent": base["accent"],
            "sf_points": sf_winner["sf_points"],
            "final_points": final_teams_map.get(base["code"], {}).get("total_points", 0),
        }

    teamA_final = _final_team(sf_left["winner"])
    teamB_final = _final_team(sf_right["winner"])
    final_block = None
    champion = None
    if teamA_final or teamB_final:
        final_block = {
            "label": "Final",
            "date_range": PHASES["final"]["date_range"],
            "teamA": teamA_final,
            "teamB": teamB_final,
        }
        if active in ("final", "ended") and teamA_final and teamB_final:
            if teamA_final["final_points"] or teamB_final["final_points"]:
                champion = (
                    teamA_final
                    if teamA_final["final_points"] >= teamB_final["final_points"]
                    else teamB_final
                )

    return {
        "active_phase": active,
        "phases": {k: _phase_meta(k) for k in PHASES},
        "last_fetched_at": state["last_fetched_at"],
        "last_error": state["last_error"],
        "qf_standings": qf_sorted,
        "qualified_teams": qualified,
        "semi_finals": semi_finals,
        "final": final_block,
        "champion": champion,
    }


# ---------- Background refresher ----------
_bg_task: Optional[asyncio.Task] = None


async def _refresh_loop() -> None:
    # initial fetch then sleep
    while True:
        try:
            await refresh_leaderboard()
        except Exception:  # noqa: BLE001
            logger.exception("background refresh crashed")
        await asyncio.sleep(REFRESH_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(_app: FastAPI):  # noqa: D401
    global _bg_task  # noqa: PLW0603
    _bg_task = asyncio.create_task(_refresh_loop())
    try:
        yield
    finally:
        if _bg_task:
            _bg_task.cancel()
        mongo_client.close()


# ---------- FastAPI app ----------
app = FastAPI(title="KIME Sales World Cup 2026 API", lifespan=lifespan)
api = APIRouter(prefix="/api")


@api.get("/")
async def root() -> Dict[str, Any]:
    return {
        "name": "KIME Sales World Cup 2026",
        "ok": True,
        "active_phase": current_phase_key(),
        "last_fetched_at": state["last_fetched_at"],
    }


@api.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "ok": state["last_error"] is None,
        "counsellors_loaded": len(state["leaderboard"]),
        "last_fetched_at": state["last_fetched_at"],
        "last_error": state["last_error"],
        "active_phase": current_phase_key(),
    }


@api.get("/teams")
async def get_teams() -> Dict[str, Any]:
    active = current_phase_key()
    phase_for_points = "qf" if active in ("pre",) else active
    if active == "ended":
        phase_for_points = "final"
    teams_payload = await build_team_payload(phase_for_points if active != "pre" else "pre")
    return {
        "active_phase": active,
        "phase_for_points": phase_for_points,
        "phases": {k: _phase_meta(k) for k in PHASES},
        "teams": teams_payload,
        "last_fetched_at": state["last_fetched_at"],
        "last_error": state["last_error"],
    }


@api.get("/standings")
async def get_standings() -> Dict[str, Any]:
    return await build_standings_payload()


@api.get("/leaderboard")
async def get_leaderboard() -> Dict[str, Any]:
    return {
        "ok": state["last_error"] is None,
        "count": len(state["leaderboard"]),
        "data": state["leaderboard"],
        "last_fetched_at": state["last_fetched_at"],
        "last_error": state["last_error"],
    }


@api.post("/refresh")
async def manual_refresh() -> Dict[str, Any]:
    result = await refresh_leaderboard()
    if not result["ok"]:
        raise HTTPException(status_code=502, detail=result.get("error") or "fetch failed")
    return result


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
