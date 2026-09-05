import { createBrowserRouter, Outlet } from "react-router";
import Protected from "../components/Protected";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Pages
import RegisterPage from "../features/auth/pages/Register";
import LoginPage from "../features/auth/pages/Login";
import Dashboard from "../features/agent/pages/AgentDashboard";
import ProfilePage from "../features/agent/pages/AgentProfile";
import WalletPayout from "../features/agent/pages/AgnetWallet";
import AgentNetwork from "../features/agent/pages/AgentNetwork";
import AdminDashboard from "../features/admin/pages/Dashboard";
import AgentListPage from "../features/admin/pages/AgentListPage";
import AgentDetailPage from "../features/admin/pages/AgentDetails";
import CreateProductPage from "../features/admin/pages/CreateProduct";
import Home from "../components/Home";
import ProductDetailsPage from "../features/products/pages/ProductDetails";
import CartPage from "../features/cart/pages/Cartpage";
import PaymentPage from "../features/Payment/pages/Payment";
import ContactPage from "../components/ContactUs";
import InventoryManager from "../features/inventory/pages/Inventory";
import FranchiseRegister from "../features/franchise/pages/FranchiseRegister";
import MangeFranchiseDashboard from "../features/admin/franchiseMangement/pages/MangeFranchiseDashboard";
import FranchiseGovernanceUI from "../features/admin/franchiseMangement/pages/FranchiseVerifyKyc";
import ManageFranchiseSupplyUI from "../features/admin/franchiseMangement/pages/ManageFranchiseSupplyUI";
import ManageFranchiseFinancials from "../features/admin/franchiseMangement/pages/ManageFranchiseFinance";
import FranchiseDashboard from "../features/franchise/pages/FranchiseDashboard";
import Franchiselogin from "../features/franchise/pages/franchiseLogin";
import FranchiseInventory from "../features/franchise/pages/Inventory";
import FranchiseSupply from "../features/franchise/pages/Supplyrequest";
import FranchiseFinance from "../features/franchise/pages/FranchiseFinance";
import FranchiseProfile from "../features/franchise/pages/FranchiseProfile";
import FranchisePayoutRequest from "../features/franchise/pages/FranchisePayoutRequest";
import AgentProfile from "../features/agent/pages/AgentProfile";
import ReceiptPage from "../components/ReceiptPage";
import AdminPayout from "../features/admin/pages/AdminPayout";

// Root Layout Component with Persistent Navbar & Footer
const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet /> {/* Dynamic page components render here */}
      </main>
      <Footer />
    </div>
  );
};

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true, // Default page at '/'
        element: <Home />
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },

       {
        path: "products/:id",
        element: <ProductDetailsPage />,
      },

      {
        path: "cart",
        element: <CartPage/>,
      },
     
      {
        path:"payment",
        element:<PaymentPage/>
      },
      
      {
             
          path:"/receipt/:orderId" ,
           element:<ReceiptPage /> 
      }
       ,

       {
        path:"contactUs",
        element:<ContactPage/>
      },

       { path: "registerFranchise", element: < FranchiseRegister/> },
       
       {path:"loginFranchise", element:<Franchiselogin/>},
      // Agent Routes (Relative Paths)
      {
        path: "agent",
        element:(<Protected allowedRoles={['Agent']}><Outlet/></Protected>),
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <AgentProfile/> },
          { path: "wallet", element: <WalletPayout /> },
          { path: "network", element: <AgentNetwork /> },
        ],
      },

      // Admin Routes (Relative Paths)
      {
        path: "admin",
        element: (
          <Protected allowedRoles={["Admin"]}>
            <Outlet />
          </Protected>
        ),
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "agentList", element: <AgentListPage /> },
          { path: "agentDetails", element: <AgentDetailPage /> },
          { path: "createProduct", element: <CreateProductPage /> },
          { path: "inventory", element: <InventoryManager/> },
          { path: "franchiseManageDashboard", element:<MangeFranchiseDashboard/>},
          { path: "FranchiseVerifyKyc", element:<FranchiseGovernanceUI/>},
          { path:  "manageFranchiseSupply" ,element:<ManageFranchiseSupplyUI/>},
          { path:  "manageFranchiseFinancials", element:<ManageFranchiseFinancials/>},
          { path: "agentPayout", element: <AdminPayout /> }
        ],
      },

      {
        path: "franchise",
        element: (
          <Protected allowedRoles={["Franchise"]}>
            <Outlet />
          </Protected>
        ),
        children: [
         { path:"dashboard",element:<FranchiseDashboard/>},
         {path:"inventory",element:<FranchiseInventory/>},
         {path:"supply",element:<FranchiseSupply/>},
         {path:"finance",element:<FranchiseFinance/>},
         {path:"payoutRequest",element:<FranchisePayoutRequest/>},
         {path:"profile",element:<FranchiseProfile/>}
        ]
      }
     
    ],
  },
]);