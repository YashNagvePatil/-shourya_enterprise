import {configureStore} from '@reduxjs/toolkit';
import authReducer from "../features/auth/state/auth.slice"
import agentReducer from "../features/agent/state/agent.slice"
const store = configureStore({
    reducer:{
           auth:authReducer,
           agent:agentReducer
    }
})

export default store;