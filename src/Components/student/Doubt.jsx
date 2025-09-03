import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoubtsPage = ({ studentId, levelId, termId, topicId }) => {
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch doubts on component mount
  useEffect(() => {
    fetchDoubts();
  }, [studentId, levelId, termId, topicId]);

  // Fetch doubts from the backend
  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/student/${studentId}/fetch-doubts`,
        {
          params: { courseId:levelId, termId, topicId },
        }
      );
      setDoubts(response.data.doubts);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch doubts");
      setLoading(false);
    }
  };

  // Submit a new doubt
  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubt.trim()) {
      toast.error("Please enter a doubt before submitting");
      return;
    }

    try {
      await axios.post(
        `/api/student/${studentId}/submit-doubt`,
        { courseId:levelId, termId, topicId, question: newDoubt }
      );
      toast.success("Doubt submitted successfully");
      setNewDoubt("");
      fetchDoubts(); // Refresh the doubts list
    } catch (error) {
      toast.error("Failed to submit doubt");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Doubts and Answers
        </h1>

        {/* Doubt Submission Form */}
        <form onSubmit={handleSubmitDoubt} className="mb-8">
          <div className="flex flex-col space-y-4">
            <textarea
              value={newDoubt}
              onChange={(e) => setNewDoubt(e.target.value)}
              placeholder="Type your doubt here..."
              className="w-full p-4 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="4"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Submit Doubt
            </button>
          </div>
        </form>

        {/* Doubts List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-600">Loading doubts...</div>
          ) : doubts.length === 0 ? (
            <div className="text-center text-gray-600">No doubts found.</div>
          ) : (
            doubts.map((doubt) => (
              <div
                key={doubt._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">Q</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">{doubt.question}</p>
                    <p className="text-sm text-gray-500">
                      Posted on: {new Date(doubt.datePosted).toLocaleString()}
                    </p>
                  </div>
                </div>
                {doubt.answer && (
                  <div className="ml-14">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">A</span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {doubt.answer}
                        </p>
                        <p className="text-sm text-gray-500">
                          Answered on:{" "}
                          {new Date(doubt.dateAnswered).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!doubt.answer && (
                  <div className="ml-14 text-sm text-gray-500">
                    Waiting for an answer...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoubtsPage;