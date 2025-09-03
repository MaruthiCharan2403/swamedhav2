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

  // Rainbow colors for the cards
  const rainbowColors = [
    'bg-orange-500', // Red
    'bg-orange-500', // Orange
    'bg-yellow-500', // Yellow
    'bg-green-500', // Green
    'bg-blue-500', // Blue
    'bg-indigo-500', // Indigo
    'bg-purple-500', // Purple
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-32">
      <h1 className="text-3xl font-bold text-center mb-8">School Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
          const colorClass = rainbowColors[index % rainbowColors.length]; // Cycle through rainbow colors
          return (
            <div
              key={course.courseId}
              className={`${colorClass} p-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => navigate(`/teacher/level?id=${course.courseId}`)}
            >
              <h2 className="text-2xl font-bold mb-4">{course.levelName}</h2>
              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">Student Count:</span> {course.studentcount}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Teachercourses;