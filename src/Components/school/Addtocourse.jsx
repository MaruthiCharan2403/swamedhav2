import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

export default function AssignCourseToStudentModal() {
  const [students, setStudents] = useState([]);
  const [enabledCourses, setEnabledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Bulk actions
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSection, setBulkSection] = useState('');

  // Fetch students and enabled courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await axios.get('/api/student/get', {
          headers: {
            'Authorization': sessionStorage.getItem('token')
          }
        });
        setStudents(studentsResponse.data);

        const enabledCoursesResponse = await axios.get('/api/school/enabled', {
          headers: {
            'Authorization': sessionStorage.getItem('token')
          }
        });
        setEnabledCourses(enabledCoursesResponse.data);

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // Check if a course is already assigned to a student
  const isCourseAssigned = (student, courseId) => {
    return student.assignedCourses.some((course) => course.courseId === courseId);
  };

  // Open modal for a student
  const openModal = (student) => {
    setBulkMode(false);
    setSelectedStudent(student);
    setIsModalOpen(true);
    setSelectedCourse('');
    setSelectedTerms([]);
  };

  // Open modal for bulk assign/remove (by class/section)
  const openBulkModal = () => {
    setBulkMode(true);
    setSelectedStudent(null);
    setIsModalOpen(true);
    setSelectedCourse('');
    setSelectedTerms([]);
    setBulkClass('');
    setBulkSection('');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setSelectedCourse('');
    setSelectedTerms([]);
    setBulkClass('');
    setBulkSection('');
    setBulkMode(false);
  };

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    const course = enabledCourses.find((course) => course.courseId === courseId);
    if (course && course.enabledTerms) {
      setSelectedTerms(course.enabledTerms.filter(term => term.isEnabled).map(term => term.termId));
    } else {
      setSelectedTerms([]);
    }
  };

  // Handle term selection in the modal
  const handleTermSelect = (termId) => {
    if (selectedTerms.includes(termId)) {
      setSelectedTerms(selectedTerms.filter((id) => id !== termId));
    } else {
      setSelectedTerms([...selectedTerms, termId]);
    }
  };

  // Assign course to a student
  const assignCourse = async () => {
    try {
      const selectedCourseObj = enabledCourses.find((course) => course.courseId === selectedCourse);
      const assignedTerms = selectedCourseObj.enabledTerms
        .filter(term => selectedTerms.includes(term.termId) && term.isEnabled)
        .map(term => ({ termId: term.termId, termName: term.termName }));

      const response = await axios.post(
        `/api/school/${selectedStudent._id}/add-course`,
        {
          courseId: selectedCourse,
          levelName: selectedCourseObj.levelName,
          assignedTerms
        },
        {
          headers: {
            'Authorization': sessionStorage.getItem('token')
          }
        }
      );

      toast.success(response.data.message);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign course. Please try again.');
    }
  };

  // Remove course from a student
  const removeCourse = async (courseId) => {
    try {
      const response = await axios.post(
        `/api/school/${selectedStudent._id}/remove-course`,
        { courseId },
        {
          headers: {
            'Authorization': sessionStorage.getItem('token')
          }
        }
      );

      toast.success(response.data.message);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove course. Please try again.');
    }
  };

  // Bulk assign course to class/section
  const bulkAssignCourse = async () => {
    try {
      if (!bulkClass || !bulkSection || !selectedCourse || selectedTerms.length === 0) {
        toast.error('Please select class, section, course, and terms!');
        return;
      }
      const selectedCourseObj = enabledCourses.find((course) => course.courseId === selectedCourse);
      const assignedTerms = selectedCourseObj.enabledTerms
        .filter(term => selectedTerms.includes(term.termId) && term.isEnabled)
        .map(term => ({ termId: term.termId, termName: term.termName }));

      const response = await axios.post(
        `/api/school/assign-course-section`,
        {
          classNumber: bulkClass,
          section: bulkSection,
          courseId: selectedCourse,
          levelName: selectedCourseObj.levelName,
          assignedTerms
        },
        {
          headers: {
            'Authorization': sessionStorage.getItem('token')
          }
        }
      );
      toast.success(response.data.message);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign course to section. Please try again.');
    }
  };

  // Bulk remove course from class/section
  const bulkRemoveCourse = async () => {
    try {
      if (!bulkClass || !bulkSection || !selectedCourse) {
        toast.error('Please select class, section, and course!');
        return;
      }
      const response = await axios.post(
        `/api/school/remove-course-section`,
        {
          classNumber: bulkClass,
          section: bulkSection,
          courseId: selectedCourse
        },
        {
          headers: {
            'Authorization': sessionStorage.getItem('token')
          }
        }
      );
      toast.success(response.data.message);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove course from section. Please try again.');
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Unique classes and sections for bulk actions (from students list)
  const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean);
  const uniqueSections = [...new Set(students.map(s => s.section))].filter(Boolean);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32">
      <ToastContainer />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Manage Student Courses</h1>
          <div className="flex gap-4">
            <button
              onClick={openBulkModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >Bulk Assign/Remove</button>
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
        </div>
        {/* Main card */}
        <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-6 backdrop-filter backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Available Students</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{student.class}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(student)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
                      >
                        Manage Courses
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            {bulkMode ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Assign/Remove Courses</h2>
                {/* Bulk Class and Section Select */}
                <div className="mb-6 flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      value={bulkClass}
                      onChange={e => setBulkClass(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Class</option>
                      {uniqueClasses.map((classNum) => (
                        <option key={classNum} value={classNum}>{classNum}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                    <select
                      value={bulkSection}
                      onChange={e => setBulkSection(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Section</option>
                      {uniqueSections.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Course Select */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {enabledCourses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.levelName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Terms Select */}
                {selectedCourse && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Terms</label>
                    <div className="space-y-2">
                      {enabledCourses
                        .find((course) => course.courseId === selectedCourse)
                        ?.enabledTerms
                        .filter(term => term.isEnabled)
                        .map((term) => (
                          <div key={term.termId} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTerms.includes(term.termId)}
                              onChange={() => handleTermSelect(term.termId)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span>{term.termName}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >Close</button>
                  {selectedCourse && selectedTerms.length > 0 && (
                    <button
                      onClick={bulkAssignCourse}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >Bulk Assign</button>
                  )}
                  {selectedCourse && (
                    <button
                      onClick={bulkRemoveCourse}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >Bulk Remove</button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Courses for {selectedStudent?.name}</h2>
                {/* Course Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {enabledCourses.map((course) => (
                      <option
                        key={course.courseId}
                        value={course.courseId}
                        disabled={isCourseAssigned(selectedStudent, course.courseId)}
                      >
                        {course.levelName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Term Selection */}
                {selectedCourse && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Terms</label>
                    <div className="space-y-2">
                      {enabledCourses
                        .find((course) => course.courseId === selectedCourse)
                        ?.enabledTerms
                        .filter(term => term.isEnabled)
                        .map((term) => (
                          <div key={term.termId} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTerms.includes(term.termId)}
                              onChange={() => handleTermSelect(term.termId)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span>{term.termName}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {/* Status */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Status</label>
                  <div className="space-y-2">
                    {enabledCourses.map((course) => (
                      <div key={course.courseId} className="flex items-center gap-2">
                        <span>{course.levelName}:</span>
                        {isCourseAssigned(selectedStudent, course.courseId) ? (
                          <span className="text-green-600">Enabled</span>
                        ) : (
                          <span className="text-red-600">Not Enabled</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                  {selectedCourse && (
                    <button
                      onClick={assignCourse}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Assign Course
                    </button>
                  )}
                  {enabledCourses.map((course) => (
                    isCourseAssigned(selectedStudent, course.courseId) && (
                      <button
                        key={course.courseId}
                        onClick={() => removeCourse(course.courseId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Remove Course
                      </button>
                    )
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}