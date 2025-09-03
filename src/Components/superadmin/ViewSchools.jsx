import { useState, useEffect, } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';

export default function ViewSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const fetchSchools = async () => {
    try {
      const response = await axios.get('/api/school/allschools', {
        headers: {
          'Authorization': sessionStorage.getItem('token')
        }
      });
      setSchools(response.data);
      extractLocationData(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Extract unique states and districts from school data
  const extractLocationData = (schoolsData) => {
    const uniqueStates = [...new Set(schoolsData.map(school => school.state))].filter(Boolean).sort();
    const uniqueDistricts = [...new Set(schoolsData.map(school => school.district))].filter(Boolean).sort();
    
    setStates(uniqueStates);
    setDistricts(uniqueDistricts);
  };

  // Update districts when state changes
  useEffect(() => {
    if (selectedState) {
      const filteredDistricts = [...new Set(schools.filter(school => school.state === selectedState).map(school => school.district))].filter(Boolean).sort();
      setDistricts(filteredDistricts);
      setSelectedDistrict(''); // Reset district when state changes
    } else {
      extractLocationData(schools);
    }
  }, [selectedState, schools]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.udiseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !selectedState || school.state === selectedState;
    const matchesDistrict = !selectedDistrict || school.district === selectedDistrict;
    
    return matchesSearch && matchesState && matchesDistrict;
  });

  const openModal = (school) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchool(null);
  };

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto pt-36 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
            <p className="text-gray-600 mt-1">Manage all registered schools</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Main search and filter row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search schools by name, UDISE code, or location..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* State and District filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex-grow"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex-grow disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Schools Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <div key={school._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{school.name}</h2>
                    <div className="relative">
                      <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">UDISE: {school.udiseCode}</p>

                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-gray-700">{school.city}, {school.state}</span>
                  </div>

                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-gray-700">{school.district}</span>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-700">{school.email}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mt-6">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-lg">{school.students?.length || 0}</span>
                      <span>Students</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-lg">{school.teachers?.length || 0}</span>
                      <span>Teachers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-lg">{school.enabledCourses?.length || 0}</span>
                      <span>Courses</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between">
                  <button
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors duration-200"
                    onClick={() => openModal(school)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View</span>
                  </button>
                  {/* <button className="text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSchools.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No schools found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">{selectedSchool.name}</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-4 text-gray-900">School Information</h4>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">UDISE Code:</span>
                      <span>{selectedSchool.udiseCode}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">Address:</span>
                      <span>{selectedSchool.address}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">City:</span>
                      <span>{selectedSchool.city}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">District:</span>
                      <span>{selectedSchool.district}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">State:</span>
                      <span>{selectedSchool.state}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">Pincode:</span>
                      <span>{selectedSchool.pincode}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">Phone:</span>
                      <span>{selectedSchool.phone}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-32 text-gray-600">Email:</span>
                      <span>{selectedSchool.email}</span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-4 text-gray-900">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-gray-500 text-sm">Total Students</div>
                      <div className="text-2xl font-bold text-blue-600">{selectedSchool.students?.length || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-gray-500 text-sm">Total Teachers</div>
                      <div className="text-2xl font-bold text-green-600">{selectedSchool.teachers?.length || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-gray-500 text-sm">Courses</div>
                      <div className="text-2xl font-bold text-purple-600">{selectedSchool.enabledCourses?.length || 0}</div>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Courses */}
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-4 text-gray-900">Enabled Courses</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Level Name</th>
                        <th className="py-2 px-4 border-b text-left">Student Count</th>
                        <th className="py-2 px-4 border-b text-left">Enabled Terms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSchool.enabledCourses?.map((course, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{course.levelName}</td>
                          <td className="py-2 px-4 border-b">{course.studentcount}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex flex-wrap gap-2">
                              {course.enabledTerms?.map((term, idx) => (
                                term.isEnabled && (
                                  <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                    {term.termName}
                                  </span>
                                )
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mr-2 transition-colors duration-200"
              >
                Close
              </button>
              <Link to={`/school/students?schoolId=${selectedSchool._id}`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  View Students
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}