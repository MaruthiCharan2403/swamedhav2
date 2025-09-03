import React from 'react'
import { Link } from 'react-router-dom'
export default function TeacherHeader({ setIsMenuOpen }) {
    return (
        <><ul className="items-stretch hidden text-black space-x-3 lg:flex">
            <li className="flex">
                <Link to="/teacherdashboard" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600  focus:font-bold">
                    Dashboard
                </Link>
            </li>
        </ul>
            <ul className="lg:hidden text-white rounded-md bg-gray-800 divide-y divide-gray-700">
            <li>
                <Link to="/teacherdashboard" className="block px-4 py-3 active:bg-gray-700 transition-all duration-200" 
                 onClick={() => setIsMenuOpen(false)}
                >
                    Dashboard
                </Link>
            </li>
                
            </ul>
        </>
    )
}
