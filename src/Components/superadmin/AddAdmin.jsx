import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Adminregister() {
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", phone: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/user/register", formData);
            toast.success("User registered successfully");
            setFormData({ name: "", email: "", password: "", phone: ""});
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to register user");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen 
            sm:mt-8 md:mt-8 lg:mt-8 xl:mt-8 2xl:mt-8
        ">
            <ToastContainer />
            <div className="flex flex-col max-w-md w-full m-5 rounded-md p-6 bg-gray-50 text-gray-800 border-2 border-blue-950">
                <h1 className="mb-4 text-2xl font-bold text-center">Register User</h1>
                <p className="text-center">All the fields are mandatory</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {Object.keys(formData).map((key) => (
                        <div key={key}>
                            <label className="block mb-1 text-sm capitalize" htmlFor={key}>{key} <span className="text-red-500"> *</span></label>
                            <input
                                type={key === "password" ? "password" : "text"}
                                name={key}
                                id={key}
                                value={formData[key]}
                                onChange={handleChange}
                                placeholder={`Enter ${key}`}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>
                    ))}
                    <button type="submit" className="w-full px-4 py-2 font-semibold bg-amber-600 text-white rounded-md hover:bg-amber-700 cursor-pointer">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}