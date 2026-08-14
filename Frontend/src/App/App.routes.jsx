import { createBrowserRouter } from "react-router";
import RegisterPage from "../features/auth/pages/Register";
import LoginPage from "../features/auth/pages/Login";
import HomePage from "../features/products/pages/Homepage";
import Dashboard from "../features/agent/pages/AgentDashboard";
import ProfilePage from "../features/agent/pages/AgentProfile";
import WalletPayout from "../features/agent/pages/AgnetWallet";
import AgentNetwork from "../features/agent/pages/AgentNetwork";
import AdminDashboard from "../features/admin/pages/Dashboard";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },

  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/agent",
    children: [
      {
        path: "/agent/Dashboard",
        element: <Dashboard />,
      },

      {
        path: "/agent/profile",
        element: <ProfilePage />,
      },

      {
        path: "/agent/wallet",
        element: <WalletPayout />,
      },

      {
        path: "/agent/Network",
        element: <AgentNetwork />,
      },
    ],

  },

  {
    path:"admin",
    children:[
      
      {
        path: "/admin/dashboard",
        element: <AdminDashboard/>,
      },
    ]
  }
]);
