import axios from "axios"

const authApiInstance = axios.create({
       baseURL:"/api/auth" ,
       withCredentials:true
})


export async function register ({
    email,
    contact,
    password,
    fullName,
    role,
    panCardNumber,
    adharCardNumber,
    parentAgentId,   // parrent agent id form form 
    parrentAgentName,
    position 
}) 
    {

      const response = await authApiInstance.post("/register",{
                  email,
                  contact,
                  password,
                  fullName,
                  role,
                  panCardNumber,
                  adharCardNumber,
                  parentAgentId,   
                  parrentAgentName,
                  position 
      })

      return response.data
}