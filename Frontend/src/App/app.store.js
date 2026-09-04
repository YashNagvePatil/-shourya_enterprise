import {configureStore} from '@reduxjs/toolkit';
import authReducer from "../features/auth/state/auth.slice"
import agentReducer from "../features/agent/state/agent.slice"
import adminReducer from "../features/admin/state/admin.slice"
import productReducer from "../features/admin/state/product.slice"
import getProductReducer from "../features/products/state/getProduct.slice"
import cartReducer from "../features/cart/state/cart.slice"
import paymentReducer from "../features/Payment/state/payment.slice"
import inventoryReducer from "../features/inventory/state/inventory.slice"
import adminDashboardForFranchiseReducer from "../features/admin/franchiseMangement/state/manageFranchiseDashboard.slice" 
import franchiseManageKycReducer from "../features/admin/franchiseMangement/state/franchiseVerifyKyc.slice"
import ManagefranchiseSupplyReducer from "../features/admin/franchiseMangement/state/managefranchiseSupplySlice"
import managefranchiseFinancialReducer from "../features/admin/franchiseMangement/state/managefranchiseSupplySlice"
import franchiseReducer from "../features/franchise/state/franchiseUser.slice"
import franchiseDashboardReducer from "../features/franchise/state/franchiseDashboard.slice"
import franchiseInventoryReducer from "../features/franchise/state/franchiseInventory.slice"
import franchiseSuppliesReducer from "../features/franchise/state/franchiseSuplies.slice"
import franchiseFinanceReducer from "../features/franchise/state/franchiseFinance.slice"
import franchiseProfileReducer from "../features/franchise/state/franchiseProfile.slice"
import agentProfileReducer from "../features/agent/state/agentProfile.slice"
import agentWalletReducer from "../features/agent/state/agentWallet.slice"
import adminPayoutReducer from "../features/admin/state/adminPayoutSlice"


const store = configureStore({
    reducer:{
           auth:authReducer,
           agent:agentReducer,
           admin:adminReducer,
           createProduct:productReducer,
           getProducts:getProductReducer,
           cart:cartReducer,
           payment:paymentReducer,
           inventory:inventoryReducer,
           adminDashboardForFranchise:adminDashboardForFranchiseReducer,
           franchiseManageKyc:franchiseManageKycReducer,
           ManagefranchiseSupply:ManagefranchiseSupplyReducer,
           managefranchiseFinancial:managefranchiseFinancialReducer,
           franchise:franchiseReducer,
           franchiseDashboard:franchiseDashboardReducer,
           franchiseInventory:franchiseInventoryReducer,
           franchiseSupplies:franchiseSuppliesReducer,
           franchiseFinance:franchiseFinanceReducer,
           franchiseProfile:franchiseProfileReducer,
           agentProfile:agentProfileReducer,
           agentWallet:agentWalletReducer,
           adminPayout:adminPayoutReducer
    }
})

export default store;