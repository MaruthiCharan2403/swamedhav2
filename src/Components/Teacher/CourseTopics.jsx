import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Codeeditor from './Codeditor';
import { jwtDecode } from "jwt-decode";
import DoubtsPage from './Doubt';
import FinalSubmissionPage from './Finalsubmission';
import TeacherCodeEditor from './TeacherCodeEditor';

const TeachercourseTopics = () => {
  const [data, setData] = useState(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [selectedContentType, setSelectedContentType] = useState('contentPDF');
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [params] = useSearchParams();
  const levelid = params.get('levelid');
  const termid = params.get('termid');
  const stu = jwtDecode(sessionStorage.getItem('token'));
  const teacherId = stu.teacherId;

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/course/terms/${levelid}/${termid}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
        setExpandedTopics({ 0: true });
        setSelectedContentIndex(0);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
        setError('Failed to load course data. Please try again later.');
        setLoading(false);
      });
  }, [levelid, termid]);

  // Reset content index when changing topics or content types
  useEffect(() => {
    setSelectedContentIndex(0);
  }, [selectedTopicIndex, selectedContentType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-800">{error}</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const toggleTopicExpansion = (index) => {
    setExpandedTopics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Get the currently selected topic
  const selectedTopic = data.topics[selectedTopicIndex];
  
  // Progress percentage
  const progressPercentage = ((selectedTopicIndex + 1) / data.topics.length) * 100;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pt-12">
      {/* Header */}
      <div className="w-full bg-white shadow-md px-6 py-4 fixed top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{data.termName || 'Course Content'}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Progress:</span>
            <div className="w-48 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">{selectedTopicIndex + 1}/{data.topics.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full mt-16">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 bg-white p-6 border-r border-gray-200 lg:min-h-screen lg:sticky lg:top-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{selectedTopic.topicName}</h2>
            <div className="h-1 w-20 bg-blue-500 rounded mb-4"></div>
          </div>
          
          {data.topics.length > 1 && (
            <div className="mt-8">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-3">All Topics</h3>
              <div className="space-y-2 pr-2">
                {data.topics.map((topic, index) => {
                  // Count available content types
                  const hasContentTypes = topic.contents && topic.contents.length > 0 
                    ? {
                        contentPDF: topic.contents.filter(content => content.contentPDF).length,
                        contentVideo: topic.contents.filter(content => content.contentVideo).length,
                        keynotePDF: topic.contents.filter(content => content.keynotePDF).length,
                        project: topic.contents.filter(content => content.project).length
                      } 
                    : { contentPDF: 0, contentVideo: 0, keynotePDF: 0, project: 0 };
                  
                  const availableTypesCount = Object.values(hasContentTypes).filter(count => count > 0).length;
                  const isExpanded = expandedTopics[index] || false;

                  return (
                    <div key={topic._id || index} className="border-b border-gray-100 pb-2">
                      <div 
                        onClick={() => toggleTopicExpansion(index)}
                        className={`w-full text-left p-2 rounded transition duration-200 flex items-center justify-between cursor-pointer ${
                          selectedTopicIndex === index
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
                            selectedTopicIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="truncate">{topic.topicName}</span>
                        </div>
                        {/* Arrow indicator */}
                        <svg 
                          className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {/* Content Type Options - shown when topic is expanded */}
                      {isExpanded && (
                        <div className="ml-8 mt-1 space-y-1">
                          {topic.contents && topic.contents.map((content, contentIndex) => (
                            <div key={content._id || contentIndex} className="flex flex-col space-y-1">
                              {content.contentPDF && (
                                <button
                                  onClick={() => {
                                    setSelectedTopicIndex(index);
                                    setSelectedContentType('contentPDF');
                                    setSelectedContentIndex(contentIndex);
                                  }}
                                  className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                                    selectedTopicIndex === index && selectedContentType === 'contentPDF' && selectedContentIndex === contentIndex
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  Content PDF {contentIndex + 1}
                                </button>
                              )}
                              {content.contentVideo && (
                                <button
                                  onClick={() => {
                                    setSelectedTopicIndex(index);
                                    setSelectedContentType('contentVideo');
                                    setSelectedContentIndex(contentIndex);
                                  }}
                                  className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                                    selectedTopicIndex === index && selectedContentType === 'contentVideo' && selectedContentIndex === contentIndex
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  YouTube Video {contentIndex + 1}
                                </button>
                              )}
                              {content.keynotePDF && content.keynotePDF.trim() !== "" && (
                                <button
                                  onClick={() => {
                                    setSelectedTopicIndex(index);
                                    setSelectedContentType('keynotePDF');
                                    setSelectedContentIndex(contentIndex);
                                  }}
                                  className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                                    selectedTopicIndex === index && selectedContentType === 'keynotePDF' && selectedContentIndex === contentIndex
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                  </svg>
                                  Keynote PDF {contentIndex + 1}
                                </button>
                              )}
                              {content.project && (
                                <button
                                  onClick={() => {
                                    setSelectedTopicIndex(index);
                                    setSelectedContentType('project');
                                    setSelectedContentIndex(contentIndex);
                                  }}
                                  className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                                    selectedTopicIndex === index && selectedContentType === 'project' && selectedContentIndex === contentIndex
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M9 17a4 4 0 01-8 0v-2a4 4 0 018 0v2z" />
                                  </svg>
                                  Project {contentIndex + 1}
                                </button>
                              )}
                            </div>
                          ))}
                          {/* Teacher specific options */}
                          <button
                            onClick={() => {
                              setSelectedTopicIndex(index);
                              setSelectedContentType('codeEditor');
                              setSelectedContentIndex(0);
                            }}
                            className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                              selectedTopicIndex === index && selectedContentType === 'codeEditor'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Code Review
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTopicIndex(index);
                              setSelectedContentType('teacherCodeEditor');
                              setSelectedContentIndex(0);
                            }}
                            className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                              selectedTopicIndex === index && selectedContentType === 'teacherCodeEditor'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Code Editor
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedTopicIndex(index);
                              setSelectedContentType('doubtpage');
                              setSelectedContentIndex(0);
                            }}
                            className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                              selectedTopicIndex === index && selectedContentType === 'doubtpage'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Answer Doubts
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTopicIndex(index);
                              setSelectedContentType('final');
                              setSelectedContentIndex(0);
                            }}
                            className={`w-full text-left p-2 pl-4 rounded-md transition duration-200 flex items-center text-sm ${
                              selectedTopicIndex === index && selectedContentType === 'final'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Final Submission
                          </button>
                          {availableTypesCount === 0 && (
                            <div className="p-2 pl-4 text-sm text-gray-500 italic">
                              No content available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedTopic.contents && selectedTopic.contents.length > 0 ? (
              (() => {
                // Filter contents based on selected content type
                const filteredContents = selectedTopic.contents.filter(content => {
                  switch (selectedContentType) {
                    case 'contentPDF':
                      return content.contentPDF;
                    case 'contentVideo':
                      return content.contentVideo;
                    case 'keynotePDF':
                      return content.keynotePDF;
                    case 'project':
                      return content.project;
                    default:
                      return false;
                  }
                });

                const contentId = selectedTopic.contents.length > 0 ? selectedTopic.contents[0]._id : null;

                // TeacherCodeEditor block
                if (selectedContentType === 'teacherCodeEditor' && contentId) {
                  return (
                    <TeacherCodeEditor
                      key={`code-editor-${selectedTopicIndex}`}
                      topicId={contentId}
                      termId={termid}
                      levelId={levelid}
                    />
                  );
                }

                if (['contentPDF', 'contentVideo', 'keynotePDF', 'project'].includes(selectedContentType)) {
                  if (filteredContents.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center p-12">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-700">No content available</h3>
                        <p className="mt-2 text-gray-500">This content type is not available for this topic.</p>
                      </div>
                    );
                  }
                  const selectedContent = filteredContents[selectedContentIndex] || filteredContents[0];
                  return (
                    <div className="mb-6">
                      <div className="bg-gray-50 p-3 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {selectedContentType === 'contentPDF' && `Content PDF ${selectedContentIndex + 1}`}
                          {selectedContentType === 'contentVideo' && `YouTube Video ${selectedContentIndex + 1}`}
                          {selectedContentType === 'keynotePDF' && `Keynote PDF ${selectedContentIndex + 1}`}
                          {selectedContentType === 'project' && `Project ${selectedContentIndex + 1}`}
                        </h3>
                      </div>
                      {selectedContentType === 'contentPDF' && selectedContent.contentPDF && (
                        <iframe
                          src={selectedContent.contentPDF}
                          title={`Content PDF ${selectedContentIndex + 1}`}
                          className="w-full h-screen border-0"
                        />
                      )}
                      {selectedContentType === 'contentVideo' && selectedContent.contentVideo && (
                        <div className="aspect-w-16 aspect-h-9">
                          <iframe
                            src={selectedContent.contentVideo}
                            title={`YouTube Video ${selectedContentIndex + 1}`}
                            className="w-full h-[550px] border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {selectedContentType === 'keynotePDF' && selectedContent.keynotePDF && (
                        <iframe
                          src={selectedContent.keynotePDF}
                          title={`Keynote PDF ${selectedContentIndex + 1}`}
                          className="w-full h-screen border-0"
                        />
                      )}
                      {selectedContentType === 'project' && selectedContent.project && (
                        <iframe
                          src={selectedContent.project}
                          title={`Project ${selectedContentIndex + 1}`}
                          className="w-full h-screen border-0"
                        />
                      )}
                    </div>
                  );
                }

                // Teacher-specific actions
                if (selectedContentType === 'codeEditor' && contentId) {
                  return (
                    <Codeeditor 
                      key={`editor-${selectedTopicIndex}`}
                      levelId={levelid} termId={termid} topicId={contentId} teacherId={teacherId}
                    />
                  );
                }
                if (selectedContentType === 'doubtpage' && contentId) {
                  return (
                    <DoubtsPage 
                      key={`doubts-${selectedTopicIndex}`}
                      levelId={levelid} termId={termid} topicId={contentId} teacherId={teacherId}
                    />
                  );
                }
                if (selectedContentType === 'final' && contentId) {
                  return (
                    <FinalSubmissionPage 
                      key={`final-${selectedTopicIndex}`}
                      levelId={levelid} termId={termid} topicId={contentId} teacherId={teacherId}
                    />
                  );
                }
                return null;
              })()
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-700">No content available</h3>
                <p className="mt-2 text-gray-500">This topic doesn't have any content yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachercourseTopics;