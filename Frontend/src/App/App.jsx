import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './App.routes.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
function App() {
  

  return (
    <>
      
       <RouterProvider router={routes}/> 
  
    </>
  )
}

export default App
