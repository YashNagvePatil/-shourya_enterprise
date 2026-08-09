import {configureStore} from '@reduxjs/toolkit';
import authReducer from "../features/auth/state/auth.slice"

const store = configureStore({
    reducer:{
           auth:authReducer  
    }
})

export default store;