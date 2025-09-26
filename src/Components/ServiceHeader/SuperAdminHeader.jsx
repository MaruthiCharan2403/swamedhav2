import { Link } from "react-router-dom";
import { useState } from "react";

export default function SuperAdminHeader({ setIsMenuOpen }) {
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const navLinks = [
    { path: "/superadmindashboard", label: "Dashboard" },
    { path: "/superadmin/enablecourseslevels", label: "Enable Levels" },
    { path: "/superadmin/activeschools", label: "View Schools" },
    // Admin dropdown handled separately
    { path: "/superadmin/addtrainer", label: "Add Trainer" },
    { path: "/superadmin/viewtrainer", label: "View Trainer" },
    { path: "/superadmin/assigntrainer", label: "Assign Trainer" },
    {path:"/superadmin/assigntrainerlevels", label: "Assign Levels"},
  ];

  // Admin dropdown links
  const adminLinks = [
    { path: "/superadmin/addadmin", label: "Add Admin" },
    { path: "/superadmin/viewadmin", label: "View Admin" },
  ];

  return (
    <>
      {/* ✅ Desktop Navigation */}
      <ul className="items-stretch hidden text-black font-semibold space-x-3 lg:flex ">
        {navLinks.map((link, index) => (
          <li key={index} className="flex">
            <Link
              to={link.path}
              className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 focus:text-black focus:font-bold"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {/* Admin Dropdown */}
        <li className="relative flex">
          <button
            className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 focus:text-black focus:font-bold"
            onClick={() => setAdminDropdownOpen((open) => !open)}
            type="button"
          >
            Admin
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {adminDropdownOpen && (
            <ul className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-20">
              {adminLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="block px-4 py-2 hover:bg-gray-100 text-black"
                    onClick={() => setAdminDropdownOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>

      {/* ✅ Mobile Navigation */}
      <ul className="lg:hidden text-black bg-gray-800 rounded-md divide-y divide-gray-700">
        {navLinks.map((link, index) => (
          <li key={index} className="flex">
            <Link
              to={link.path}
              className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
        {/* Admin Dropdown for Mobile */}
        <li className="flex flex-col">
          <button
            className="block px-4 py-3 text-left w-full active:bg-gray-700 transition-all duration-200 font-semibold"
            onClick={() => setAdminDropdownOpen((open) => !open)}
            type="button"
          >
            Admin
            <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {adminDropdownOpen && (
            <ul className="bg-gray-700">
              {adminLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="block px-6 py-2 text-white hover:bg-gray-600"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setAdminDropdownOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </>
  );
}
