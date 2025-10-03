import axios from 'axios';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

export default function AddStudent() {
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    phone: '',
    Class: '',
    section: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [showUploadPreview, setShowUploadPreview] = useState(false);

  // Handle form changes for student
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/student/add', studentFormData, {
        headers: {
          Authorization: `${sessionStorage.getItem('token')}` // Include the auth token
        }
      });
      setStudentFormData({
        name: '',
        email: '',
        phone: '',
        Class: '',
        section: ''
      });
      toast.success(response.data.message);
    }
    catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setIsSubmitting(false);
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate data format
        const validatedData = jsonData.map(item => {
          // Convert keys to match our form fields (if necessary)
          return {
            name: item.name || item.Name || '',
            email: item.email || item.Email || '',
            phone: item.phone || item.Phone || '',
            Class: item.Class || item.class || '',
            section: item.section || item.Section || ''
          };
        });
        
        setUploadedData(validatedData);
        setShowUploadPreview(true);
        setIsUploading(false);
        toast.success(`Successfully processed ${validatedData.length} records from Excel file`);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setIsUploading(false);
        toast.error('Failed to process Excel file. Please check the format.');
      }
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast.error('Error reading file');
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Submit all students from Excel
  const handleBulkSubmit = async () => {
    if (uploadedData.length === 0) {
      toast.warning('No data to submit');
      return;
    }

    setIsUploading(true);
    try {
      const response = await axios.post('/api/student/add-bulk', { students: uploadedData }, {
        headers: {
          Authorization: `${sessionStorage.getItem('token')}`
        }
      });
      
      toast.success(`Successfully added ${uploadedData.length} students`);
      setUploadedData([]);
      setShowUploadPreview(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add students in bulk');
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
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        Class: '10',
        section: 'A'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'student_template.xlsx');
  };

  return (
    <div>
      <ToastContainer />
      <section className="p-5 min-h-screen pt-40  bg-gray-50">
        <div className="container shadow-gray-300 p-5 flex flex-col mx-auto max-w-5xl bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200">
          <div className="col-span-full mb-4">
            <p className="font-bold text-3xl text-center text-amber-700">Student Register Form</p>
            <p className="text-xs mt-2 text-center text-gray-600">Add students individually or by uploading an Excel sheet</p>
          </div>
          
          {/* Excel Upload Section */}
          <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-white bg-opacity-80">
            <p className="text-lg text-amber-700 mb-3">Bulk Upload Students via Excel</p>
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
                      <th className="p-2 text-left">Class</th>
                      <th className="p-2 text-left">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(0, 5).map((student, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">{student.email}</td>
                        <td className="p-2">{student.phone}</td>
                        <td className="p-2">{student.Class}</td>
                        <td className="p-2">{student.section}</td>
                      </tr>
                    ))}
                    {uploadedData.length > 5 && (
                      <tr>
                        <td colSpan="5" className="p-2 text-center">
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
                  {isUploading ? 'Processing...' : `Submit All ${uploadedData.length} Students`}
                </button>
              </div>
            </div>
          )}
          
          {/* Individual Student Form */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white bg-opacity-80">
            <p className="text-lg text-amber-700 mb-3">Add Individual Student</p>
            <form onSubmit={handleStudentSubmit} className="grid grid-cols-4 gap-2 w-full">
              <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-4">
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="name" className="text-sm text-gray-700">Student Name<span className="text-red-600"> *</span></label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={studentFormData.name}
                    onChange={handleStudentChange}
                    required
                    placeholder="Enter Student Name"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="email" className="text-sm text-white">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={studentFormData.email}
                    onChange={handleStudentChange}
                    placeholder="Enter Email"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="phone" className="text-sm text-gray-700">Phone<span className="text-red-600"> *</span></label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={studentFormData.phone}
                    onChange={handleStudentChange}
                    placeholder="Enter Phone Number"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>

                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="Class" className="text-sm text-gray-700">Class<span className="text-red-600"> *</span></label>
                  <select
                    id="Class"
                    name="Class"
                    required
                    value={studentFormData.Class}
                    onChange={handleStudentChange}
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  >
                    <option value="" disabled>Select Class</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={String(i+1)}>{i+1}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-full sm:col-span-3">
                  <label htmlFor="section" className="text-sm text-gray-700">Section<span className="text-red-600"> *</span></label>
                  <input
                    id="section"
                    name="section"
                    type="text"
                    required
                    value={studentFormData.section}
                    onChange={handleStudentChange}
                    placeholder="Enter Section"
                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  />
                </div>
              </div>
              <div className="justify-center items-center flex col-span-full lg:col-span-4"> 
                <button
                  type="submit"
                  className="px-7 py-3 m-2 rounded-sm justify-center items-center bg-amber-600 text-white hover:bg-amber-700 transition-transform transform hover:scale-102 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}