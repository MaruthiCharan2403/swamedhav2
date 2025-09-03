import { useNavigate } from "react-router-dom";

const Forbidden = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h2 className="text-3xl font-bold text-red-600">Access Denied</h2>
            <p className="text-black mt-2">You do not have permission to access this page.</p>
            <div className="mt-6 space-x-4">
                <button
                    onClick={() => navigate(-1)} // Go back to the previous page
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Forbidden;
