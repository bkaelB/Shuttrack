import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import MatchPage from '../pages/MatchPage'
import PaymentPage from '../pages/PaymentPage'
import { useEffect } from 'react'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route index element={<MatchPage />} />
      {/* Add path for PaymentPage */}
      <Route path='payments' element={<PaymentPage />} />
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
