import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
        intialstate:{
            user:null,
            loading:true,
            error:null
        },

        reducers:{
           setUser: (state, action) => {   
           state.user = action.payload;
           },

            setLoading: (state, action) => {
            state.loading = action.payload;
            },

            
               setError: (state, action) => {
                state.error = action.payload;
                   }
         }
    
})

export const {setError,setLoading,setUser} = authSlice.actions;

 export default authSlice.reducer;