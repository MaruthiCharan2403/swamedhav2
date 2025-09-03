import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice"; // Adjust this import based on your Redux setup
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function UserProfileHeader() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Icon / Image */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 cursor-pointer"
      >
        <FiUser className="text-black text-2xl" />
        <span className="hidden lg:inline text-black">{user?.name || "User"}</span>
      </button>

      {/* Popover Menu (Desktop & Mobile) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black/90 text-white rounded-lg shadow-lg z-50">
          <ul className="py-2">
            <li>
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            </li>
            {/* <li>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
            </li> */}
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-800 cursor-pointer"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
