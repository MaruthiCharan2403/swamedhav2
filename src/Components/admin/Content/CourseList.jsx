import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ViewPage = () => {
  const [contentData, setContentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
  // Filter states
  const [courseFilter, setCourseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [subtopicFilter, setSubtopicFilter] = useState('');
  
  // Available options for filters
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/content/getdata');
        const data = response.data;
        setContentData(data);
        setFilteredData(data);
        
        // Extract unique values for filters
        const uniqueCourses = [...new Set(data.map(item => item.coursename))];
        const uniqueClasses = [...new Set(data.map(item => item.classnumber))];
        setCourses(uniqueCourses);
        setClasses(uniqueClasses.sort((a, b) => a - b));
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update topic options when course or class changes
  useEffect(() => {
    if (courseFilter || classFilter) {
      let filtered = contentData;
      if (courseFilter) {
        filtered = filtered.filter(item => item.coursename === courseFilter);
      }
      if (classFilter) {
        filtered = filtered.filter(item => item.classnumber.toString() === classFilter);
      }
      const uniqueTopics = [...new Set(filtered.map(item => item.topicname))];
      setTopics(uniqueTopics);
      setTopicFilter('');
      setSubtopicFilter('');
      setSubtopics([]);
    }
  }, [courseFilter, classFilter, contentData]);

  // Update subtopic options when topic changes
  useEffect(() => {
    if (topicFilter) {
      let filtered = contentData;
      if (courseFilter) {
        filtered = filtered.filter(item => item.coursename === courseFilter);
      }
      if (classFilter) {
        filtered = filtered.filter(item => item.classnumber.toString() === classFilter);
      }
      filtered = filtered.filter(item => item.topicname === topicFilter);
      const uniqueSubtopics = [...new Set(filtered.map(item => item.subtopicname))];
      setSubtopics(uniqueSubtopics);
      setSubtopicFilter('');
    }
  }, [topicFilter, courseFilter, classFilter, contentData]);

  // Apply all filters
  useEffect(() => {
    let filtered = contentData;
    
    // Apply text search
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => 
        Object.values(item).some(
          val => val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      );
    }
    
    // Apply dropdown filters
    if (courseFilter) {
      filtered = filtered.filter(item => item.coursename === courseFilter);
    }
    if (classFilter) {
      filtered = filtered.filter(item => item.classnumber.toString() === classFilter);
    }
    if (topicFilter) {
      filtered = filtered.filter(item => item.topicname === topicFilter);
    }
    if (subtopicFilter) {
      filtered = filtered.filter(item => item.subtopicname === subtopicFilter);
    }
    
    setFilteredData(filtered);
  }, [searchTerm, courseFilter, classFilter, topicFilter, subtopicFilter, contentData]);

  const resetFilters = () => {
    setCourseFilter('');
    setClassFilter('');
    setTopicFilter('');
    setSubtopicFilter('');
    setSearchTerm('');
  };

  const deleteContent = async (id) => {
    
      try {
        await axios.delete(`/api/content/delete/${id}`);
        window.location.reload(); // Reload the page to reflect changes
      } catch (err) {
        setError('Failed to delete content. Please try again.');
      }
    
  };
  const handleViewDetails = (e, id) => {
    e.preventDefault();
    window.open(`/#/viewresource/${id}`, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Course Content</h1>
        
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Course Filter */}
            <div>
              <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                id="course-filter"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Courses</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
            </div>
            
            {/* Class Filter */}
            <div>
              <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="class-filter"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Classes</option>
                {classes.map((classNum, index) => (
                  <option key={index} value={classNum}>Class {classNum}</option>
                ))}
              </select>
            </div>
            
            {/* Topic Filter */}
            <div>
              <label htmlFor="topic-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <select
                id="topic-filter"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={!courseFilter && !classFilter}
              >
                <option value="">All Topics</option>
                {topics.map((topic, index) => (
                  <option key={index} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            
            {/* Subtopic Filter */}
            <div>
              <label htmlFor="subtopic-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Subtopic
              </label>
              <select
                id="subtopic-filter"
                value={subtopicFilter}
                onChange={(e) => setSubtopicFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={!topicFilter}
              >
                <option value="">All Subtopics</option>
                {subtopics.map((subtopic, index) => (
                  <option key={index} value={subtopic}>{subtopic}</option>
                ))}
              </select>
            </div>
            
            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Content Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtopic
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    View
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delete
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.coursename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.classnumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.topicname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.subtopicname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.contentname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* Use <a> instead of <Link> to open in new tab */}
                        <a
                          href={`/viewresource/${item._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          onClick={e => handleViewDetails(e, item._id)}
                        >
                          View Details
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteContent(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No content found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPage;