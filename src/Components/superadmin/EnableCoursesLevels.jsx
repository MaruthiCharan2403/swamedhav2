import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const EnableCoursesLevels = () => {
    // Common state for both tabs
    const [schools, setSchools] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'levels'

    // Courses tab state
    const [selectedSchoolCourses, setSelectedSchoolCourses] = useState(null);
    const [enabledCourses, setEnabledCourses] = useState([]);
    const [showCoursesModal, setShowCoursesModal] = useState(false);

    // Levels tab state
    const [selectedSchoolLevels, setSelectedSchoolLevels] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [isRemoveMode, setIsRemoveMode] = useState(false);

    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch schools
                const schoolsResponse = await axios.get('/api/school/allschools', {
                    headers: { 'Authorization': sessionStorage.getItem('token') }
                });
                setSchools(schoolsResponse.data);
                extractLocationData(schoolsResponse.data);

                // Fetch courses (for both tabs)
                const coursesResponse = await axios.get('/api/course/getall', {
                    headers: { 'Authorization': sessionStorage.getItem('token') }
                });
                setCourses(coursesResponse.data.map(course => ({
                    ...course,
                    showTerms: false
                })));

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setIsLoading(false);
            }
        };

        fetchData();
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

    // COURSES TAB FUNCTIONS
     const openCoursesModal = (school) => {
        setSelectedSchoolCourses(school);
        setEnabledCourses(school.enabledCourses || []);
        setShowCoursesModal(true);
    };

    const toggleTerm = (courseId, termId, termName, studentCount = 0) => {
        const courseIndex = enabledCourses.findIndex(course => course.courseId === courseId);
        if (courseIndex === -1) {
            // Course not in enabledCourses, add it with the term
            setEnabledCourses([...enabledCourses, {
                courseId,
                levelName: courses.find(course => course._id === courseId)?.levelName || '',
                enabledTerms: [{ termId, termName, isEnabled: true }],
                studentcount: studentCount
            }]);
        } else {
            // Course is in enabledCourses, toggle the term
            const termIndex = enabledCourses[courseIndex].enabledTerms?.findIndex(term => term.termId === termId) ?? -1;
            if (termIndex === -1) {
                // Term not in enabledTerms, add it
                const newEnabledTerms = [...(enabledCourses[courseIndex].enabledTerms || []), { termId, termName, isEnabled: true }];
                const updatedCourse = {
                    ...enabledCourses[courseIndex],
                    enabledTerms: newEnabledTerms
                };
                const updatedEnabledCourses = [...enabledCourses];
                updatedEnabledCourses[courseIndex] = updatedCourse;
                setEnabledCourses(updatedEnabledCourses);
            } else {
                // Term is in enabledTerms, toggle isEnabled
                const updatedEnabledTerms = [...enabledCourses[courseIndex].enabledTerms];
                updatedEnabledTerms[termIndex] = {
                    ...updatedEnabledTerms[termIndex],
                    isEnabled: !updatedEnabledTerms[termIndex].isEnabled
                };
                const updatedCourse = {
                    ...enabledCourses[courseIndex],
                    enabledTerms: updatedEnabledTerms
                };
                const updatedEnabledCourses = [...enabledCourses];
                updatedEnabledCourses[courseIndex] = updatedCourse;
                setEnabledCourses(updatedEnabledCourses);
            }
        }
    };

    const updateStudentCount = (courseId, count) => {
        const updatedEnabledCourses = enabledCourses.map(course => {
            if (course.courseId === courseId) {
                return { ...course, studentcount: parseInt(count) || 0 };
            }
            return course;
        });
        setEnabledCourses(updatedEnabledCourses);
    };

    const deselectAllTerms = (courseId) => {
        const updatedEnabledCourses = enabledCourses.map(course => {
            if (course.courseId === courseId) {
                return { ...course, enabledTerms: [] };
            }
            return course;
        });
        setEnabledCourses(updatedEnabledCourses);
    };

    const deselectCourse = (courseId) => {
        const updatedEnabledCourses = enabledCourses.filter(course => course.courseId !== courseId);
        setEnabledCourses(updatedEnabledCourses);
    };


    const saveEnabledCourses = async () => {
        try {
            // Show confirmation for removal
            const hasRemovals = window.confirm(
                "Saving these changes will remove courses/terms from student assignments. " +
                "This action cannot be undone. Continue?"
            );
            
            if (!hasRemovals) return;
            
            await axios.put(
                `/api/school/${selectedSchoolCourses._id}/enabled-courses`, 
                { enabledCourses }, 
                {
                    headers: { Authorization: `${sessionStorage.getItem('token')}` }
                }
            );
            setShowCoursesModal(false);
            toast.success('Enabled courses saved successfully');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error saving enabled courses:', error);
            toast.error('Failed to save enabled courses');
        }
    };

    // LEVELS TAB FUNCTIONS
    const openLevelsModal = (school) => {
        setSelectedSchoolLevels(school);
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
        if (selectedSchoolLevels && selectedCourses.length > 0) {
            axios.post(`/api/superadmin/${selectedSchoolLevels._id}/add-courses`, {
                courses: selectedCourses.map(course => ({
                    courseId: course._id,
                    levelName: course.levelName
                }))
            }, { headers: { 'Authorization': sessionStorage.getItem('token') } })
                .then(response => {
                    toast.success('Courses enabled successfully');
                    setSelectedSchoolLevels(null);
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
        if (selectedSchoolLevels && selectedCourses.length > 0) {
            // Show confirmation for removal
            const confirmRemove = window.confirm(
                "Removing these courses will also remove them from all student assignments. " +
                "This action cannot be undone. Continue?"
            );
            
            if (!confirmRemove) return;
            
            axios.post(`/api/superadmin/${selectedSchoolLevels._id}/remove-courses`, {
                courses: selectedCourses.map(course => ({
                    courseId: course._id,
                    levelName: course.levelName
                }))
            }, { headers: { 'Authorization': sessionStorage.getItem('token') } })
                .then(response => {
                    toast.success('Courses removed successfully');
                    setSelectedSchoolLevels(null);
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

    const isCourseEnabled = (courseId) => {
        if (!selectedSchoolLevels) return false;
        return selectedSchoolLevels.availableCourses.some(course => course.courseId === courseId);
    };

    const isCourseAvailable = (courseId) => {
        if (!selectedSchoolLevels) return false;
        return selectedSchoolLevels.availableCourses.some(course => course.courseId === (courseId));
    };

    // Common filtered schools
    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = !selectedState || school.state === selectedState;
        const matchesDistrict = !selectedDistrict || school.district === selectedDistrict;
        return matchesSearch && matchesState && matchesDistrict;
    });

    return (
        <div className="min-h-screen pt-24">
            <ToastContainer />
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">School Management</h1>
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

                {/* Tab Navigation */}
                <div className="flex mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                            activeTab === 'courses' 
                                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Enable Terms
                    </button>
                    <button
                        onClick={() => setActiveTab('levels')}
                        className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                            activeTab === 'levels' 
                                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Manage Levels
                    </button>
                </div>

                {/* Main card */}
                <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-6 backdrop-filter backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {activeTab === 'courses' ? 'Available Schools' : 'Manage Levels'}
                        </h2>

                        {/* Filters */}
                        <div className="w-full md:w-auto grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Search input */}
                            <div className="relative col-span-1 md:col-span-1">
                                <input
                                    type="text"
                                    placeholder="Search schools..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            {/* State dropdown */}
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
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
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 w-full"
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
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">School Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">City</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">State</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">District</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Actions</th>
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
                                                <div className="text-gray-900">{school.city}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.state}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.district}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">{school.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-2">
                                                    <button
                                                        onClick={() => openCoursesModal(school)}
                                                        className={`bg-indigo-600 text-white px-3 py-1 rounded-lg shadow hover:bg-indigo-700 transition-colors text-sm ${
                                                            activeTab === 'levels' ? 'hidden' : ''
                                                        }`}
                                                    >
                                                        Enable Terms
                                                    </button>
                                                    <button
                                                        onClick={() => openLevelsModal(school)}
                                                        className={`bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700 transition-colors text-sm ${
                                                            activeTab === 'courses' ? 'hidden' : ''
                                                        }`}
                                                    >
                                                        Manage Levels
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* COURSES MODAL */}
            {showCoursesModal && selectedSchoolCourses && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Manage Courses for {selectedSchoolCourses.name}
                        </h2>

                        {/* Courses List */}
                        <div className="space-y-4">
                            {courses
                                .filter(course =>
                                    selectedSchoolCourses.availableCourses?.some(
                                        availableCourse => availableCourse.courseId.toString() === course._id.toString()
                                    )
                                )
                                .map(course => {
                                    const isCourseEnabled = enabledCourses.some(ec => ec.courseId === course._id);
                                    const enabledTermsCount = isCourseEnabled 
                                        ? (enabledCourses.find(ec => ec.courseId === course._id)?.enabledTerms?.length || 0)
                                        : 0;
                                    const totalTermsCount = course.terms?.length || 0;

                                    return (
                                        <div key={course._id} className="border rounded-lg overflow-hidden">
                                            {/* Course Header */}
                                            <div
                                                className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                                onClick={() => {
                                                    const updatedCourses = courses.map(c =>
                                                        c._id === course._id ? { ...c, showTerms: !c.showTerms } : c
                                                    );
                                                    setCourses(updatedCourses);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <h3 className="font-medium text-gray-800 mr-3">{course.levelName}</h3>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        isCourseEnabled 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {enabledTermsCount}/{totalTermsCount} terms enabled
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    {/* Student Count Input */}
                                                    <div className="mr-3">
                                                        <label className="text-xs text-gray-600 block">Students</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={enabledCourses.find(ec => ec.courseId === course._id)?.studentcount || 0}
                                                            onChange={(e) => updateStudentCount(course._id, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-16 px-2 py-1 border rounded text-sm"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deselectCourse(course._id);
                                                        }}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors me-2 text-sm"
                                                    >
                                                        Deselect Course
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deselectAllTerms(course._id);
                                                        }}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors text-sm"
                                                    >
                                                        Deselect Terms
                                                    </button>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-5 w-5 ml-3 transform transition-transform ${
                                                            course.showTerms ? 'rotate-180' : ''
                                                        }`}
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Terms List */}
                                            {course.showTerms && (
                                                <div className="p-4 bg-white">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {course.terms?.map(term => {
                                                            const isTermEnabled = enabledCourses.some(ec =>
                                                                ec.courseId === course._id &&
                                                                ec.enabledTerms?.some(et =>
                                                                    et.termId === term._id && et.isEnabled
                                                                )
                                                            );
                                                            return (
                                                                <div key={term._id} className="flex items-center justify-between p-3 border rounded-lg">
                                                                    <div className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isTermEnabled}
                                                                            onChange={() => toggleTerm(
                                                                                course._id, 
                                                                                term._id, 
                                                                                term.termName,
                                                                                enabledCourses.find(ec => ec.courseId === course._id)?.studentcount || 0
                                                                            )}
                                                                            className="form-checkbox h-5 w-5 text-indigo-600 rounded mr-3"
                                                                        />
                                                                        <span className="text-gray-700">{term.termName}</span>
                                                                    </div>
                                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                                        isTermEnabled 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {isTermEnabled ? 'Enabled' : 'Disabled'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            }
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowCoursesModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={saveEnabledCourses}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEVELS MODAL */}
            {selectedSchoolLevels && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            {isRemoveMode ? 'Remove Courses' : 'Enable Courses'} for {selectedSchoolLevels.name}
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
                                onClick={() => setSelectedSchoolLevels(null)}
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
                                {isRemoveMode ? 'Remove ' : 'Enable '}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnableCoursesLevels;