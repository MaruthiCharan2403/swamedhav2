import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      const role = JSON.parse(atob(sessionStorage.getItem("token").split(".")[1])).role;
      dispatch(
        login({ username: sessionStorage.getItem("username"), role: role })
      );
      navigate(`/${role}dashboard`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      setLoading(true);
      try {
        const response = await axios.post(
          "/api/user/login",
          { username, password }
        );
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("username", username);

        const role = JSON.parse(atob(response.data.token.split(".")[1])).role;
        const jwtDecoded = jwtDecode(response.data.token);
        sessionStorage.setItem("name", jwtDecoded.name);
        sessionStorage.setItem("userEmail", jwtDecoded.email);
        sessionStorage.setItem("role", role);
        dispatch(login({ username: username, role: role, name: jwtDecoded.name }));

        navigate(role === 'studentb2c' ? `/dashboard` : `/${role}dashboard`);
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please fill in all the fields");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <ToastContainer />
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-10 bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-amber-500"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            <Link to="/resetpassword" className="text-xs text-amber-600 hover:text-amber-800 mt-1 inline-block">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold text-white rounded-lg shadow-lg transition-transform ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-105"
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
