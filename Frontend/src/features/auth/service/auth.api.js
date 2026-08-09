import axios from "axios";

// Axios instance with Vite Proxy setup
const api = axios.create({
  baseURL: "/api", // Vite Proxy '/api' 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cookies/Session
});

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data; 
};