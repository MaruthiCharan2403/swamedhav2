import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentHeader({ setIsMenuOpen }) {
    return (
        <>
            {/* Desktop Menu */}
            <ul className="items-stretch text-white font-semibold hidden space-x-3 lg:flex">
                <li className="flex">
                    <Link to="/dashboard" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 focus:text-white focus:font-bold">
                        Dashboard
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/buycourses" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 focus:text-white focus:font-bold">
                        Buy Courses
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/paymenthistory" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 focus:text-white focus:font-bold">
                        Payment History
                    </Link>
                </li>
            </ul>

            {/* Mobile Menu */}
            <ul className="lg:hidden text-white rounded-md bg-gray-800 divide-y divide-gray-600">
                <li>
                    <Link 
                        to="/dashboard" 
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/buycourses" 
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Buy Courses
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/paymenthistory" 
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Payment History
                    </Link>
                </li>
            </ul>
        </>
    );
}
