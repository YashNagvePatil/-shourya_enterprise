import axios from "axios"

const Agentapi = axios.create({
  baseURL: "http://localhost:3000/api",  
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});



export const getAgentData = async (cacheBuster = "") => {
     
    const response = await Agentapi.get(`/agent/dashBoard${cacheBuster}`)

    return response.data
}


export const getAgentNetworkData = async (cacheBuster = "") => {

  const response = await Agentapi.get(`/agent/networkTree${cacheBuster}`);
  return response.data;
};

export const getAgentWalletData = async (cacheBuster = "") =>{
  const response = await Agentapi.get(`/agent/wallet${cacheBuster}`)

  return response.data
}