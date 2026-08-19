import {configureStore} from '@reduxjs/toolkit';
import authReducer from "../features/auth/state/auth.slice"
import agentReducer from "../features/agent/state/agent.slice"
import adminReducer from "../features/admin/state/admin.slice"
import productReducer from "../features/admin/state/product.slice"
const store = configureStore({
    reducer:{
           auth:authReducer,
           agent:agentReducer,
           admin:adminReducer,
           product:productReducer
    }
})

export default store;