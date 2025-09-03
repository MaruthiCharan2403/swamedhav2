import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const Enablelevels = () => {
    const [schools, setSchools] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    useEffect(() => {
        // Fetch schools
        axios.get('/api/school/allschools', {
            headers: { 'Authorization': sessionStorage.getItem('token') }
        })
            .then(response => {
                setSchools(response.data);
                extractLocationData(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching schools:', error);
                setError('Failed to fetch schools');
                setIsLoading(false);
            });

        // Fetch courses
        axios.get('/api/course/getdata', {
            headers: { 'Authorization': sessionStorage.getItem('token') }
        })
            .then(response => setCourses(response.data))
            .catch(error => {
                console.error('Error fetching courses:', error);
                setError('Failed to fetch courses');
            });
    }, []);

    // Extract unique states and districts from school data
    const extractLocationData = (schoolsData) => {
        const uniqueStates = [...new Set(schoolsData.map(school => school.state))].filter(Boolean).sort();
        const uniqueDistricts = [...new Set(schoolsData.map(school => school.district))].filter(Boolean).sort();
        
        setStates(uniqueStates);
        setDistricts(uniqueDistricts);
    };

    // Update districts when state changes
    useEffect(() => {
        if (selectedState) {
            const filteredDistricts = [...new Set(
                schools
                    .filter(school => school.state === selectedState)
                    .map(school => school.district)
            )].filter(Boolean).sort();
            setDistricts(filteredDistricts);
            setSelectedDistrict(''); // Reset district when state changes
        } else {
            extractLocationData(schools);
        }
    }, [selectedState, schools]);

    const handleEnableClick = (school) => {
        setSelectedSchool(school);
        setSelectedCourses([]);
        setIsRemoveMode(false);
    };

    const handleCourseSelect = (course) => {
        setSelectedCourses(prev => {
            if (prev.some(c => c._id === course._id)) {
                return prev.filter(c => c._id !== course._id);
            } else {
                return [...prev, course];
            }
        });
    };

    const handleEnableCourses = () => {
        if (selectedSchool && selectedCourses.length > 0) {
            axios.post(`/api/superadmin/${selectedSchool._id}/add-courses`, {
                courses: selectedCourses.map(course => ({
                    courseId: course._id,
                    levelName: course.levelName
                }))
            }, { headers: { 'Authorization': sessionStorage.getItem('token') } })
                .then(response => {
                    toast.success('Courses enabled successfully');
                    setSelectedSchool(null);
                    setSelectedCourses([]);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error enabling courses:', error);
                    toast.error('Failed to enable courses');
                });
        }
    };

    const handleRemoveCourses = () => {
        if (selectedSchool && selectedCourses.length > 0) {
            axios.post(`/api/superadmin/${selectedSchool._id}/remove-courses`, {
                courses: selectedCourses.map(course => ({
                    courseId: course._id,
                    levelName: course.levelName
                }))
            }, { headers: { 'Authorization': sessionStorage.getItem('token') } })
                .then(response => {
                    toast.success('Courses removed successfully');
                    setSelectedSchool(null);
                    setSelectedCourses([]);
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error removing courses:', error);
                    toast.error('Failed to remove courses');
                });
        }
    };

    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = !selectedState || school.state === selectedState;
        const matchesDistrict = !selectedDistrict || school.district === selectedDistrict;
        return matchesSearch && matchesState && matchesDistrict;
    });

    const isCourseEnabled = (courseId) => {
        if (!selectedSchool) return false;
        return selectedSchool.availableCourses.some(course => course.courseId === courseId);
    };

    const isCourseAvailable = (courseId) => {
        if (!selectedSchool) return false;
        return selectedSchool.availableCourses.some(course => course.courseId === (courseId));
    };

    return (
        <div className="min-h-screen pt-32">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Manage Levels</h1>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg shadow hover:bg-indigo-50 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0114 0V3a1 1 0 112 0v2.101a9.002 9.002 0 01-14 0V3a1 1 0 011-1zm1 11a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1-6a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Refresh Data
                    </button>
                </div>

                {/* Main card */}
                <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-6 backdrop-filter backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Available Schools</h2>

                        {/* Search and filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search schools..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            {/* State dropdown */}
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All States</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            
                            {/* District dropdown */}
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedState}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                            >
                                <option value="">All Districts</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">School Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">City</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">State</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">District</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(3)].map((_, index) => (
                                        <tr key={`loading-${index}`} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredSchools.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                            <p>No schools found. Try adjusting your filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSchools.map(school => (
                                        <tr key={school._id} className="border-b hover:bg-indigo-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{school.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.city}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.state}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.district}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEnableClick(school)}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                                                >
                                                    Manage Levels
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for enabling/removing courses */}
            {selectedSchool && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            {isRemoveMode ? 'Remove Courses' : 'Enable Courses'} for {selectedSchool.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map(course => (
                                <div
                                    key={course._id}
                                    className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${
                                        isRemoveMode && selectedCourses.some(c => c._id === course._id)
                                            ? 'bg-red-500 text-white'
                                            : isCourseEnabled(course._id)
                                            ? 'bg-green-500 text-white'
                                            : isCourseAvailable(course._id)
                                            ? 'bg-yellow-500 text-white'
                                            : selectedCourses.some(c => c._id === course._id)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white hover:bg-indigo-50'
                                    }`}
                                    onClick={() => handleCourseSelect(course)}
                                >
                                    <div className="font-medium">{course.levelName}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setSelectedSchool(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setIsRemoveMode(!isRemoveMode)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition-colors"
                            >
                                {isRemoveMode ? 'Switch to Enable Mode' : 'Switch to Remove Mode'}
                            </button>
                            <button
                                onClick={isRemoveMode ? handleRemoveCourses : handleEnableCourses}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                            >
                                {isRemoveMode ? 'Remove Selected' : 'Enable Selected'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default Enablelevels;