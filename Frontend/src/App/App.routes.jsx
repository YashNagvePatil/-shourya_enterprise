import { createBrowserRouter } from "react-router";
import RegisterPage from "../features/auth/pages/Register";
import LoginPage from "../features/auth/pages/Login";


export const routes = createBrowserRouter([
      {
        path:"/",
        element :<h1> Home </h1>
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