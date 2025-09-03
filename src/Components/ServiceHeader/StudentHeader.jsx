import React from 'react'
import { Link } from 'react-router-dom'

export default function StudentHeader({ setIsMenuOpen }) {
    return (
        <>
            {/* Desktop Menu */}
            <ul className="items-stretch font-bold hidden space-x-3 lg:flex">
                <li className="flex">
                    <Link to="/studentdashboard" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600">
                        Dashboard
                    </Link>
                </li>
            </ul>

            {/* Mobile Menu */}
            <ul className="lg:hidden text-white rounded-md bg-gray-800 divide-y divide-gray-700">
                <li>
                    <Link
                        to="/studentdashboard"
                        className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link
                        to="/student/buycourses"
                        className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Buy Courses
                    </Link>
                </li>
                <li>
                    <Link
                        to="/student/courses"
                        className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        My Courses
                    </Link>
                </li>
            </ul>
        </>
    )
}
