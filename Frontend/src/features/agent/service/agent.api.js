import axios from "axios"

const Agentapi = axios.create({
  baseURL: "http://localhost:3000/api",  
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});



export const getAgentData = async () => {
     
    const response = await Agentapi.get("/agent/dashBoard")

    return response.data
}


export const getAgentNetworkData = async (cacheBuster = "") => {

  const response = await Agentapi.get(`/agent/networkTree${cacheBuster}`);
  return response.data;
};

export const getAgentWalletData = async () =>{
  const response = await Agentapi.get("/agent/wallet")

  return response.data
}