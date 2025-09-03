import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader"; // Assuming you have a Loader component
import { toast, ToastContainer } from "react-toastify"; // Assuming you have toast notifications set up

const Viewadmin = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch admin users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin", {
        headers: { Authorization: `${sessionStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = users;
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [roleFilter, users]);

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Unique roles for filter dropdown
  const uniqueRoles = [...new Set(users.map((user) => user.role))];

  return (
    <div className="min-h-screen pt-32">
      <ToastContainer />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Users</h1>
          <button
            onClick={fetchUsers}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0114 0V3a1 1 0 112 0v2.101a9.002 9.002 0 01-14 0V3a1 1 0 011-1zm1 11a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1-6a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-6 backdrop-filter backdrop-blur-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, index) => (
                    <tr key={`loading-${index}`} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    </tr>
                  ))
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <p>No users found. Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{user.phone || "N/A"}</div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {user.status}
                        </span>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Viewadmin;