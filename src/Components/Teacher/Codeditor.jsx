import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherStudentCodesPage = ({ teacherId, levelId, termId, topicId }) => {
  const [studentsWithCodes, setStudentsWithCodes] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch student codes on component mount
  useEffect(() => {
    fetchStudentCodes();
  }, [teacherId, levelId, termId, topicId]);

  // Fetch student codes from the backend
  const fetchStudentCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teacher/${teacherId}/student-codes`,
        {
          params: { courseId: levelId, termId, topicId },
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );
      setStudentsWithCodes(response.data.studentsWithCodes);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch student codes");
      setLoading(false);
    }
  };

  // Toggle selected student
  const handleStudentClick = (student) => {
    if (selectedStudent && selectedStudent.studentId === student.studentId) {
      // If the clicked student is already selected, close the code view
      setSelectedStudent(null);
    } else {
      // Otherwise, open the code view for the clicked student
      setSelectedStudent(student);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Student Codes
        </h1>

        {/* Students List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-600">Loading student codes...</div>
          ) : studentsWithCodes.length === 0 ? (
            <div className="text-center text-gray-600">No students found.</div>
          ) : (
            studentsWithCodes.map((student) => (
              <div
                key={student.studentId}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleStudentClick(student)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">S</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.codes.length} code(s) submitted
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Student Codes */}
        {selectedStudent && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Codes by {selectedStudent.name}
            </h2>
            <div className="space-y-4">
              {selectedStudent.codes.length === 0 ? (
                <div className="text-center text-gray-600">No codes submitted.</div>
              ) : (
                selectedStudent.codes.map((code, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-700 font-semibold">
                        Code #{index + 1}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted on: {new Date(code.dateSubmitted).toLocaleString()}
                      </p>
                    </div>
                    <pre className="bg-gray-100 p-3 rounded-lg text-gray-800 overflow-x-auto">
                      <code>{code.code}</code>
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentCodesPage;