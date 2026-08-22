import axios from "axios";

// Axios instance with Vite Proxy setup
const api = axios.create({
  baseURL: "http://localhost:3000/api", 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

export const register = async (userData) => {
  const response = await api.post("/auth/register",userData);
  return response.data; 
};

export const login = async (credentials) => {
  // credentials object looks like: { identifier: "...", password: "..." }
  const response = await api.post("/auth/login",credentials);
  return response.data;
};

