import React from 'react'
import { Link } from 'react-router-dom'
export default function AdminHeader({ setIsMenuOpen }) {
    // focus is lost when click is made on other items
    // implement a function to handle focus
    // check the url and set the active class accordingly
     const checkActive = (path) => {
        return window.location.pathname.startsWith(path) ? 'border-amber-600 font-bold' : 'border-transparent';
    }


    return (
        <>
            <ul className="items-stretch hidden font-bold space-x-3 lg:flex">
                <li className='flex'>
                    <Link to="/admindashboard" className={`flex items-center px-4 border-b border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admindashboard')}`} >
                        Dashboard
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/admin/addlevel" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admin/addlevel')}`} >
                        Add Levels
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/admin/viewlevel" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admin/viewlevel')}`} >
                        Edit Levels
                    </Link>
                </li>

                <li className="flex">
                    <Link to="/admin/deletelevel" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600  focus:font-bold">
                        Remove Levels
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/editor" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/editor')}`} >
                        Code Editor
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/admin/content" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admin/contentupload')}`} >
                        View Content
                    </Link>
                </li>
                <li className="flex">
                    <Link to="/admin/upload" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admin/contentupload')}`} >
                        Upload Content
                    </Link>
                </li>
            </ul>
            <ul className="lg:hidden text-white rounded-md bg-gray-800 divide-y divide-gray-600">
                <li>
                    <Link
                        to="/admindashboard"
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/addlevel"
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                         Add Levels
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/viewlevel"
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                            Edit Levels
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/deletelevel"
                        className="block px-4 py-3  transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                         Remove Level
                    </Link>
                </li>
                <li>
                    <Link
                        to="/editor"
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Code Editor
                    </Link>
                </li>
                <li >
                    <Link to="/admin/content" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admin/contentupload')}`} >
                        View Content
                    </Link>
                </li>
                <li>
                    <Link to="/admin/upload" className={`flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600 ${checkActive('/admin/contentupload')}`} >
                        Upload Content
                    </Link>
                </li>
            </ul>

        </>
    )
}
