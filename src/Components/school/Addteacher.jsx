import axios from "axios";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

export default function AddTeacher() {
  const [teacherFormData, setTeacherFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [showUploadPreview, setShowUploadPreview] = useState(false);

  // Handle form changes for teacher
  const handleTeacherChange = (e) => {
    const { name, value } = e.target;
    setTeacherFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/teacher/add", teacherFormData, {
        headers: {
          Authorization: `${sessionStorage.getItem("token")}`, // Include the auth token
        },
      });
      console.log(response);
      setTeacherFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
      });
      toast.success(response.data.message);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to add teacher");
    }
  };

  // Handle Excel file upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate data format
        const validatedData = jsonData.map((item) => {
          // Convert keys to match our form fields (if necessary)
          return {
            name: item.name || item.Name || "",
            email: item.email || item.Email || "",
            phone: item.phone || item.Phone || "",
          };
        });

        setUploadedData(validatedData);
        setShowUploadPreview(true);
        setIsUploading(false);
        toast.success(
          `Successfully processed ${validatedData.length} records from Excel file`
        );
      } catch (error) {
        console.error("Error processing Excel file:", error);
        setIsUploading(false);
        toast.error("Failed to process Excel file. Please check the format.");
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Error reading file");
    };

    reader.readAsArrayBuffer(file);
  };

  // Submit all teachers from Excel
  const handleBulkSubmit = async () => {
    if (uploadedData.length === 0) {
      toast.warning("No data to submit");
      return;
    }

    setIsUploading(true);
    try {
      const response = await axios.post(
        "/api/teacher/add-bulk",
        { teachers: uploadedData },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("token")}`,
          },
        }
      );

      toast.success(`Successfully added ${uploadedData.length} teachers`);
      setUploadedData([]);
      setShowUploadPreview(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to add teachers in bulk"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel bulk upload
  const handleCancelBulkUpload = () => {
    setUploadedData([]);
    setShowUploadPreview(false);
  };

  // Download sample Excel template
  const downloadTemplate = () => {
    const template = [
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "1234567890",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    XLSX.writeFile(workbook, "teacher_template.xlsx");
  };

  return (
    <div>
      <ToastContainer />
      <section className="p-5 min-h-screen pt-40 bg-gray-50">
        <div className="container shadow-gray-300 p-5 flex flex-col mx-auto max-w-5xl bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200">
          <div className="col-span-full mb-4">
            <p className="font-bold text-center text-3xl text-amber-700">
              Teacher Register Form
            </p>
            <p className="text-xs mt-2 text-center text-gray-600">
              Add teachers individually or by uploading an Excel sheet
            </p>
          </div>

          {/* Excel Upload Section */}
          <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-white bg-opacity-80">
            <p className="text-lg text-amber-700 mb-3">
              Bulk Upload Teachers via Excel
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                />
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="px-4 py-2 rounded-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Download Template
              </button>
            </div>
          </div>

          {/* Preview of Excel Data */}
          {showUploadPreview && (
            <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-white bg-opacity-80">
              <p className="text-lg text-amber-700 mb-3">
                Excel Data Preview ({uploadedData.length} records)
              </p>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-gray-800">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(0, 5).map((teacher, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="p-2">{teacher.name}</td>
                        <td className="p-2">{teacher.email}</td>
                        <td className="p-2">{teacher.phone}</td>
                      </tr>
                    ))}
                    {uploadedData.length > 5 && (
                      <tr>
                        <td colSpan="3" className="p-2 text-center">
                          ... and {uploadedData.length - 5} more records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4 gap-3">
                <button
                  type="button"
                  onClick={handleCancelBulkUpload}
                  className="px-4 py-2 rounded-sm bg-gray-400 text-gray-900 hover:bg-gray-500"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  className="px-4 py-2 rounded-sm bg-amber-600 text-white hover:bg-amber-700"
                  disabled={isUploading}
                >
                  {isUploading
                    ? "Processing..."
                    : `Submit All ${uploadedData.length} Teachers`}
                </button>
              </div>
            </div>
          )}

          {/* Individual Teacher Form */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white bg-opacity-80">
            <p className="text-lg text-amber-700 mb-3">
              Add Individual Teacher
            </p>
            <form
              onSubmit={handleTeacherSubmit}
              className="grid grid-cols-4 gap-2 w-full"
            >
              <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-4">
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="name" className="text-sm text-gray-700">
                    Teacher Name<span className="text-red-600"> *</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={teacherFormData.name}
                    onChange={handleTeacherChange}
                    required
                    placeholder="Enter Teacher Name"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="email" className="text-sm text-gray-700">
                    Email<span className="text-red-600"> *</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={teacherFormData.email}
                    onChange={handleTeacherChange}
                    placeholder="Enter Email"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="phone" className="text-sm text-gray-700">
                    Phone<span className="text-red-600"> *</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={teacherFormData.phone}
                    onChange={handleTeacherChange}
                    placeholder="Enter Phone Number"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="subject" className="text-sm text-gray-700">
                    Subject<span className="text-red-600"> *</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={teacherFormData.subject}
                    onChange={handleTeacherChange}
                    placeholder="Enter Subject"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="justify-center items-center flex col-span-full lg:col-span-4">
                <button
                  type="submit"
                  className="px-7 py-3 m-2 rounded-sm justify-center items-center bg-amber-600 text-white hover:bg-amber-700 transition-transform transform hover:scale-102 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
