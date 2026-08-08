import { setError,setLoading,setLoading, setUser } from "../state/auth.slice.js";
import { register } from "../service/auth.api.js";
import { useDispatch } from "react-redux";


   export const useAuth = () =>{
     const dispatch = useDispatch()
   
      async function handleRegister( 
            email,
            contact,
            password,
            fullName,
            role,
            panCardNumber,
            adharCardNumber,
            parentAgentId,   
            parrentAgentName,
            position ) {

                const data = await register ({ 
                        email,
                        contact,
                        password,
                        fullName,
                        role,
                        panCardNumber,
                        adharCardNumber,
                        parentAgentId,   // parrent agent id form form 
                        parrentAgentName,
                        position })

               dispatch(setUser(data.user))  
               
               return data.user
        
    }

    return {handleRegister}
   }