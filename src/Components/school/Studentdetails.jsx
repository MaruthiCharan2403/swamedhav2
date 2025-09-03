"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  FaUser,
  FaBook,
  FaCode,
  FaQuestionCircle,
  FaFileUpload,
  FaChevronDown,
  FaChevronRight,
  FaExternalLinkAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa"
import { useSearchParams } from "react-router-dom"

const StudentDetailsPage = () => {
  const [studentDetails, setStudentDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("info")
  const [expandedLevels, setExpandedLevels] = useState({})
  const [expandedTerms, setExpandedTerms] = useState({})
  const [expandedTopics, setExpandedTopics] = useState({})
  const [params] = useSearchParams()
  const studentId = params.get("studentId")

  // Fetch student details on component mount
  useEffect(() => {
    fetchStudentDetails()
  }, [studentId])

  // Fetch student details from the backend
  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/student/${studentId}/details`)
      setStudentDetails(response.data.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch student details")
      setLoading(false)
    }
  }

  // Toggle expanded state for levels
  const toggleLevel = (levelId) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }))
  }

  // Toggle expanded state for terms
  const toggleTerm = (termId) => {
    setExpandedTerms((prev) => ({
      ...prev,
      [termId]: !prev[termId],
    }))
  }

  // Toggle expanded state for topics
  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }))
  }

  // Find progress item for a specific course, term, and topic
  const findProgressItem = (courseId, termId, topicId) => {
    if (!studentDetails || !studentDetails.progress) return null

    // First try exact match
    const exactMatch = studentDetails.progress.find(
      (item) => item.courseId === courseId && item.termId === termId && item.topicId === topicId,
    )

    if (exactMatch) return exactMatch

    // If no exact match, try matching just course and term (since topic IDs might be inconsistent)
    return studentDetails.progress.find(
      (item) => item.courseId === courseId && item.termId === termId,
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex pt-32">
      <ToastContainer />
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 fixed h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Student Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveSection("info")}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${activeSection === "info" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-purple-50"
                  } transition duration-300`}
              >
                <FaUser />
                <span>Information</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("courses")}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${activeSection === "courses" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-purple-50"
                  } transition duration-300`}
              >
                <FaBook />
                <span>Courses</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("codes")}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${activeSection === "codes" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-purple-50"
                  } transition duration-300`}
              >
                <FaCode />
                <span>Codes</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("doubts")}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${activeSection === "doubts" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-purple-50"
                  } transition duration-300`}
              >
                <FaQuestionCircle />
                <span>Doubts</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("submissions")}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg ${activeSection === "submissions" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-purple-50"
                  } transition duration-300`}
              >
                <FaFileUpload />
                <span>Submissions</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto ml-64">
        {loading ? (
          <div className="text-center text-gray-600">Loading student details...</div>
        ) : studentDetails ? (
          <>
            {/* Student Information */}
            {activeSection === "info" && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <FaUser />
                  <span>Student Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      <span className="font-semibold">Name:</span> {studentDetails.studentInfo.name}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Email:</span> {studentDetails.studentInfo.email}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Phone:</span> {studentDetails.studentInfo.phone}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      <span className="font-semibold">Class:</span> {studentDetails.studentInfo.class}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">School:</span>{" "}
                      {studentDetails.studentInfo.school && studentDetails.studentInfo.school.name}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Assigned Teacher:</span>{" "}
                      {studentDetails.assignedTeacher ? studentDetails.assignedTeacher.name : "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enrolled Courses */}
            {activeSection === "courses" && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <FaBook />
                  <span>Enrolled Courses</span>
                </h2>
                {studentDetails.enrolledCourses.length === 0 ? (
                  <p className="text-gray-600">No courses enrolled.</p>
                ) : (
                  studentDetails.enrolledCourses.map((course, index) => (
                    <div key={index} className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{course.levelName}</h3>
                      {course.assignedTerms.map((term, termIndex) => (
                        <div key={termIndex} className="ml-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">{term.termName}</h4>
                          {term.topics &&
                            term.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="ml-4">
                                <h5 className="text-md font-semibold text-gray-800 mb-2">{topic.topicName}</h5>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Codes Submitted */}
            {activeSection === "codes" && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <FaCode />
                  <span>Codes Submitted</span>
                </h2>
                {studentDetails.enrolledCourses.length === 0 ? (
                  <p className="text-gray-600">No codes submitted.</p>
                ) : (
                  studentDetails.enrolledCourses.map((course, index) => (
                    <div key={index} className="mb-6">
                      <div
                        className="flex items-center justify-between cursor-pointer p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => toggleLevel(course.courseId)}
                      >
                        <h3 className="text-xl font-semibold text-gray-800">{course.levelName}</h3>
                        <span>{expandedLevels[course.courseId] ? <FaChevronDown /> : <FaChevronRight />}</span>
                      </div>
                      {expandedLevels[course.courseId] && (
                        <div className="ml-4 mt-2">
                          {course.assignedTerms.map((term, termIndex) => (
                            <div key={termIndex} className="mb-4">
                              <div
                                className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => toggleTerm(term.termId)}
                              >
                                <h4 className="text-lg font-semibold text-gray-800">{term.termName}</h4>
                                <span>{expandedTerms[term.termId] ? <FaChevronDown /> : <FaChevronRight />}</span>
                              </div>
                              {expandedTerms[term.termId] && (
                                <div className="ml-4 mt-2">
                                  {term.topics.map((topic, topicIndex) => (
                                    <div key={topicIndex} className="mb-4">
                                      <div
                                        className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        onClick={() => toggleTopic(topic.topicId)}
                                      >
                                        <h5 className="text-md font-semibold text-gray-800">{topic.topicName}</h5>
                                        <span>
                                          {expandedTopics[topic.topicId] ? <FaChevronDown /> : <FaChevronRight />}
                                        </span>
                                      </div>
                                      {expandedTopics[topic.topicId] && (
                                        <div className="ml-4 mt-2">
                                          {(() => {
                                            const progressItem = findProgressItem(
                                              course.courseId,
                                              term.termId,
                                              topic.topicId,
                                            )

                                            if (!progressItem) {
                                              return (
                                                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
                                                  No progress data available for this topic.
                                                </div>
                                              )
                                            }
                                            if (!progressItem.submittedCodes || progressItem.submittedCodes.length === 0) {
                                              return (
                                                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
                                                  No code submissions for this topic.
                                                </div>
                                              )
                                            }

                                            return progressItem.submittedCodes.map((code, codeIndex) => (
                                              <div
                                                key={codeIndex}
                                                className="bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm"
                                              >
                                                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                                                  <div className="font-semibold text-gray-800">
                                                    Submission {codeIndex + 1}
                                                  </div>
                                                  <div className="flex items-center text-sm text-gray-500">
                                                    <FaClock className="mr-1" />
                                                    {new Date(code.dateSubmitted).toLocaleString()}
                                                  </div>
                                                </div>
                                                <div className="p-3">
                                                  <div className="bg-gray-50 p-3 rounded border overflow-auto max-h-60">
                                                    <pre className="whitespace-pre-wrap font-mono text-sm">
                                                      {code.code}
                                                    </pre>
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  ))}
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
            )}

            {/* Doubts Posted */}
            {activeSection === "doubts" && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <FaQuestionCircle />
                  <span>Doubts Posted</span>
                </h2>
                {studentDetails.enrolledCourses.length === 0 ? (
                  <p className="text-gray-600">No doubts posted.</p>
                ) : (
                  studentDetails.enrolledCourses.map((course, index) => (
                    <div key={index} className="mb-6">
                      <div
                        className="flex items-center justify-between cursor-pointer p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => toggleLevel(course.courseId)}
                      >
                        <h3 className="text-xl font-semibold text-gray-800">{course.levelName}</h3>
                        <span>{expandedLevels[course.courseId] ? <FaChevronDown /> : <FaChevronRight />}</span>
                      </div>
                      {expandedLevels[course.courseId] && (
                        <div className="ml-4 mt-2">
                          {course.assignedTerms.map((term, termIndex) => (
                            <div key={termIndex} className="mb-4">
                              <div
                                className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => toggleTerm(term.termId)}
                              >
                                <h4 className="text-lg font-semibold text-gray-800">{term.termName}</h4>
                                <span>{expandedTerms[term.termId] ? <FaChevronDown /> : <FaChevronRight />}</span>
                              </div>
                              {expandedTerms[term.termId] && (
                                <div className="ml-4 mt-2">
                                  {term.topics.map((topic, topicIndex) => (
                                    <div key={topicIndex} className="mb-4">
                                      <div
                                        className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        onClick={() => toggleTopic(topic.topicId)}
                                      >
                                        <h5 className="text-md font-semibold text-gray-800">{topic.topicName}</h5>
                                        <span>
                                          {expandedTopics[topic.topicId] ? <FaChevronDown /> : <FaChevronRight />}
                                        </span>
                                      </div>
                                      {expandedTopics[topic.topicId] && (
                                        <div className="ml-4 mt-2">
                                          {(() => {
                                            const progressItem = findProgressItem(
                                              course.courseId,
                                              term.termId,
                                              topic.topicId,
                                            )

                                            if (
                                              !progressItem ||
                                              !progressItem.doubts ||
                                              progressItem.doubts.length === 0
                                            ) {
                                              return (
                                                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
                                                  No doubts posted for this topic.
                                                </div>
                                              )
                                            }

                                            return progressItem.doubts.map((doubt, doubtIndex) => (
                                              <div
                                                key={doubtIndex}
                                                className="bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm"
                                              >
                                                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                                                  <div className="flex items-center">
                                                    <FaQuestionCircle className="text-blue-500 mr-2" />
                                                    <span className="font-semibold text-gray-800">Question</span>
                                                  </div>
                                                  <span
                                                    className={`px-2 py-1 text-xs rounded-full ${doubt.status === "answered"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                      }`}
                                                  >
                                                    {doubt.status === "answered" ? "Answered" : "Pending"}
                                                  </span>
                                                </div>
                                                <div className="p-4">
                                                  <p className="text-gray-800 mb-4">{doubt.question}</p>

                                                  {doubt.answer ? (
                                                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                                      <div className="flex items-center mb-2">
                                                        <span className="font-semibold text-blue-800">Answer:</span>
                                                      </div>
                                                      <p className="text-gray-800">{doubt.answer}</p>
                                                    </div>
                                                  ) : (
                                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-gray-500 italic">
                                                      Waiting for teacher's response...
                                                    </div>
                                                  )}

                                                  <div className="mt-3 text-xs text-gray-500 flex justify-between">
                                                    <span>Posted: {new Date(doubt.datePosted).toLocaleString()}</span>
                                                    {doubt.dateAnswered && (
                                                      <span>
                                                        Answered: {new Date(doubt.dateAnswered).toLocaleString()}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  ))}
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
            )}

            {/* Final Submissions */}
            {activeSection === "submissions" && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <FaFileUpload />
                  <span>Final Submissions</span>
                </h2>
                {studentDetails.enrolledCourses.length === 0 ? (
                  <p className="text-gray-600">No final submissions.</p>
                ) : (
                  studentDetails.enrolledCourses.map((course, index) => (
                    <div key={index} className="mb-6">
                      <div
                        className="flex items-center justify-between cursor-pointer p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => toggleLevel(course.courseId)}
                      >
                        <h3 className="text-xl font-semibold text-gray-800">{course.levelName}</h3>
                        <span>{expandedLevels[course.courseId] ? <FaChevronDown /> : <FaChevronRight />}</span>
                      </div>
                      {expandedLevels[course.courseId] && (
                        <div className="ml-4 mt-2">
                          {course.assignedTerms.map((term, termIndex) => (
                            <div key={termIndex} className="mb-4">
                              <div
                                className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => toggleTerm(term.termId)}
                              >
                                <h4 className="text-lg font-semibold text-gray-800">{term.termName}</h4>
                                <span>{expandedTerms[term.termId] ? <FaChevronDown /> : <FaChevronRight />}</span>
                              </div>
                              {expandedTerms[term.termId] && (
                                <div className="ml-4 mt-2">
                                  {term.topics.map((topic, topicIndex) => (
                                    <div key={topicIndex} className="mb-4">
                                      <div
                                        className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        onClick={() => toggleTopic(topic.topicId)}
                                      >
                                        <h5 className="text-md font-semibold text-gray-800">{topic.topicName}</h5>
                                        <span>
                                          {expandedTopics[topic.topicId] ? <FaChevronDown /> : <FaChevronRight />}
                                        </span>
                                      </div>
                                      {expandedTopics[topic.topicId] && (
                                        <div className="ml-4 mt-2">
                                          {(() => {
                                            const progressItem = findProgressItem(
                                              course.courseId,
                                              term.termId,
                                              topic.topicId,
                                            )

                                            if (!progressItem) {
                                              return (
                                                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
                                                  No submission data for this topic.
                                                </div>
                                              )
                                            }

                                            return (
                                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                <div className="p-4">
                                                  <div className="flex items-center mb-4">
                                                    {progressItem.completed ? (
                                                      <div className="flex items-center text-green-600">
                                                        <FaCheckCircle className="mr-2" />
                                                        <span className="font-semibold">Completed</span>
                                                      </div>
                                                    ) : (
                                                      <div className="flex items-center text-yellow-600">
                                                        <FaTimesCircle className="mr-2" />
                                                        <span className="font-semibold">In Progress</span>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {progressItem.finalSubmission ? (
                                                    <a
                                                      href={progressItem.finalSubmission}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 w-full"
                                                    >
                                                      <FaFileUpload className="mr-2" />
                                                      <span>View Final Submission</span>
                                                      <FaExternalLinkAlt className="ml-auto text-sm" />
                                                    </a>
                                                  ) : (
                                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-gray-500 italic">
                                                      No final submission available.
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  ))}
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
            )}
          </>
        ) : (
          <div className="text-center text-gray-600">No student details found.</div>
        )}
      </div>
    </div>
  )
}

export default StudentDetailsPage