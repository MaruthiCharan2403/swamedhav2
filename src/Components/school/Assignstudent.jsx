import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

export default function AssignStudents() {
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(null);
  const [params] = useSearchParams();
  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Fetch all students and extract class-sections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/student/get', {
          headers: {
            Authorization: `${sessionStorage.getItem('token')}`
          }
        });
        
        setAllStudents(response.data);
        
        // Extract unique class-section combinations
        const classSectionMap = {};
        response.data.forEach(student => {
          if (student.class && student.section) {
            if (!classSectionMap[student.class]) {
              classSectionMap[student.class] = new Set();
            }
            classSectionMap[student.class].add(student.section);
          }
        });
        
        const classSectionsArray = Object.entries(classSectionMap).map(([classNum, sections]) => ({
          class: classNum,
          sections: Array.from(sections)
        }));
        
        setClassSections(classSectionsArray);
        setTeacherId(params.get('teacherId'));
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch students');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students when class and section are selected
  useEffect(() => {
    if (selectedClass && selectedSection) {
      const filtered = allStudents.filter(student => 
        student.class === selectedClass && student.section === selectedSection
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
    setCurrentPage(1);
  }, [selectedClass, selectedSection, allStudents]);

  // Get available sections for selected class
  const getAvailableSections = () => {
    const classData = classSections.find(item => item.class === selectedClass);
    return classData ? classData.sections : [];
  };

  // Check if a student is assigned to the teacher
  const isStudentAssigned = (student) => {
    return student.assignedTeacher !== null;
  };

  // Assign single student
  const assignStudent = async (studentId) => {
    try {
      const response = await axios.post(
        '/api/teacher/assign-student',
        { studentId, teacherId, schoolId: sessionStorage.getItem('schoolId') },
        {
          headers: {
            Authorization: `${sessionStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(response.data.message);
      
      // Update the student in both states
      const updatedStudents = allStudents.map(student => 
        student._id === studentId ? { ...student, assignedTeacher: teacherId } : student
      );
      
      setAllStudents(updatedStudents);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to assign student');
    }
  };

  // Remove single student
  const removeStudent = async (studentId) => {
    try {
      const response = await axios.post(
        '/api/teacher/remove-student',
        { studentId, teacherId, schoolId: sessionStorage.getItem('schoolId') },
        {
          headers: {
            Authorization: `${sessionStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(response.data.message);
      
      // Update the student in both states
      const updatedStudents = allStudents.map(student => 
        student._id === studentId ? { ...student, assignedTeacher: null } : student
      );
      
      setAllStudents(updatedStudents);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to remove student');
    }
  };

  // Assign all students in the current class-section
  const assignAllStudents = async () => {
    if (!selectedClass || !selectedSection) {
      toast.warning('Please select both class and section first');
      return;
    }

    try {
      const response = await axios.post(
        '/api/teacher/assign-section',
        { 
          classNumber: selectedClass, 
          section: selectedSection, 
          teacherId,
          schoolId: sessionStorage.getItem('schoolId')
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(response.data.message);
      
      // Update all students in the selected class-section
      const updatedStudents = allStudents.map(student => 
        student.class === selectedClass && student.section === selectedSection 
          ? { ...student, assignedTeacher: teacherId } 
          : student
      );
      
      setAllStudents(updatedStudents);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to assign all students');
    }
  };

  // Remove all students in the current class-section
  const removeAllStudents = async () => {
    if (!selectedClass || !selectedSection) {
      toast.warning('Please select both class and section first');
      return;
    }

    try {
      const response = await axios.post(
        '/api/teacher/remove-section',
        { 
          classNumber: selectedClass, 
          section: selectedSection, 
          teacherId,
          schoolId: sessionStorage.getItem('schoolId')
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(response.data.message);
      
      // Update all students in the selected class-section
      const updatedStudents = allStudents.map(student => 
        student.class === selectedClass && student.section === selectedSection 
          ? { ...student, assignedTeacher: null } 
          : student
      );
      
      setAllStudents(updatedStudents);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to remove all students');
    }
  };

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <section className="p-5 dark:text-gray-900 min-h-screen pt-40">
        <div className="container shadow-gray-400 p-5 flex flex-col mx-auto max-w-5xl bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-700">
          <div className="col-span-full">
            <p className="font-bold text-3xl text-white">Assign Students to Teacher</p>
          </div>

          {/* Class and Section Selection */}
          <div className="flex flex-wrap items-center gap-4 my-4">
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="class-select" className="block text-sm font-medium text-white mb-1">
                Class
              </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Select Class --</option>
                {classSections.map((item) => (
                  <option key={item.class} value={item.class}>
                    Class {item.class}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label htmlFor="section-select" className="block text-sm font-medium text-white mb-1">
                Section
              </label>
              <select
                id="section-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <option value="">-- Select Section --</option>
                {getAvailableSections().map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <button
                onClick={assignAllStudents}
                disabled={!selectedClass || !selectedSection}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign All
              </button>
              <button
                onClick={removeAllStudents}
                disabled={!selectedClass || !selectedSection}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove All
              </button>
            </div>
          </div>

          {/* Students Table (shown only when class and section are selected) */}
          {selectedClass && selectedSection && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Student Name</th>
                      <th className="px-6 py-3 text-left">Class</th>
                      <th className="px-6 py-3 text-left">Section</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
                        <tr key={student._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">{student.name}</td>
                          <td className="px-6 py-4">{student.class}</td>
                          <td className="px-6 py-4">{student.section}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isStudentAssigned(student)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isStudentAssigned(student) ? 'Assigned' : 'Not Assigned'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isStudentAssigned(student) ? (
                              <button
                                onClick={() => removeStudent(student._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => assignStudent(student._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                              >
                                Assign
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No students found in Class {selectedClass} - Section {selectedSection}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredStudents.length > studentsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-300">
                    Showing {indexOfFirstStudent + 1} to{' '}
                    {Math.min(indexOfLastStudent, filteredStudents.length)} of{' '}
                    {filteredStudents.length} students
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-indigo-300"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-white text-gray-800 rounded">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-indigo-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}