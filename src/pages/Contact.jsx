import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactUsForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/contactus", formData);
      toast.success(response.data.message || "Feedback submitted successfully");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to submit feedback");
      } else {
        toast.error("Failed to submit feedback");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <ToastContainer />
      <form
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-gray-200"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl mb-4 font-bold text-amber-700">Contact Us</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-1">
            Name<span className="text-red-600"> *</span>
          </label>
          <input
            id="name"
            name="name"
            required
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            placeholder="Your Name"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-1">
            Email<span className="text-red-600"> *</span>
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            placeholder="Your Email"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="subject" className="block text-gray-700 mb-1">
            Subject<span className="text-red-600"> *</span>
          </label>
          <input
            id="subject"
            name="subject"
            required
            type="text"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            placeholder="Subject"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-gray-700 mb-1">
            Message<span className="text-red-600"> *</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            placeholder="Your Message"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg hover:scale-105 transition-transform"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}