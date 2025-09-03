import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/api/superadmin/getfeedback", {
          headers: {
            Authorization: token, 
          },
        });
        setFeedbacks(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("Unauthorized: You do not have permission to view feedback.");
        } else if (error.response && error.response.status === 404) {
          toast.info("No feedback found.");
        } else {
          toast.error("Error fetching feedback.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-amber-700 mb-4">User Feedback</h1>
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center text-gray-600">No feedback found.</div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-800">{fb.name}</div>
                  <div className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Email:</span> {fb.email}
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Subject:</span> {fb.subject}
                </div>
                <div className="text-gray-800">{fb.feedback}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}