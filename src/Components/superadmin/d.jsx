
import { useState, useEffect } from "react"
import axios from "axios"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import {
    School,
    Users,
    UserCheck,
    BookOpen,
    CreditCard,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Award,
    BookOpenCheck,
    GraduationCap,
} from "lucide-react"

const Dashboard = () => {
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
                const paymentsRes = await axios.get('/api/dashboard/payments');
                setSchools(schoolsRes.data);
                setStudents(studentsRes.data);
                setTeachers(teachersRes.data);
                setPayments(paymentsRes.data);
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
    const totalPayments = payments.length
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.totalAmountPaid, 0)
    const pendingRevenue = payments.reduce((sum, payment) => sum + (payment.totalAmount - payment.totalAmountPaid), 0)

    // Payment status distribution
    const paymentStatusData = [
        { name: "Approved", value: payments.filter((p) => p.status === "approved").length },
        { name: "Pending", value: payments.filter((p) => p.status === "pending").length },
        { name: "Rejected", value: payments.filter((p) => p.status === "rejected").length },
        { name: "Partially Paid", value: payments.filter((p) => p.status === "partially_paid").length },
    ]

    // Payment method distribution
    const paymentMethodData = [
        { name: "Full Payment", value: payments.filter((p) => p.paymentMethod === "full").length },
        { name: "EMI", value: payments.filter((p) => p.paymentMethod === "emi").length },
    ]

    // Student class distribution
    const studentClassData = students.reduce((acc, student) => {
        const className = student.class
        const existingClass = acc.find((item) => item.name === className)
        if (existingClass) {
            existingClass.value += 1
        } else {
            acc.push({ name: className, value: 1 })
        }
        return acc
    }, [])

    // Monthly payment data (last 6 months)
    const getMonthlyPaymentData = () => {
        const months = []
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
            months.push({
                name: month.toLocaleString("default", { month: "short" }),
                month: month.getMonth(),
                year: month.getFullYear(),
            })
        }

        return months.map((monthData) => {
            const monthPayments = payments.filter((payment) => {
                const paymentDate = new Date(payment.createdAt)
                return paymentDate.getMonth() === monthData.month && paymentDate.getFullYear() === monthData.year
            })

            return {
                name: monthData.name,
                total: monthPayments.reduce((sum, payment) => sum + payment.totalAmount, 0),
                collected: monthPayments.reduce((sum, payment) => sum + payment.totalAmountPaid, 0),
            }
        })
    }

    // Student progress data
    const getStudentProgressData = () => {
        const totalPrograms = students.reduce(
            (sum, student) => sum + student.progress.reduce((pSum, p) => pSum + p.programs.length, 0),
            0,
        )

        const completedTopics = students.reduce(
            (sum, student) => sum + student.progress.filter((p) => p.completed).length,
            0,
        )

        const totalTopics = students.reduce((sum, student) => sum + student.progress.length, 0)

        const pendingDoubts = students.reduce(
            (sum, student) =>
                sum + student.progress.reduce((pSum, p) => pSum + p.doubts.filter((d) => d.status === "pending").length, 0),
            0,
        )

        const answeredDoubts = students.reduce(
            (sum, student) =>
                sum + student.progress.reduce((pSum, p) => pSum + p.doubts.filter((d) => d.status === "answered").length, 0),
            0,
        )

        return [
            { name: "Completed Topics", value: completedTopics },
            { name: "Pending Topics", value: totalTopics - completedTopics },
            { name: "Programs Submitted", value: totalPrograms },
            { name: "Pending Doubts", value: pendingDoubts },
            { name: "Answered Doubts", value: answeredDoubts },
        ]
    }

    // Teacher-student ratio by school
    const getTeacherStudentRatioData = () => {
        return schools
            .map((school) => {
                const schoolTeachers = teachers.filter((t) => t.schoolId === school._id).length
                const schoolStudents = students.filter((s) => s.schoolId === school._id).length

                return {
                    name: school.name,
                    students: schoolStudents,
                    teachers: schoolTeachers,
                    ratio: schoolTeachers ? (schoolStudents / schoolTeachers).toFixed(1) : 0,
                }
            })
            .slice(0, 5) // Show only top 5 schools
    }

    // Course enrollment data
    const getCourseEnrollmentData = () => {
        const courseData = {}

        schools.forEach((school) => {
            school.enabledCourses.forEach((course) => {
                const levelName = course.levelName
                if (!courseData[levelName]) {
                    courseData[levelName] = {
                        name: levelName,
                        capacity: 0,
                        enrolled: 0,
                    }
                }
                courseData[levelName].capacity += course.studentcount || 0
                courseData[levelName].enrolled += course.currentcount || 0
            })
        })

        return Object.values(courseData)
    }

    // Colors for charts
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center">
                                <School className="mr-2" size={32} />
                                School Management Dashboard
                            </h1>
                            <p className="mt-1 text-blue-100">Comprehensive analytics and insights</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="text-sm text-blue-100">Last updated: {new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </header>

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

                {/* Revenue Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <TrendingUp className="mr-2 text-blue-500" />
                            Revenue Overview
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getMonthlyPaymentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="total" name="Total Amount" fill="#8884d8" />
                                    <Bar dataKey="collected" name="Collected Amount" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <DollarSign className="mr-2 text-green-500" />
                            Payment Statistics
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Pending Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">₹{pendingRevenue.toLocaleString()}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div
                                        className="bg-yellow-500 h-2.5 rounded-full"
                                        style={{
                                            width: `${((pendingRevenue / (totalRevenue + pendingRevenue)) * 100).toFixed(0)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-800">{totalPayments}</p>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-500">
                                        Full Payment: {payments.filter((p) => p.paymentMethod === "full").length}
                                    </span>
                                    <span className="text-gray-500">EMI: {payments.filter((p) => p.paymentMethod === "emi").length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Status and Method */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <CheckCircle className="mr-2 text-blue-500" />
                            Payment Status Distribution
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {paymentStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value} payments`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {paymentStatusData.map((entry, index) => (
                                <div key={index} className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-sm text-gray-600">
                                        {entry.name}: {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <CreditCard className="mr-2 text-purple-500" />
                            Payment Methods
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        <Cell fill="#0088FE" />
                                        <Cell fill="#00C49F" />
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value} payments`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                                <span className="text-sm text-gray-600">Full Payment: {paymentMethodData[0].value}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                                <span className="text-sm text-gray-600">EMI: {paymentMethodData[1].value}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Progress and Course Enrollment */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <BookOpenCheck className="mr-2 text-indigo-500" />
                            Student Progress Overview
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={getStudentProgressData()}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={150} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {getStudentProgressData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <GraduationCap className="mr-2 text-yellow-500" />
                            Course Enrollment
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getCourseEnrollmentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="capacity" name="Total Capacity" fill="#8884d8" />
                                    <Bar dataKey="enrolled" name="Currently Enrolled" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Teacher-Student Ratio and Student Class Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Users className="mr-2 text-blue-500" />
                            Teacher-Student Ratio (Top 5 Schools)
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getTeacherStudentRatioData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="students" name="Students" fill="#8884d8" />
                                    <Bar yAxisId="right" dataKey="teachers" name="Teachers" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700">Student-Teacher Ratio</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {getTeacherStudentRatioData().map((school, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm font-medium text-gray-600">{school.name}</span>
                                        <span className="text-sm font-bold text-blue-600">{school.ratio}:1</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Award className="mr-2 text-green-500" />
                            Student Class Distribution
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={studentClassData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {studentClassData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Clock className="mr-2 text-indigo-500" />
                        Recent Activity
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.slice(0, 5).map((payment, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">Payment</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">₹{payment.totalAmount.toLocaleString()}</div>
                                            <div className="text-sm text-gray-500">
                                                {payment.paymentMethod === "full" ? "Full Payment" : "EMI"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${payment.status === "approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : payment.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : payment.status === "rejected"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                {payment.status.replace("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} School Management System. All rights reserved.
                        </div>
                        <div className="mt-4 md:mt-0 text-gray-500 text-sm">Dashboard Version 1.0.0</div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Dashboard

