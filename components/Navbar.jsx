import { NavLink } from 'react-router-dom'
import logo from '../src/assets/logo.jpg'

const Navbar = () => {
  return (
    <nav className="bg-gray-200 border-border-indigo-500">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-6">
            <div className="flex flex-1 items-end justify-end">
                {/* Logo */}
                <NavLink to='/' className="flex flex-shrink-0 items-end">
                <img src={logo} alt="React Jobs" className="h-20 w-auto my-2" />
                <p className='text-2xl text-black'></p>
                </NavLink>
            </div>
        </div>
    </nav>
  )
}

export default Navbar