import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SchoolHeader({ setIsMenuOpen }) {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
        setIsMenuOpen(false); // Close the mobile menu if applicable
    };

    return (
        <>
            {/* Desktop Menu */}
            <ul className="items-stretch font-bold hidden space-x-3 lg:flex">
                <li className="flex">
                    <Link to="/schooldashboard" className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600">
                        Dashboard
                    </Link>
                </li>

                {/* Students Dropdown */}
                <li className="flex relative">
                    <button
                        onClick={() => toggleDropdown('students')}
                        className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600"
                    >
                        Students
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                    </button>
                    {openDropdown === 'students' && (
                        <ul className="absolute top-full left-0 bg-white shadow-lg rounded-md mt-1">
                            <li>
                                <Link
                                    to="/school/viewstudent"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    View Students
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/school/addstudent"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    Add Students
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Teachers Dropdown */}
                <li className="flex relative">
                    <button
                        onClick={() => toggleDropdown('teachers')}
                        className="flex items-center px-4 border-b-2 border-transparent hover:border-amber-600 focus:border-amber-600"
                    >
                        Teachers
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                    </button>
                    {openDropdown === 'teachers' && (
                        <ul className="absolute top-full left-0 bg-white shadow-lg rounded-md mt-1">
                            <li>
                                <Link
                                    to="/school/viewteachers"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    View Teachers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/school/addteacher"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    Add Teacher
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/school/assignteachers"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    Assign Teachers
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Courses Dropdown */}

                <li>
                    <Link
                        to="/school/assigncourse"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={closeDropdown} // Close dropdown on click
                    >
                        Assign Course
                    </Link>
                </li>
            </ul>

            {/* Mobile Menu */}
            <ul className="lg:hidden text-white rounded-md bg-gray-800 divide-y divide-gray-700">
                <li>
                    <Link
                        to="/schooldashboard"
                        className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                        onClick={closeDropdown} // Close dropdown on click
                    >
                        Dashboard
                    </Link>
                </li>

                {/* Students Dropdown */}
                <li>
                    <button
                        onClick={() => toggleDropdown('students-mobile')}
                        className="block w-full text-left px-4 py-3 active:bg-gray-700 transition-all duration-200 flex items-center"
                    >
                        Students
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-300" />
                    </button>
                    {openDropdown === 'students-mobile' && (
                        <ul className="pl-4">
                            <li>
                                <Link
                                    to="/school/viewstudent"
                                    className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    View Students
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/school/addstudent"
                                    className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    Add Students
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Teachers Dropdown */}
                <li>
                    <button
                        onClick={() => toggleDropdown('teachers-mobile')}
                        className="block w-full text-left px-4 py-3 active:bg-gray-700 transition-all duration-200 flex items-center"
                    >
                        Teachers
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-300" />
                    </button>
                    {openDropdown === 'teachers-mobile' && (
                        <ul className="pl-4">
                            <li>
                                <Link
                                    to="/school/viewteachers"
                                    className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    View Teachers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/school/addteacher"
                                    className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    Add Teacher
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/school/assignteachers"
                                    className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                                    onClick={closeDropdown} // Close dropdown on click
                                >
                                    Assign Teachers
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <Link
                        to="/school/assigncourse"
                        className="block px-4 py-3 active:bg-gray-700 transition-all duration-200"
                        onClick={closeDropdown} // Close dropdown on click
                    >
                        Assign Course
                    </Link>
                </li>


            </ul>
        </>
    );
}