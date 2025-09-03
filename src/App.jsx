import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import MatchPage from '../pages/MatchPage'
import PaymentPage from '../pages/PaymentPage'
import { useEffect } from 'react'
import MatchHistory from '../pages/MatchHistory'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route index element={<MatchPage />} />
      <Route path='payments' element={<PaymentPage />} />
      <Route path='matchHistory' element={<MatchHistory />} />
    </Route>
  )
)

const App = () => {
  useEffect(() => {
    // You have an empty fetch here, you can remove or complete it
  }, [])

  return <RouterProvider router={router} />
}

export default App
