import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom';

const Teachercourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data from the API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/teacher/enabled',{
            headers: { Authorization: `${sessionStorage.getItem('token')}` },
        });
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  // Sort courses by levelName (course title)
  const sortedCourses = [...courses].sort((a, b) => {
    if (!a.levelName) return 1;
    if (!b.levelName) return -1;
    return a.levelName.localeCompare(b.levelName);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-32">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        🧑‍🏫 Teacher Courses
      </h1>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedCourses.map((course, index) => (
          <div
            key={course.courseId}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-indigo-500"
          >
            {/* Course Title */}
            <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-purple-600 group-hover:to-indigo-600">
              {course.levelName}
            </h2>

            

            {/* Enabled Terms */}
            {course.enabledTerms?.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {course.enabledTerms.map((term) => (
                    <span
                      key={term.termId}
                      onClick={() =>
                        navigate(
                          `/teacher/level/term?levelid=${course.courseId}&termid=${term.termId}`
                        )
                      }
                      className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 transition cursor-pointer shadow-sm"
                    >
                      {term.termName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachercourses;