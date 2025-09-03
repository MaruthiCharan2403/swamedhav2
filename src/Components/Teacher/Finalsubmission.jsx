import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherFinalSubmissionsPage = ({ teacherId, levelId, termId, topicId }) => {
  const [finalSubmissions, setFinalSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch final submissions on component mount
  useEffect(() => {
    fetchFinalSubmissions();
  }, [teacherId,levelId, termId, topicId]);

  // Fetch final submissions from the backend
  const fetchFinalSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teacher/${teacherId}/final-submissions`,
        {
          params: { courseId:levelId, termId, topicId },
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );
      setFinalSubmissions(response.data.finalSubmissions);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch final submissions");
      setLoading(false);
    }
  };

  // Enable final submission for all assigned students
  const handleEnableFinalSubmission = async () => {
    try {
      await axios.post(
        `/api/teacher/${teacherId}/enable-final-submission`,
        { courseId:levelId, termId, topicId },
        {
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );
      toast.success("Final submission enabled for all assigned students");
      fetchFinalSubmissions(); // Refresh the final submissions list
    } catch (error) {
      toast.error("Failed to enable final submission");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Final Submissions
        </h1>

        {/* Enable Final Submission Button */}
        <div className="mb-8">
          <button
            onClick={handleEnableFinalSubmission}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Enable Final Submission for All Students
          </button>
        </div>

        {/* Final Submissions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-600">Loading final submissions...</div>
          ) : finalSubmissions.length === 0 ? (
            <div className="text-center text-gray-600">No final submissions found.</div>
          ) : (
            finalSubmissions.map((submission) => (
              <div
                key={submission.studentId}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 font-semibold">
                      {submission.studentName}
                    </p>
                  </div>
                  <a
                    href={submission.finalsubmission}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    View Submission
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherFinalSubmissionsPage;