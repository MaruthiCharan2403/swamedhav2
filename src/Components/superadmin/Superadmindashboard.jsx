
import { useState, useEffect } from "react"
import axios from "axios"
import {
    School,
    Users,
    UserCheck,
    BookOpen,
    CreditCard,
    AlertCircle,
    Clock,
} from "lucide-react"

const Superadmindashboard = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [schools, setSchools] = useState([])
    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [payments, setPayments] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch all data in parallel
                const schoolsRes = await axios.get('/api/dashboard/schools');
                const studentsRes = await axios.get('/api/dashboard/students');
                const teachersRes = await axios.get('/api/dashboard/teachers');
                
                setSchools(schoolsRes.data);
                setStudents(studentsRes.data);
                setTeachers(teachersRes.data);
                setLoading(false)
            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }
        fetchData();
    }, [])
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-xl font-semibold text-gray-700">Loading dashboard data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Error Loading Data</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Calculate statistics
    const totalSchools = schools.length
    const totalStudents = students.length
    const totalTeachers = teachers.length
    

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            {/* Header */}
            

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                                <School size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase">Schools</p>
                                <p className="text-2xl font-bold text-gray-700">{totalSchools}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase">Students</p>
                                <p className="text-2xl font-bold text-gray-700">{totalStudents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                                <UserCheck size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase">Teachers</p>
                                <p className="text-2xl font-bold text-gray-700">{totalTeachers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase">Courses</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {schools.reduce((sum, school) => sum + (school.enabledCourses?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div> 
            </main>
        </div>
    )
}

export default Superadmindashboard

