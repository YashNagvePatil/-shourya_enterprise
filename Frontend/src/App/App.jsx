import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './App.routes.jsx'
function App() {
  

  return (
    <>
       <RouterProvider router={routes}/> 
    </>
  )
}

export default App
