import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const Studentcourses = () => {
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/student/courses', {
          headers: { Authorization: `${sessionStorage.getItem('token')}` },
        });
        // Sort courses by levelName before setting state
        const sortedCourses = [...response.data.assignedCourses].sort((a, b) => 
          a.levelName.localeCompare(b.levelName)
        );
        setAssignedCourses(sortedCourses);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const gradients = [
    'from-purple-600 via-pink-600 to-red-500',
    'from-blue-600 via-cyan-600 to-teal-500',
    'from-green-500 via-emerald-500 to-cyan-500',
    'from-orange-500 via-red-500 to-pink-500',
    'from-indigo-600 via-purple-600 to-pink-500',
    'from-yellow-400 via-orange-500 to-red-500',
    'from-teal-500 via-blue-500 to-purple-600',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.943 2.524l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10 p-6 pt-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {assignedCourses.map((course, index) => {
            const gradient = gradients[index % gradients.length];
            return (
              <div
                key={course.courseId}
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 group-hover:text-purple-700 transition-colors duration-300">
                    {course.levelName}
                  </h3>

                  <div className="mb-6">
                    <div className="space-y-2">
                      {course.terms.map((term) => (
                        <div 
                          key={term.termId}
                          onClick={() => navigate(`/student/level/term?levelid=${course.courseId}&termid=${term.termId}`)}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-300 cursor-pointer"
                        >
                          <span className="text-gray-800 font-medium">{term.termName}</span>
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-300 transition-colors duration-300"></div>
              </div>
            );
          })}
        </div>

        {assignedCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses assigned yet</h3>
            <p className="text-gray-600">Contact your instructor to get started with your learning journey.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Studentcourses;