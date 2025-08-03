import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import MatchPage from '../pages/MatchPage'
import { useEffect } from 'react'


const router = createBrowserRouter (
  createRoutesFromElements (
    <Route path = '/' element = {<MainLayout/>}>
      <Route index element={<MatchPage />} />
    </Route>
  )
)

const App = () => {
  useEffect(() => {
    fetch('')
  },[])
  return (
    <RouterProvider router={router} />
  )
}

export default App