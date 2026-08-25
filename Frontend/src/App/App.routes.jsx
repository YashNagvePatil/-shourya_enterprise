import { createBrowserRouter, Outlet } from "react-router";
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
        path:"contactUs",
        element:<ContactPage/>
      },

      // Agent Routes (Relative Paths)
      {
        path: "agent",
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "wallet", element: <WalletPayout /> },
          { path: "network", element: <AgentNetwork /> },
        ],
      },

      // Admin Routes (Relative Paths)
      {
        path: "admin",
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "agentList", element: <AgentListPage /> },
          { path: "agentDetails", element: <AgentDetailPage /> },
          { path: "createProduct", element: <CreateProductPage /> },
        ],
      },
    ],
  },
]);