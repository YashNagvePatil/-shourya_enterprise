import { useDispatch, useSelector } from "react-redux";
import {
  setFranchiseUser,
  updateFranchiseProfile,
  updateWalletBalance,
  clearFranchiseUser,
  selectFranchiseUser,
  selectIsAuthenticated,
  selectUserStatus,
} from "./franchiseUser.slice.js";

import {
  setFinancialOverview,
  setDashboardMetrics,
  setDateFilter,
  resetDashboardState,
  selectFinancials,
  selectDashboardMetrics,
  selectDashboardDateFilter,
} from "./franchiseDashboard.slice.js";

import {
  setSupplyRequests,
  addSupplyRequest,
  updateSupplyRequestStatus,
  setSelectedSupplyRequest,
  setSupplyFilters,
  clearSupplyState,
  selectAllSupplyRequests,
  selectSelectedSupplyRequest,
  selectSupplyFilters,
} from "./franchiseSupplies.slice.js";

import {
  setInventory,
  addInventoryItem,
  updateInventoryStock,
  setSelectedItem,
  setInventoryFilters,
  clearInventoryState,
  selectInventoryItems,
  selectSelectedItem,
  selectInventoryFilters,
} from "./franchiseInventory.slice.js";

export const useFranchise = () => {
  const dispatch = useDispatch();

  // Selectors
  const user = useSelector(selectFranchiseUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userStatus = useSelector(selectUserStatus);

  const financials = useSelector(selectFinancials);
  const dashboardMetrics = useSelector(selectDashboardMetrics);
  const dashboardDateFilter = useSelector(selectDashboardDateFilter);

  const supplyRequests = useSelector(selectAllSupplyRequests);
  const selectedSupplyRequest = useSelector(selectSelectedSupplyRequest);
  const supplyFilters = useSelector(selectSupplyFilters);

  const inventoryItems = useSelector(selectInventoryItems);
  const selectedInventoryItem = useSelector(selectSelectedItem);
  const inventoryFilters = useSelector(selectInventoryFilters);

  // User Actions
  const handleSetUser = (userData) => dispatch(setFranchiseUser(userData));
  const handleUpdateProfile = (profileData) => dispatch(updateFranchiseProfile(profileData));
  const handleUpdateWallet = (walletData) => dispatch(updateWalletBalance(walletData));
  const handleLogout = () => {
    dispatch(clearFranchiseUser());
    dispatch(resetDashboardState());
    dispatch(clearSupplyState());
    dispatch(clearInventoryState());
  };

  // Dashboard Actions
  const handleSetFinancials = (data) => dispatch(setFinancialOverview(data));
  const handleSetMetrics = (metrics) => dispatch(setDashboardMetrics(metrics));
  const handleSetDateFilter = (filter) => dispatch(setDateFilter(filter));

  // Supply Request Actions
  const handleSetSupplyRequests = (requests) => dispatch(setSupplyRequests(requests));
  const handleAddSupplyRequest = (request) => dispatch(addSupplyRequest(request));
  const handleUpdateSupplyStatus = (requestId, status) =>
    dispatch(updateSupplyRequestStatus({ requestId, status }));
  const handleSelectSupplyRequest = (request) => dispatch(setSelectedSupplyRequest(request));
  const handleSetSupplyFilters = (filters) => dispatch(setSupplyFilters(filters));

  // Inventory Actions
  const handleSetInventory = (items) => dispatch(setInventory(items));
  const handleAddInventoryItem = (item) => dispatch(addInventoryItem(item));
  const handleRecordSale = (productId, quantitySold) =>
    dispatch(updateInventoryStock({ productId, quantitySold }));
  const handleSelectInventoryItem = (item) => dispatch(setSelectedItem(item));
  const handleSetInventoryFilters = (filters) => dispatch(setInventoryFilters(filters));

  return {
    // State Values
    user,
    isAuthenticated,
    userStatus,
    financials,
    dashboardMetrics,
    dashboardDateFilter,
    supplyRequests,
    selectedSupplyRequest,
    supplyFilters,
    inventoryItems,
    selectedInventoryItem,
    inventoryFilters,

    // Dispatcher Methods
    handleSetUser,
    handleUpdateProfile,
    handleUpdateWallet,
    handleLogout,
    handleSetFinancials,
    handleSetMetrics,
    handleSetDateFilter,
    handleSetSupplyRequests,
    handleAddSupplyRequest,
    handleUpdateSupplyStatus,
    handleSelectSupplyRequest,
    handleSetSupplyFilters,
    handleSetInventory,
    handleAddInventoryItem,
    handleRecordSale,
    handleSelectInventoryItem,
    handleSetInventoryFilters,
  };
};

export default useFranchise;