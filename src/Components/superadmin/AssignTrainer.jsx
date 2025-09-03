import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../Loader";

const AssignTrainer = () => {
    // Main data states
    const [data, setData] = useState({ trainers: [], schools: [] });
    const [loading, setLoading] = useState(false);

    // Trainer selection and pagination
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [trainerPage, setTrainerPage] = useState(1);
    const [trainerRowsPerPage, setTrainerRowsPerPage] = useState(10);
    const [trainerSearchTerm, setTrainerSearchTerm] = useState("");

    // School selection and pagination
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [schoolPage, setSchoolPage] = useState(1);
    const [schoolRowsPerPage, setSchoolRowsPerPage] = useState(10);
    const [schoolSearchTerm, setSchoolSearchTerm] = useState("");

    // Fetch trainers and schools
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/superadmin/trainers-and-schools", {
                headers: { Authorization: `${sessionStorage.getItem("token")}` },
            });
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
            setLoading(false);
        }
    };

    // Update trainer's schools
    const updateTrainerSchools = async () => {
        if (!selectedTrainer) return;

        console.log('Updating trainer schools:', selectedTrainer.name);
        console.log('Selected schools:', selectedSchools);
        
        // Get the removed schools for better feedback
        const currentSchoolIds = selectedTrainer.trainerId.schoolIds.map(school => 
            typeof school === 'object' ? school._id : school
        );
        const removedSchools = currentSchoolIds.filter(id => !selectedSchools.includes(id));
        
        // If schools are being removed, ask for confirmation
        if (removedSchools.length > 0) {
            const confirmed = window.confirm(
                `You are about to remove ${removedSchools.length} school(s) from this trainer's assignments. Do you want to continue?`
            );
            if (!confirmed) {
                return;
            }
        }
        
        setLoading(true);
        try {
            await axios.put(
                `/api/superadmin/assigntrainer`,
                {
                    trainerId: selectedTrainer.trainerId._id,
                    schoolIds: selectedSchools
                },
                { headers: { Authorization: `${sessionStorage.getItem("token")}` } }
            );
            
            if (removedSchools.length > 0) {
                toast.success(`Schools updated successfully. ${removedSchools.length} school(s) were unassigned.`);
            } else {
                toast.success("Schools assigned successfully");
            }
            
            fetchData(); // Refresh data
            setSelectedTrainer(null); // Close the assignment panel
        } catch (error) {
            console.error("Error assigning schools:", error);
            toast.error("Failed to assign schools");
            setLoading(false);
        }
    };

    // Handle school selection
    const handleSchoolSelect = (schoolId) => {
        setSelectedSchools(prev =>
            prev.includes(schoolId)
                ? prev.filter(id => id !== schoolId)
                : [...prev, schoolId]
        );
    };

    // Initialize selected schools when trainer is selected
    useEffect(() => {
        if (selectedTrainer && selectedTrainer.trainerId && selectedTrainer.trainerId.schoolIds) {
            console.log('Trainer selected:', selectedTrainer.name);
            console.log('School IDs:', selectedTrainer.trainerId.schoolIds);
            
            // Extract school IDs from the trainer's assigned schools
            const assignedSchoolIds = selectedTrainer.trainerId.schoolIds.map(school => 
                typeof school === 'object' ? school._id : school
            );
            console.log('Assigned school IDs:', assignedSchoolIds);
            
            setSelectedSchools(assignedSchoolIds);
            setSchoolPage(1); // Reset to first page when selecting new trainer
        }
    }, [selectedTrainer]);

    // Filter and paginate trainers
    const filteredTrainers = data.trainers.filter(trainer =>
        trainer.name.toLowerCase().includes(trainerSearchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(trainerSearchTerm.toLowerCase())
    );

    const trainerIndexLast = trainerPage * trainerRowsPerPage;
    const trainerIndexFirst = trainerIndexLast - trainerRowsPerPage;
    const currentTrainers = filteredTrainers.slice(trainerIndexFirst, trainerIndexLast);

    // Filter and paginate schools
    const filteredSchools = data.schools.filter(school => {

        const match = school.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
            school.address.toLowerCase().includes(schoolSearchTerm.toLowerCase())

        return match
    }
    );

    const schoolIndexLast = schoolPage * schoolRowsPerPage;
    const schoolIndexFirst = schoolIndexLast - schoolRowsPerPage;
    const currentSchools = filteredSchools.slice(schoolIndexFirst, schoolIndexLast);

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 min-h-screen sm:mt-24 md:mt-20 lg:mt-32 xl:mt-24 2xl:mt-24">
            <ToastContainer />
            {loading ? (
                <Loader />
            ) : (
                <div>
                    <h1 className="text-3xl font-bold text-center mb-6">Assign Schools to Trainers</h1>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Trainers List */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Trainers</h2>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search trainers..."
                                        className="px-3 py-1 border rounded"
                                        value={trainerSearchTerm}
                                        onChange={(e) => {
                                            setTrainerSearchTerm(e.target.value);
                                            setTrainerPage(1);
                                        }}
                                    />
                                    <select
                                        className="px-2 py-1 border rounded"
                                        value={trainerRowsPerPage}
                                        onChange={(e) => {
                                            setTrainerRowsPerPage(Number(e.target.value));
                                            setTrainerPage(1);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden mb-2">
                                {currentTrainers.length > 0 ? (
                                    currentTrainers.map(trainer => (
                                        <div
                                            key={trainer._id}
                                            className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${selectedTrainer?._id === trainer._id ? "bg-blue-100" : ""
                                                }`}
                                            onClick={() => setSelectedTrainer(trainer)}
                                        >
                                            <div className="font-medium">{trainer.name}</div>
                                            <div className="text-sm text-gray-600">{trainer.email}</div>
                                            <div className="text-xs mt-1">
                                                {trainer.trainerId.schoolIds?.length || 0} schools assigned
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No trainers found
                                    </div>
                                )}
                            </div>

                            {/* Trainer Pagination */}
                            <div className="flex justify-between items-center">
                                <button
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    disabled={trainerPage === 1}
                                    onClick={() => setTrainerPage(trainerPage - 1)}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {trainerPage} of {Math.ceil(filteredTrainers.length / trainerRowsPerPage)}
                                </span>
                                <button
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    disabled={trainerPage === Math.ceil(filteredTrainers.length / trainerRowsPerPage)}
                                    onClick={() => setTrainerPage(trainerPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Assignment Panel */}
                        <div className="flex-1">
                            {selectedTrainer ? (
                                <div className="border rounded-lg p-4 bg-white h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">
                                            Assign Schools to {selectedTrainer.name}
                                        </h2>
                                        <button
                                            onClick={() => setSelectedTrainer(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Search schools..."
                                                className="px-3 py-1 border rounded flex-grow"
                                                value={schoolSearchTerm}
                                                onChange={(e) => {
                                                    setSchoolSearchTerm(e.target.value);
                                                    setSchoolPage(1);
                                                }}
                                            />
                                            <select
                                                className="px-2 py-1 border rounded"
                                                value={schoolRowsPerPage}
                                                onChange={(e) => {
                                                    setSchoolRowsPerPage(Number(e.target.value));
                                                    setSchoolPage(1);
                                                }}
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex-grow overflow-y-auto mb-4 border rounded">
                                        {currentSchools.length > 0 ? (
                                            currentSchools.map(school => {
                                                // Check if this school is already assigned to the trainer
                                                const isAssigned = selectedSchools.includes(school._id);
                                                
                                                // Check if this school's selection status has been changed
                                                const wasAssigned = selectedTrainer.trainerId.schoolIds.some(s => 
                                                    (typeof s === 'object' ? s._id : s) === school._id
                                                );
                                                const isChanged = wasAssigned !== isAssigned;
                                                
                                                return (
                                                    <div key={school._id} className={`flex items-center p-2 hover:bg-gray-50 border-b ${
                                                        isAssigned ? 'bg-blue-50' : ''
                                                    } ${isChanged ? 'border-l-4 border-orange-500' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            id={`school-${school._id}`}
                                                            checked={isAssigned}
                                                            onChange={() => handleSchoolSelect(school._id)}
                                                            className="mr-3"
                                                        />
                                                        <label htmlFor={`school-${school._id}`} className="flex-1">
                                                            <div className="font-medium">{school.name}</div>
                                                            <div className="text-sm text-gray-600">{school.address}</div>
                                                            {isAssigned && !isChanged && 
                                                                <div className="text-xs text-blue-600">Currently assigned</div>
                                                            }
                                                            {isChanged && (
                                                                <div className={`text-xs ${isAssigned ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {isAssigned ? 'Will be assigned' : 'Will be unassigned'} (not saved)
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-gray-500 py-4">
                                                No schools found
                                            </div>
                                        )}
                                    </div>

                                    {/* School Pagination */}
                                    <div className="flex justify-between items-center mb-4">
                                        <button
                                            className="px-3 py-1 border rounded disabled:opacity-50"
                                            disabled={schoolPage === 1}
                                            onClick={() => setSchoolPage(schoolPage - 1)}
                                        >
                                            Previous
                                        </button>
                                        <span>
                                            Page {schoolPage} of {Math.ceil(filteredSchools.length / schoolRowsPerPage)}
                                        </span>
                                        <button
                                            className="px-3 py-1 border rounded disabled:opacity-50"
                                            disabled={schoolPage === Math.ceil(filteredSchools.length / schoolRowsPerPage)}
                                            onClick={() => setSchoolPage(schoolPage + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2 border-t">
                                        <button
                                            onClick={() => setSelectedTrainer(null)}
                                            className="px-4 py-2 border rounded hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={updateTrainerSchools}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save Assignments"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-lg p-8 text-center bg-gray-50 h-full flex items-center justify-center">
                                    <div className="text-gray-500">
                                        Select a trainer from the list to assign schools
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignTrainer;