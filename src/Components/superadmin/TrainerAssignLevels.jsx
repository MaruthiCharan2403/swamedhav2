import React, { useEffect, useState } from 'react';
import axios from 'axios';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function TrainersCoursesPage() {
    const [trainers, setTrainers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [updating, setUpdating] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [modalUpdating, setModalUpdating] = useState(false);
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');
    const [modalCourses, setModalCourses] = useState([]);

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [trainersRes, coursesRes] = await Promise.all([
                    axios.get('/api/trainer', {
                        headers: {
                            Authorization: token
                        }
                    }),
                    axios.get('/api/course'),
                ]);
                const trainersWithEnabled = await Promise.all(trainersRes.data.map(async (trainer) => {
                    const res = await axios.get(`/api/trainer/viewAssignedCourses/${trainer._id}`, {
                        headers: {
                            Authorization: token
                        }
                    });
                    return { ...trainer, enabledCourses: res.data };
                }));

                setTrainers(trainersWithEnabled);
                setCourses(coursesRes.data);
            } catch (err) {
                setError('Failed to fetch trainers or courses');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredTrainers = trainers.filter(trainer =>
        (trainer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trainer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCourseFilter = (e) => setSelectedCourse(e.target.value);

    const handleToggleCourse = async (trainerId, courseId, isEnabled) => {
        setError('');
        setSuccess('');
        setUpdating((prev) => ({ ...prev, [trainerId]: true }));
        try {
            const trainer = trainers.find(t => t._id === trainerId);
            let newEnabledCourses;
            if (isEnabled) {
                newEnabledCourses = trainer.enabledCourses.filter(c => c._id !== courseId).map(c => c._id);
            } else {
                newEnabledCourses = [...trainer.enabledCourses.map(c => c._id), courseId];
            }
            const res = await axios.put(`/api/trainer/assignCourses/${trainerId}`, {
                courseIds: newEnabledCourses
            }, {
                headers: {
                    Authorization: token
                }
            });
            setTrainers(trainers.map(t =>
                t._id === trainerId
                    ? { ...t, enabledCourses: res.data.enabledCourses }
                    : t
            ));
            setSuccess('Courses updated!');
        } catch (err) {
            setError('Failed to update courses');
        } finally {
            setUpdating((prev) => ({ ...prev, [trainerId]: false }));
        }
    };

    const handleModalToggleCourse = async (courseId, isEnabled) => {
        if (!selectedTrainer) return;
        setModalError('');
        setModalSuccess('');
        setModalUpdating(true);
        try {
            let newEnabledCourses;
            if (isEnabled) {
                newEnabledCourses = modalCourses.filter(c => c._id !== courseId).map(c => c._id);
            } else {
                newEnabledCourses = [...modalCourses.map(c => c._id), courseId];
            }
            const res = await axios.put(`/api/trainer/assignCourses/${selectedTrainer._id}`, {
                courseIds: newEnabledCourses
            }, {
                headers: {
                    Authorization: token
                }
            });
            setModalCourses(res.data.enabledCourses);
            setTrainers(trainers.map(t =>
                t._id === selectedTrainer._id
                    ? { ...t, enabledCourses: res.data.enabledCourses }
                    : t
            ));
            setModalSuccess('Courses updated!');
        } catch (err) {
            setModalError('Failed to update courses');
        } finally {
            setModalUpdating(false);
        }
    };

    const openModal = (trainer) => {
        setSelectedTrainer(trainer);
        setIsModalOpen(true);
        setModalCourses(trainer.enabledCourses);
        setModalError('');
        setModalSuccess('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTrainer(null);
        setModalCourses([]);
        setModalError('');
        setModalSuccess('');
    };

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto pt-36 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Trainers</h1>
                        <p className="text-gray-600 mt-1">Manage trainers & assigned courses</p>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search trainers by name or email..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={handleCourseFilter}
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex-shrink-0"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.levelName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Trainers Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTrainers
                                    .filter(trainer =>
                                        !selectedCourse ||
                                        trainer.enabledCourses.some(c => c._id === selectedCourse)
                                    )
                                    .map(trainer => (
                                        <tr
                                            key={trainer._id}
                                            className="hover:bg-gray-50 cursor-pointer transition"
                                            onClick={() => openModal(trainer)}
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ' ') openModal(trainer);
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{trainer.name || trainer.email || `Trainer: ${trainer._id}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{trainer.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">{trainer.enabledCourses.length}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors duration-200"
                                                    onClick={e => { e.stopPropagation(); openModal(trainer); }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>Manage Courses</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {(!loading && filteredTrainers.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-16 bg-gray-50 rounded-lg">
                                            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">No trainers found</h3>
                                            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedTrainer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-900">{selectedTrainer.name || selectedTrainer.email}</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-semibold text-lg mb-4 text-gray-900">Trainer Information</h4>
                                <div className="space-y-3">
                                    <div className="flex">
                                        <span className="font-medium w-32 text-gray-600">Email:</span>
                                        <span>{selectedTrainer.email}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="font-medium w-32 text-gray-600">Assigned Courses:</span>
                                        <span>{modalCourses.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Manage Courses UI */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-lg mb-4 text-gray-900">Manage Courses</h4>
                                {modalError && <div className="text-red-600 mb-2">{modalError}</div>}
                                {modalSuccess && <div className="text-green-600 mb-2">{modalSuccess}</div>}
                                <div className="grid grid-cols-1 gap-3">
                                    {courses.map((course) => {
                                        const isEnabled = modalCourses.some(
                                            (c) => c._id === course._id
                                        );
                                        return (
                                            <div
                                                key={course._id}
                                                className={classNames(
                                                    'flex items-center p-3 rounded-md border transition-all',
                                                    isEnabled
                                                        ? 'bg-gradient-to-r from-indigo-50 to-green-50 border-green-400'
                                                        : 'bg-gray-50 border-gray-200'
                                                )}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-indigo-800">{course.levelName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {course.terms && course.terms.length > 0
                                                            ? `${course.terms.length} terms`
                                                            : 'No terms'}
                                                    </div>
                                                </div>
                                                <button
                                                    disabled={modalUpdating}
                                                    onClick={() =>
                                                        handleModalToggleCourse(course._id, isEnabled)
                                                    }
                                                    className={classNames(
                                                        'ml-4 px-4 py-2 rounded-full font-bold transition-shadow shadow',
                                                        isEnabled
                                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200',
                                                        modalUpdating && 'opacity-50 cursor-not-allowed'
                                                    )}
                                                >
                                                    {isEnabled ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Enabled Courses Table */}
                            <div>
                                <h4 className="font-semibold text-lg mb-4 text-gray-900">Enabled Courses</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="py-2 px-4 border-b text-left">Level Name</th>
                                                <th className="py-2 px-4 border-b text-left">Terms</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modalCourses.map((course, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="py-2 px-4 border-b">{course.levelName}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex flex-wrap gap-2">
                                                            {course.terms?.map((term, tIdx) => (
                                                                <span key={tIdx} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                                    {term.termName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}