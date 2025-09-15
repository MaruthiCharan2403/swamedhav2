import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FormPage = () => {
  const [formData, setFormData] = useState({
    coursename: { value: '', useExisting: false },
    classnumber: { value: '', useExisting: false },
    topicname: { value: '', useExisting: false },
    subtopicname: { value: '', useExisting: false },
    contentname: { value: '', useExisting: false },
    content: { value: '', useExisting: false }
  });
  
  const [existingData, setExistingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('api/content/getdata');
        setExistingData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        value
      }
    });
  };

  const handleToggleChange = (field) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        useExisting: !formData[field].useExisting,
        value: !formData[field].useExisting ? '' : formData[field].value
      }
    });
  };

  const getUniqueValues = (field) => {
    const values = new Set();
    existingData.forEach(item => {
      if (item[field]) {
        values.add(item[field]);
      }
    });
    return Array.from(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    try {
      const payload = {
        coursename: formData.coursename.value,
        classnumber: formData.classnumber.value,
        topicname: formData.topicname.value,
        subtopicname: formData.subtopicname.value,
        contentname: formData.contentname.value,
        content: formData.content.value
      };
      
      const response = await axios.post('api/content/postdata', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          coursename: { value: '', useExisting: false },
          classnumber: { value: '', useExisting: false },
          topicname: { value: '', useExisting: false },
          subtopicname: { value: '', useExisting: false },
          contentname: { value: '', useExisting: false },
          content: { value: '', useExisting: false }
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading form data...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-32">
      
      <h1 className="text-2xl font-bold mb-6">Add Course Content</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Course Name:</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="coursename-toggle"
                checked={formData.coursename.useExisting}
                onChange={() => handleToggleChange('coursename')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="coursename-toggle" className="ml-2 block text-sm text-gray-700">
                Use Existing
              </label>
            </div>
            
            {formData.coursename.useExisting ? (
              <select
                value={formData.coursename.value}
                onChange={(e) => handleInputChange('coursename', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                required
              >
                <option value="">Select Course</option>
                {getUniqueValues('coursename').map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.coursename.value}
                onChange={(e) => handleInputChange('coursename', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md border p-2"
                placeholder="Enter new course name"
                required
              />
            )}
          </div>
        </div>

        {/* Class Number Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Class Number:</label>
          <div className="flex items-center space-x-2">
            <select
              value={formData.classnumber.value}
              onChange={(e) => handleInputChange('classnumber', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
              required
            >
              <option value="">Select Class Number</option>
              {[...Array(10).keys()].map((num) => (
                <option key={num} value={num + 1}>{num + 1}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Topic Name:</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="topicname-toggle"
                checked={formData.topicname.useExisting}
                onChange={() => handleToggleChange('topicname')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="topicname-toggle" className="ml-2 block text-sm text-gray-700">
                Use Existing
              </label>
            </div>
            
            {formData.topicname.useExisting ? (
              <select
                value={formData.topicname.value}
                onChange={(e) => handleInputChange('topicname', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                required
              >
                <option value="">Select Topic</option>
                {getUniqueValues('topicname').map((topic, index) => (
                  <option key={index} value={topic}>{topic}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.topicname.value}
                onChange={(e) => handleInputChange('topicname', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md border p-2"
                placeholder="Enter new topic name"
                required
              />
            )}
          </div>
        </div>

        {/* Subtopic Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Subtopic Name:</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subtopicname-toggle"
                checked={formData.subtopicname.useExisting}
                onChange={() => handleToggleChange('subtopicname')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="subtopicname-toggle" className="ml-2 block text-sm text-gray-700">
                Use Existing
              </label>
            </div>
            
            {formData.subtopicname.useExisting ? (
              <select
                value={formData.subtopicname.value}
                onChange={(e) => handleInputChange('subtopicname', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                required
              >
                <option value="">Select Subtopic</option>
                {getUniqueValues('subtopicname').map((subtopic, index) => (
                  <option key={index} value={subtopic}>{subtopic}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.subtopicname.value}
                onChange={(e) => handleInputChange('subtopicname', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md border p-2"
                placeholder="Enter new subtopic name"
                required
              />
            )}
          </div>
        </div>

        {/* Content Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Content Name:</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="contentname-toggle"
                checked={formData.contentname.useExisting}
                onChange={() => handleToggleChange('contentname')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="contentname-toggle" className="ml-2 block text-sm text-gray-700">
                Use Existing
              </label>
            </div>
            
            {formData.contentname.useExisting ? (
              <select
                value={formData.contentname.value}
                onChange={(e) => handleInputChange('contentname', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                required
              >
                <option value="">Select Content Name</option>
                {getUniqueValues('contentname').map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.contentname.value}
                onChange={(e) => handleInputChange('contentname', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md border p-2"
                placeholder="Enter new content name"
                required
              />
            )}
          </div>
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Content:</label>
          <div className="flex items-start space-x-2">
            <div className="flex items-center h-full pt-2">
              
            </div>
              <textarea
                value={formData.content.value}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md border p-2"
                placeholder="Enter new content"
                rows="5"
                required
              />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={submitStatus === 'submitting'}
        >
          {submitStatus === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
        
        {submitStatus === 'success' && (
          <div className="rounded-md bg-green-50 p-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Data saved successfully!</h3>
              </div>
            </div>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error saving data. Please try again.</h3>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormPage;