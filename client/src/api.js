import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.BACKEND_URL || 'http://localhost:5000'}/api`, 
});

export default api;