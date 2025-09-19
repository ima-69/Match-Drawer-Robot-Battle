import axios from "axios";

const api = axios.create({
  baseURL: 'https://match-drawer-robot-battle.vercel.app/api', 
});

export default api;