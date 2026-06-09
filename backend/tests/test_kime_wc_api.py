"""KIME Sales World Cup 2026 — Backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fall back to frontend .env file
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = (BASE_URL or "").rstrip("/")

EXPECTED_COUNTRIES = {
    "BR": "Brazil",
    "DE": "Germany",
    "NL": "Netherlands",
    "ES": "Spain",
    "FR": "France",
    "AR": "Argentina",
    "PT": "Portugal",
    "EN": "England",
}

# Counsellor labels expected for each country (from PRD/server.py)
EXPECTED_MEMBERS = {
    "BR": ["Netra", "Akshata", "Diksh", "Bhagyalaxmi"],
    "DE": ["Prasad", "Ashwini", "Manohar", "Vighnesh"],
    "NL": ["Rahul", "Darshan", "Sujitha", "Kanchan"],
    "ES": ["Aisha", "Priyanshu", "Gourav", "Amod"],
    "FR": ["Vineeth", "Suwarna", "Mansi", "Shresth"],
    "AR": ["Sai", "Astha", "Vijay", "Vrushabh"],
    "PT": ["Shamal", "Aanchal", "Harshit", "Kajal"],
    "EN": ["Janhavi N.", "Ishita", "Shraddha", "Janhavi G."],
}

MISSING_COUNSELLORS = {"Sujitha", "Priyanshu", "Shresth", "Vrushabh"}


# --- /api/health ---
class TestHealth:
    def test_health_ok(self):
        r = requests.get(f"{BASE_URL}/api/health", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert data["counsellors_loaded"] > 0
        assert data["last_fetched_at"] is not None
        assert data["last_error"] is None
        assert data["active_phase"] in {"pre", "qf", "sf", "final", "ended"}


# --- /api/teams ---
class TestTeams:
    @pytest.fixture(scope="class")
    def teams_payload(self):
        r = requests.get(f"{BASE_URL}/api/teams", timeout=15)
        assert r.status_code == 200
        return r.json()

    def test_active_phase_present(self, teams_payload):
        assert "active_phase" in teams_payload
        assert teams_payload["active_phase"] in {"pre", "qf", "sf", "final", "ended"}
        assert "phases" in teams_payload
        for k in ("qf", "sf", "final"):
            assert k in teams_payload["phases"]

    def test_eight_teams(self, teams_payload):
        teams = teams_payload["teams"]
        assert len(teams) == 8
        codes = {t["code"] for t in teams}
        assert codes == set(EXPECTED_COUNTRIES.keys())

    def test_each_team_has_4_members_and_correct_country(self, teams_payload):
        for t in teams_payload["teams"]:
            assert t["country"] == EXPECTED_COUNTRIES[t["code"]]
            assert "flag" in t and t["flag"]
            assert len(t["members"]) == 4
            labels = [m["label"] for m in t["members"]]
            assert labels == EXPECTED_MEMBERS[t["code"]], (
                f"Members mismatch for {t['code']}: got {labels}"
            )

    def test_total_points_equals_sum_of_members(self, teams_payload):
        for t in teams_payload["teams"]:
            member_sum = sum(int(m["points"]) for m in t["members"])
            assert int(t["total_points"]) == member_sum, (
                f"{t['country']}: total={t['total_points']} sum={member_sum}"
            )

    def test_known_missing_counsellors_have_found_false(self, teams_payload):
        # Sujitha/Priyanshu/Shresth/Vrushabh expected not in leaderboard
        found_flags = {}
        for t in teams_payload["teams"]:
            for m in t["members"]:
                if m["leaderboard_name"] in MISSING_COUNSELLORS:
                    found_flags[m["leaderboard_name"]] = m
        for name in MISSING_COUNSELLORS:
            assert name in found_flags, f"{name} not found in payload"
            m = found_flags[name]
            assert m["found"] is False
            assert m["points"] == 0

    def test_members_have_required_fields(self, teams_payload):
        for t in teams_payload["teams"]:
            for m in t["members"]:
                for field in ("label", "leaderboard_name", "branch", "points", "found"):
                    assert field in m


# --- /api/standings ---
class TestStandings:
    @pytest.fixture(scope="class")
    def standings(self):
        r = requests.get(f"{BASE_URL}/api/standings", timeout=15)
        assert r.status_code == 200
        return r.json()

    def test_top_level_fields(self, standings):
        for f in ("active_phase", "qf_standings", "semi_finals", "final"):
            assert f in standings

    def test_qf_standings_has_8_teams_sorted_desc(self, standings):
        qf = standings["qf_standings"]
        assert len(qf) == 8
        pts = [t["total_points"] for t in qf]
        assert pts == sorted(pts, reverse=True), f"Not sorted desc: {pts}"
        for idx, t in enumerate(qf, start=1):
            assert t["qf_rank"] == idx
            if idx <= 4:
                assert t["qf_status"] == "Qualified"
            else:
                assert t["qf_status"] == "Eliminated"

    def test_qf_standings_covers_all_8_countries(self, standings):
        codes = {t["code"] for t in standings["qf_standings"]}
        assert codes == set(EXPECTED_COUNTRIES.keys())

    def test_semi_finals_matchups(self, standings):
        qf = standings["qf_standings"]
        sf = standings["semi_finals"]
        assert len(sf) == 2
        # SF1 = R1 vs R4
        sf1 = sf[0]
        assert sf1["match"] == "SF1"
        assert sf1["teamA"]["code"] == qf[0]["code"]
        assert sf1["teamB"]["code"] == qf[3]["code"]
        # SF2 = R2 vs R3
        sf2 = sf[1]
        assert sf2["match"] == "SF2"
        assert sf2["teamA"]["code"] == qf[1]["code"]
        assert sf2["teamB"]["code"] == qf[2]["code"]

    def test_final_is_null_or_object(self, standings):
        # During QF phase, final must be null
        if standings["active_phase"] == "qf":
            assert standings["final"] is None


# --- /api/refresh ---
class TestRefresh:
    def test_manual_refresh(self):
        # Fetch current health to get prior timestamp
        h1 = requests.get(f"{BASE_URL}/api/health", timeout=15).json()
        prev_ts = h1.get("last_fetched_at")

        r = requests.post(f"{BASE_URL}/api/refresh", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["last_fetched_at"] is not None
        # last_fetched_at should be >= prev_ts (string ISO compare is fine)
        if prev_ts:
            assert data["last_fetched_at"] >= prev_ts
        assert data["count"] > 0
