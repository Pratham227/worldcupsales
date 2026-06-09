import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export const fetchTeams = async () => {
  const { data } = await client.get("/teams");
  return data;
};

export const fetchStandings = async () => {
  const { data } = await client.get("/standings");
  return data;
};

export const fetchLeaderboard = async () => {
  const { data } = await client.get("/leaderboard");
  return data;
};

export const triggerRefresh = async () => {
  const { data } = await client.post("/refresh");
  return data;
};

export default client;
