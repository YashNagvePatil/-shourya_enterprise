import { createBrowserRouter } from "react-router";
import RegisterPage from "../features/auth/pages/Register";
import LoginPage from "../features/auth/pages/Login";
import HomePage from "../features/products/pages/Homepage";


export const routes = createBrowserRouter([
      {
        path:"/",
        element :<HomePage/>
      },

      {
        path:"/register",
        element :<RegisterPage/>
      },
      {
        path:"/login",
        element:<LoginPage/>
      }


])