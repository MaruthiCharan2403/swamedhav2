import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/course/get');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-28">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        Courses Dashboard
      </h1>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-blue-500"
          >
            {/* Course Title */}
            <h2 className="text-2xl text-center font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-purple-600 group-hover:to-blue-600">
              {course.levelName}
            </h2>

            {/* Terms Section */}
            {course.terms?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4 text-center">Terms</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {course.terms.map((term) => (
                    <button
                      key={term._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/level/term?levelid=${course._id}&termid=${term._id}`);
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-indigo-600 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
                    >
                      {term.termName}
                    </button>
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

export default AdminDashboard;
