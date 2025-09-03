import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PasswordReset() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const urlUsername = searchParams.get("username");
    const email = searchParams.get("email");
    const isReset = token !== null;

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post("/api/user/forgotpassword", { username });
            setMessage(data.message);
        } catch (error) {
            setMessage("Something went wrong. Try again.");
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            toast.error("Passwords do not match!");
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post("/api/user/resetpassword", { 
                email,
                token, 
                password 
            });
            setMessage(data.message);
            toast.success(data.message || "Password reset successful!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            const errMsg = error.response?.data?.message || "Failed to reset password. Try again.";
            setMessage(errMsg);
            toast.error(errMsg);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <ToastContainer />
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <h2 className="text-3xl font-bold mb-6 text-white">{isReset ? "Reset Password" : "Forgot Password"}</h2>

                {message && <p className={`mb-4 ${message.includes("wrong") ? "text-red-400" : "text-green-400" }`}>{message}</p>}

                {!isReset ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className={`w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition ${
                                loading && "opacity-50 cursor-not-allowed"
                            }`}
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className={`w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition ${
                                loading && "opacity-50 cursor-not-allowed"
                            }`}
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}