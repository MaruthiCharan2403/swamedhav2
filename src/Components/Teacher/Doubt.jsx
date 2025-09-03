import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherDoubtsPage = ({ teacherId, levelId, termId, topicId }) => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Fetch doubts on component mount
  useEffect(() => {
    fetchDoubts();
  }, [teacherId, levelId, termId, topicId]);

  // Fetch doubts from the backend
  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teacher/${teacherId}/doubts`,
        {
          params: { courseId: levelId, termId, topicId },
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );
      setDoubts(response.data.doubts);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch doubts");
      setLoading(false);
    }
  };

  // Handle answering a doubt
  const handleAnswerDoubt = async (doubtId) => {
    if (!answer.trim()) {
      toast.error("Please enter an answer before submitting.");
      return;
    }

    try {
      await axios.post(
        `/api/teacher/${teacherId}/answer-doubt`,
        { studentId: doubts.find((d) => d._id === doubtId).studentId, doubtId, answer },
        {
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );
      toast.success("Doubt answered successfully");
      setAnswer("");
      fetchDoubts(); // Refresh the doubts list
    } catch (error) {
      toast.error("Failed to answer doubt");
    }
  };

  // Group doubts by student
  const groupDoubtsByStudent = () => {
    const grouped = {};
    doubts.forEach((doubt) => {
      if (!grouped[doubt.studentId]) {
        grouped[doubt.studentId] = {
          studentName: doubt.studentName,
          doubts: [],
        };
      }
      grouped[doubt.studentId].doubts.push(doubt);
    });
    return grouped;
  };

  // Get grouped doubts
  const groupedDoubts = groupDoubtsByStudent();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Student Doubts
        </h1>

        {/* Students List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-600">Loading doubts...</div>
          ) : Object.keys(groupedDoubts).length === 0 ? (
            <div className="text-center text-gray-600">No students found.</div>
          ) : (
            Object.keys(groupedDoubts).map((studentId) => (
              <div key={studentId} className="bg-white p-4 rounded-lg shadow-md">
                {/* Student Name */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setSelectedStudentId(
                      selectedStudentId === studentId ? null : studentId
                    )
                  }
                >
                  <p className="text-gray-800 font-semibold">
                    {groupedDoubts[studentId].studentName}
                  </p>
                  <span className="text-sm text-gray-500">
                    {groupedDoubts[studentId].doubts.length} doubt(s)
                  </span>
                </div>

                {/* Doubts List for Selected Student */}
                {selectedStudentId === studentId && (
                  <div className="mt-4 space-y-4">
                    {groupedDoubts[studentId].doubts.map((doubt) => (
                      <div
                        key={doubt._id}
                        className="bg-gray-50 p-4 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700">{doubt.question}</p>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              doubt.status === "answered"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {doubt.status}
                          </span>
                        </div>

                        {/* Answer Section */}
                        {doubt.status === "answered" && (
                          <div className="mt-2 bg-white p-3 rounded-lg">
                            <p className="text-gray-800 font-semibold">Answer:</p>
                            <p className="text-gray-700">{doubt.answer}</p>
                            <p className="text-sm text-gray-500">
                              Answered on:{" "}
                              {new Date(doubt.dateAnswered).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {/* Answer Input for Pending Doubts */}
                        {doubt.status === "pending" && (
                          <div className="mt-4">
                            <textarea
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                              rows="3"
                            />
                            <button
                              onClick={() => handleAnswerDoubt(doubt._id)}
                              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
                            >
                              Submit Answer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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

export default TeacherDoubtsPage;