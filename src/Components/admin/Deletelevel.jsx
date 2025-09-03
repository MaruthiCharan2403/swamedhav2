import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Deletelevel = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch courses
  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/course/get");
      setCourses(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete request
  const confirmDelete = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const deleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await axios.delete(`/api/course/${selectedCourse._id}`);
      setCourses((prev) =>
        prev.filter((c) => c._id !== selectedCourse._id)
      );
      toast.success("Course deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting course");
    } finally {
      setShowModal(false);
      setSelectedCourse(null);
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((course) =>
    course.levelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Delete Level</h1>
          <button
            onClick={fetchCourses}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading courses...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-500">No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="flex justify-between items-center bg-white shadow rounded-lg p-5 hover:shadow-md transition-all"
              >
                {/* Level Name */}
                <span className="text-lg font-semibold text-gray-800">
                  {course.levelName}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => confirmDelete(course)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                  title="Delete course"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 
                      0 002 2h8a2 2 0 002-2V6a1 1 0 
                      100-2h-3.382l-.724-1.447A1 1 
                      0 0011 2H9zM7 8a1 1 0 012 
                      0v6a1 1 0 11-2 0V8zm5-1a1 1 
                      0 00-1 1v6a1 1 0 102 
                      0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {showModal && selectedCourse && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">
                  {selectedCourse.levelName}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteCourse}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Deletelevel;
