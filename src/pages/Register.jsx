import axios from 'axios';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import indianStatesData from './indianStatesData'; // Ensure this file is created with Indian states, districts, and cities data

export default function Registration() {
  const [schoolFormData, setSchoolFormData] = useState({
    name: '',
    udiseCode: '',
    city: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
  });

  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(false); // 🔥 loading state

  // Handle state change to update districts
  const handleStateChange = (e) => {
    const { name, value } = e.target;
    setSchoolFormData(prev => ({
      ...prev,
      [name]: value,
      district: '', // Reset district when state changes
      city: ''      // Reset city when state changes
    }));

    // Find districts for the selected state
    const selectedState = indianStatesData.find(state => state.name === value);
    if (selectedState) {
      setFilteredDistricts(selectedState.districts);
      setFilteredCities([]);
    } else {
      setFilteredDistricts([]);
      setFilteredCities([]);
    }
  };

  // Handle district change to update cities
  const handleDistrictChange = (e) => {
    const { name, value } = e.target;
    setSchoolFormData(prev => ({
      ...prev,
      [name]: value,
      city: '' // Reset city when district changes
    }));

    // Find cities for the selected district
    const selectedState = indianStatesData.find(state => state.name === schoolFormData.state);
    if (selectedState) {
      const selectedDistrict = selectedState.districts.find(district => district.name === value);
      if (selectedDistrict) {
        setFilteredCities(selectedDistrict.cities);
      } else {
        setFilteredCities([]);
      }
    }
  };

  // Handle all other form changes for school
  const handleSchoolChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !/^[A-Za-z\s]*$/.test(value)) {
      return;
    }
    setSchoolFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading
    try {
      const response = await axios.post('/api/school/register', schoolFormData);
      console.log(response);
      setSchoolFormData({
        name: '',
        udiseCode: '',
        city: '',
        address: '',
        district: '',
        state: '',
        pincode: '',
        phone: '',
        email: ''
      });
      setFilteredDistricts([]);
      setFilteredCities([]);
      toast.success(response.data.message);
    }
    catch (err) {
      console.log(err);
      toast.error(err.response?.data?.error || "Registration failed");
    }
    finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div>
      <ToastContainer />
      <section className="p-5 min-h-screen pt-24 bg-gray-50">
        <div className="container shadow-gray-300 p-5 flex flex-col mx-auto max-w-5xl bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200">
          <div className="col-span-full">
            <p className="font-bold text-3xl text-amber-700">School Registration Form</p>
            <p className="text-xs mt-2 text-gray-600">All the fields are Mandatory</p>
          </div>
          <form onSubmit={handleSchoolSubmit} className="grid grid-cols-4 gap-2 p-4 w-full">
            <div className="grid grid-cols-6 gap-4 col-span-full lg:col-span-4">
              <div className="col-span-full sm:col-span-3">
                <label htmlFor="name" className="text-sm text-gray-700">School Name<span className="text-red-600"> *</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={schoolFormData.name}
                  onChange={handleSchoolChange}
                  required
                  disabled={loading}
                  placeholder="Enter School Name"
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>

              <div className="col-span-full sm:col-span-3">
                <label htmlFor="udiseCode" className="text-sm text-gray-700">UDISE Code<span className="text-red-600"> *</span></label>
                <input
                  id="udiseCode"
                  name="udiseCode"
                  type="text"
                  required
                  value={schoolFormData.udiseCode}
                  onChange={handleSchoolChange}
                  disabled={loading}
                  placeholder="Enter UDISE Code"
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>

              <div className="col-span-full sm:col-span-2">
                <label htmlFor="state" className="text-sm text-gray-700">State<span className="text-red-600"> *</span></label>
                <select
                  id="state"
                  name="state"
                  required
                  value={schoolFormData.state}
                  onChange={handleStateChange}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                >
                  <option value="">Select State</option>
                  {indianStatesData.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-full sm:col-span-2">
                <label htmlFor="district" className="text-sm text-gray-700">District<span className="text-red-600"> *</span></label>
                <select
                  id="district"
                  name="district"
                  required
                  value={schoolFormData.district}
                  onChange={handleDistrictChange}
                  disabled={!schoolFormData.state || loading}
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                >
                  <option value="">Select District</option>
                  {filteredDistricts.map((district) => (
                    <option key={district.name} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-full sm:col-span-2">
                <label htmlFor="city" className="text-sm text-gray-700">City<span className="text-red-600"> *</span></label>
                <input
                  id="city"
                  name="city"
                  required
                  value={schoolFormData.city}
                  onChange={handleSchoolChange}
                  disabled={!schoolFormData.district || loading}
                  placeholder="Enter City Name"
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>

              <div className="col-span-full">
                <label htmlFor="address" className="text-sm text-gray-700">Address<span className="text-red-600"> *</span></label>
                <textarea
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={schoolFormData.address}
                  onChange={handleSchoolChange}
                  disabled={loading}
                  placeholder="Enter Address"
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>

              <div className="col-span-full sm:col-span-2">
                <label htmlFor="pincode" className="text-sm text-gray-700">Pincode<span className="text-red-600"> *</span></label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  value={schoolFormData.pincode}
                  onChange={handleSchoolChange}
                  disabled={loading}
                  placeholder='Enter Pincode'
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>

              <div className="col-span-full sm:col-span-2">
                <label htmlFor="phone" className="text-sm text-gray-700">Phone<span className="text-red-600"> *</span></label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={schoolFormData.phone}
                  onChange={handleSchoolChange}
                  disabled={loading}
                  placeholder='Enter Phone Number'
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>

              <div className="col-span-full sm:col-span-2">
                <label htmlFor="email" className="text-sm text-gray-700">Email<span className="text-red-600"> *</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={schoolFormData.email}
                  onChange={handleSchoolChange}
                  disabled={loading}
                  placeholder='Enter Email'
                  className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 m-2 justify-center items-center text-white rounded transition-transform transform cursor-pointer ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 hover:scale-102"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
