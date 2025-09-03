import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FinalSubmissionPage = ({ studentId, levelId, termId, topicId }) => {
  const [completed, setCompleted] = useState(false);
  const [finalsubmission, setFinalsubmission] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch progress data on component mount
  useEffect(() => {
    fetchProgress();
  }, [studentId, levelId, termId, topicId]);

  // Fetch progress data from the backend
  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/student/${studentId}/fetch-progress`,
        {
          params: { courseId:levelId, termId, topicId },
        }
      );
      setCompleted(response.data.progress.completed);
      setFinalsubmission(response.data.progress.finalsubmission || "");
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch progress data");
      setLoading(false);
    }
  };

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!completed) {
      toast.error("Topic is not marked as completed");
      return;
    }
    if (!finalsubmission.trim()) {
      toast.error("Please enter a valid submission link");
      return;
    }

    try {
      await axios.post(
        `/api/student/${studentId}/update-final-submission`,
        { courseId:levelId, termId, topicId, finalsubmission }
      );
      toast.success("Final submission updated successfully");
    } catch (error) {
      toast.error("Failed to update final submission");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Final Submission
        </h1>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
          <div className="space-y-6">
            {/* Completed Status */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-semibold">Completed:</span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  completed
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {completed ? "Yes" : "No"}
              </span>
            </div>

            {/* Final Submission Link */}
            <div className="space-y-2">
              <label className="text-gray-700 font-semibold">
                Final Submission Link:
              </label>
              <input
                type="url"
                value={finalsubmission}
                onChange={(e) => setFinalsubmission(e.target.value)}
                placeholder="Enter your submission link"
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!completed}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!completed}
              className={`w-full px-6 py-3 rounded-lg text-white font-semibold ${
                completed
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-400 cursor-not-allowed"
              } transition duration-300`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalSubmissionPage;