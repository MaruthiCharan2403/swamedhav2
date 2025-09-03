import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import { toast, ToastContainer } from "react-toastify";

const ViewTrainer = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showSchoolsModal, setShowSchoolsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/superadmin/viewtrainer", {
        headers: { Authorization: `${sessionStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching trainers");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply search filter whenever searchTerm changes
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  const viewSchools = (trainer) => {
    setSelectedTrainer(trainer);
    setShowSchoolsModal(true);
  };

  return (
    <div className="p-6 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <div className=" mt-20 pt-20">
          <h1 className="text-3xl font-bold text-center mb-6">Trainer List</h1>

          {/* Search and Rows per page */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name or email..."
              className="px-4 py-2 rounded border-2 flex-grow max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Rows per page */}
            <select
              className="px-4 py-2 rounded border-2"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={75}>75</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-700 bg-blue-100">
              <thead className="border-b bg-blue-400 border-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.phone || "N/A"}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => viewSchools(user)}
                          className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                        >
                          View Schools
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center">
                      No trainers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-amber-500 px-4 py-2 rounded cursor-pointer disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.ceil(filteredUsers.length / rowsPerPage)}
            </span>
            <button
              className="bg-amber-500 px-4 py-2 rounded cursor-pointer disabled:opacity-50"
              disabled={currentPage === Math.ceil(filteredUsers.length / rowsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>

          {/* Schools Modal */}
          {showSchoolsModal && selectedTrainer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Schools Assigned to {selectedTrainer.name}
                  </h2>
                  <button
                    onClick={() => setShowSchoolsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                {selectedTrainer.trainerId?.schoolIds && selectedTrainer.trainerId.schoolIds.length > 0 ? (
                  <table className="w-full border">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2">School Name</th>
                        <th className="px-4 py-2">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTrainer.trainerId.schoolIds.map((school) => (
                        <tr key={school._id} className="border-b">
                          <td className="px-4 py-2">{school.name || "N/A"}</td>
                          <td className="px-4 py-2">
                            {school.address || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No schools assigned to this trainer.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewTrainer;