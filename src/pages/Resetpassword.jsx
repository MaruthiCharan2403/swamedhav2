import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PasswordReset() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const isReset = token !== null; // Check if we're resetting the password

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post("/api/user/forgotpassword", { email });
            setMessage(data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong. Try again.");
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
        const email = searchParams.get("email");
        setLoading(true);
        try {
            const { data } = await axios.post("/api/user/resetpassword", { email, token, password });
            setMessage(data.message);
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to reset password. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <h2 className="text-3xl font-bold mb-6 text-white">{isReset ? "Reset Password" : "Forgot Password"}</h2>

                {message && <p className="mb-4 text-green-400">{message}</p>}

                {!isReset ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
