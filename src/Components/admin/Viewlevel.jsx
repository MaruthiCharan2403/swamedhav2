import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom';

const Viewlevel = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data from the API
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

  // Rainbow colors for the headings and accents
  const rainbowColors = [
    'text-orange-500 border-orange-500', // Orange
    'text-yellow-500 border-yellow-500', // Yellow
    'text-green-500 border-green-500', // Green
    'text-blue-500 border-blue-500', // Blue
    'text-indigo-500 border-indigo-500', // Indigo
    'text-purple-500 border-purple-500', // Purple
    'text-pink-500 border-pink-500', // Pink
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Course Levels</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => {
            const colorClass = rainbowColors[index % rainbowColors.length];
            return (
              <div
                key={course._id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`border-b-2 ${colorClass.split(' ')[1]} pb-2 mb-4`}>
                  <h2 className={`text-2xl font-bold ${colorClass.split(' ')[0]}`}>
                    {course.levelName}
                  </h2>
                </div>
                
                

                <button
                  onClick={() => navigate(`/admin/editlevel?id=${course._id}`)}
                  className={`w-full py-2 px-4 border ${colorClass.split(' ')[1]} rounded-md text-white ${colorClass.split(' ')[0].replace('text', 'bg')} hover:opacity-90 transition-opacity`}
                >
                  Edit Level
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Viewlevel;