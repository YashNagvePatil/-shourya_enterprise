import axios from "axios"


const api = axios.create({
  baseURL: "http://localhost:3000/api", 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

export const getAgentsdata = async () =>{
    const response = await api.get("/admin/dashboard")
     return response.data;
}
// 1. API Function Mein Fix
export const getAgentList = async (queryParams = {}) => {
  // Direct timestamp append kar do
  const response = await api.get(`/admin/agent/management`, { 
    params: {
      ...queryParams,
      _t: new Date().getTime(), 
    } 
  });
  return response.data;
};

export const getAgentDetails = async (agentId,queryParams = {}) => {
  console.log("Fetching details for agentId:", agentId); // Check is this undefined?
  
  if (!agentId) {
    console.error("Agent ID is missing!");
    return;
  }
  
  const response = await api.get(`/admin/agent/${agentId}`,{
           params: {
      ...queryParams,
      _t: new Date().getTime(), 
    } 
  });
  return response.data;
}

export const changeAgentStatus = async (agentId, status, reason) => {
  const response = await api.patch(`/admin/agent/status/${agentId}`, {
    status,
    reason,
  });
  return response.data;
};