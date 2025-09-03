import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // eye icons

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  // Remove message state, use toast instead
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("/api/user/profile", {
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await axios.post(
        "/api/user/changepassword",
        {
          username: user.username,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { Authorization: `${sessionStorage.getItem("token")}` },
        }
      );
      toast.success(res.data.message || "Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-8 lg:px-16 bg-gray-50">
      <ToastContainer />
      <div className="w-full max-w-4xl p-8 sm:p-14 bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 flex flex-col md:flex-row gap-12">
        {/* User Details Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">User Profile</h2>
          {user ? (
            <div className="w-full flex flex-col items-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl font-bold text-white">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
              </div>
              {/* Card */}
              <div className="w-full max-w-md bg-white bg-opacity-80 rounded-xl shadow-md p-6 border border-gray-200">
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="space-y-2">
                  {user.role === "school" && user.schoolDetails && (
                    <>
                      <p><span className="font-medium text-gray-700">City:</span> {user.schoolDetails.city}</p>
                      <p><span className="font-medium text-gray-700">State:</span> {user.schoolDetails.state}</p>
                      <p><span className="font-medium text-gray-700">Phone:</span> {user.schoolDetails.phone}</p>
                    </>
                  )}
                  {user.role === "student" && user.studentDetails && (
                    <>
                      <p><span className="font-medium text-gray-700">Roll Number:</span> {user.studentDetails.rollNumber}</p>
                      <p><span className="font-medium text-gray-700">Class:</span> {user.studentDetails.class}</p>
                      <p><span className="font-medium text-gray-700">Father's Name:</span> {user.studentDetails.fathername}</p>
                    </>
                  )}
                  {user.role === "teacher" && user.teacherDetails && (
                    <>
                      <p><span className="font-medium text-gray-700">Mobile:</span> {user.teacherDetails.mobile}</p>
                      <p><span className="font-medium text-gray-700">DOB:</span> {new Date(user.teacherDetails.dob).toLocaleDateString()}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Loader />
          )}
        </div>
        {/* Change Password Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Change Password</h2>
          <form className="w-full mt-4 space-y-5" onSubmit={handleChangePassword}>
            <div>
              <label htmlFor="currentPassword" className="block text-sm text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  placeholder="Current Password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  required
                  disabled={isUpdating}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-amber-500"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isUpdating}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  placeholder="New Password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  required
                  disabled={isUpdating}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-amber-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isUpdating}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className={`w-full py-2 font-semibold text-white rounded-lg shadow-lg transition-transform ${isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-105"}`}
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
