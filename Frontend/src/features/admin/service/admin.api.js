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

export const changeAgentStatus = async (agentId, status, reason = "") => {
  console.log(">>> [API CALL] changeAgentStatus initialized:");
  console.log("   -> Agent ID:", agentId);
  console.log("   -> Status Target:", status);
  console.log("   -> Reason:", reason);

  if (!agentId) {
    console.error(">>> [API ERROR] agentId passed to changeAgentStatus is invalid/undefined!");
    throw new Error("Agent ID missing for status change API call.");
  }

  try {
    const response = await api.patch(`/admin/agent/status/${agentId}`, {
      status, // "Active" or "Blocked"
      reason: status === "Blocked" ? reason : "",
    });
    
    console.log(">>> [API SUCCESS] Status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(">>> [API ERROR] changeAgentStatus failed:", error.response || error);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const createProduct = async (productData) => {
  const response = await api.post("/admin/createProduct", productData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};