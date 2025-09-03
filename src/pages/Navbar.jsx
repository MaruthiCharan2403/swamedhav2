import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import navlogo from '../assets/navlogo.jpg';
import UserProfileHeader from '../Components/UserProfileHeader'; // For authenticated users
import ServiceHeader from '../Components/ServiceHeader'; // Import the ServiceHeader component

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 p-4 bg-white shadow-md z-40">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={navlogo} alt="Swamedha" className="w-10 h-10" />
          <h1 className="text-3xl font-bold text-gray-800">Swamedha</h1>
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className="lg:hidden p-2 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav
          className={`lg:flex ${isMobileMenuOpen ? 'block' : 'hidden'} absolute lg:static top-16 left-0 right-0 bg-white lg:bg-transparent shadow-lg lg:shadow-none`}
        >
          <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 p-4 lg:p-0">
            {['Home', 'About'].map((item) => (
              <li key={item} className="relative">
                <Link
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className={`block py-2 lg:py-0 text-lg font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 ${
                    activeSection === item.toLowerCase() ? 'text-blue-600' : ''
                  }`}
                  onClick={() => {
                    setActiveSection(item.toLowerCase());
                    setIsMobileMenuOpen(false); // Close mobile menu on click
                  }}
                >
                  {item}
                </Link>
                {activeSection === item.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full lg:hidden" />
                )}
              </li>
            ))}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <UserProfileHeader />
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mt-4 lg:mt-0">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-lg font-medium text-blue-600 bg-transparent border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 mt-2 lg:mt-0"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  Register
                </button>
              </div>
            )}
          </ul>
        </nav>
      </div>

      {/* Service Header */}
      <ServiceHeader isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
    </header>
  );
};

export default Navbar;