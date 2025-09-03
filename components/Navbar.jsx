import { NavLink } from 'react-router-dom'
import logo from '../src/assets/logo.jpg'

const Navbar = () => {
  return (
    <nav className="bg-gray-200 border-border-indigo-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-6 flex items-center justify-between">
        {/* Logo */}
        <NavLink to='/' className="flex flex-shrink-0 items-center">
          <img src={logo} alt="React Jobs" className="h-20 w-auto my-2" />
          {/* You can add a site title here if you want */}
        </NavLink>

        {/* Navigation Links */}
        <div className="flex space-x-6 mr-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-500"
            }
          >
            Match Queue
          </NavLink>

          <NavLink
            to="/payments"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-500"
            }
          >
            Payments
          </NavLink>

          <NavLink
            to="matchHistory"
            className={({ isActive }) =>
              isActive
                ? "text-indigo-600 font-semibold"
                : "text-gray-700 hover:text-indigo-500"
            }
          >
            Match History
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
