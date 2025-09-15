// import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Home";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";
import Login from "./pages/Login";
import Registration from "./pages/Register";
import Courses from "./pages/Courses";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './redux/authSlice';
import AdminDashboard from "./Components/admin/Admindashboard";
import AddLevelPage from "./Components/admin/Addlevel";
import TextEditor from "./pages/Editor";
import CourseTopics from "./Components/admin/Content";
import Viewlevel from "./Components/admin/Viewlevel";
import EditLevelPage from "./Components/admin/Editlevel";
import WhoAreWe from "./pages/About";
import Deletelevel from "./Components/admin/Deletelevel";
import Contact from "./pages/Contact";
import ViewSchools from "./Components/superadmin/ViewSchools";
import AddStudent from "./Components/school/Addstudent";
import ViewStudents from "./Components/school/Viewstudent";
import AssignCourseToStudentTable from "./Components/school/Addtocourse";
import AddTeacher from "./Components/school/Addteacher";
import ViewTeachers from "./Components/school/Viewteachers";
import Assignteachers from "./Components/school/Assignteachers";
import AssignStudents from "./Components/school/Assignstudent";
import Studentcourses from "./Components/student/Studentcourses";
import Studentterms from "./Components/student/Terms";
import Studentcoursetopics from "./Components/student/CourseTopics";
import Teachercourses from "./Components/Teacher/Teachercourses";
import Teacherterms from "./Components/Teacher/Terms";
import TeachercourseTopics from "./Components/Teacher/CourseTopics";
import StudentDetailsPage from "./Components/school/Studentdetails";
import PasswordReset from "./pages/Resetpassword";
import Superadmindashboard from "./Components/superadmin/Superadmindashboard";
import SchoolDashboard from "./Components/school/Schooldashboard";
import SchoolStudents from "./Components/superadmin/SchoolStudents";
import AddAdmin from "./Components/superadmin/AddAdmin";
import ViewAdmin from "./Components/superadmin/ViewAdmin";
import EnableCoursesLevels from "./Components/superadmin/EnableCoursesLevels";
import AddTrainer from "./Components/superadmin/AddTrainer";
import ViewTrainer from "./Components/superadmin/ViewTrainer";
import AssignTrainer from "./Components/superadmin/AssignTrainer";
import TrainersCoursesPage from "./Components/superadmin/TrainerAssignLevels";
import TrainerDashboard from "./Components/trainer/TrainerDashboard";
import TrainerTopics from "./Components/trainer/CourseTopics";
import ProtectedRoute from "./pages/ProtectedRoute";
import Forbidden from "./pages/Forbidden";
import SchoolCourseContent from "./Components/school/Content";
import Profile from "./Components/Profile";
import ViewPage from "./Components/admin/Content/CourseList";
import FormPage from "./Components/admin/Content/CreateCourse";
import ViewResource from "./Components/admin/Content/ViewResource";


export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        if (sessionStorage.getItem('token') !== null) {
            const user = sessionStorage.getItem('userEmail');
            const username = sessionStorage.getItem('username');
            const role = sessionStorage.getItem('role');
            dispatch(login({ userEmail: user, role: role, username: username }));
            console.log("Initialized with isAuthenticated = true");
        }
    }, []);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/about" element={<WhoAreWe />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/forbidden" element={<Forbidden />} />
                <Route path="/resetpassword" element={
                    //   <ProtectedRoute requiredRole={['*']}>
                    <PasswordReset />
                    //   </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admindashboard" element={
                    <ProtectedRoute requiredRole={["admin"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/addlevel" element={
                    <ProtectedRoute requiredRole={["admin"]}>
                        <AddLevelPage />
                    </ProtectedRoute>
                } />

                <Route path="/admin/level/term" element={
                    <ProtectedRoute requiredRole={["admin"]}>
                        <CourseTopics />
                    </ProtectedRoute>
                } />
                <Route path="/admin/viewlevel" element={
                    <ProtectedRoute requiredRole={["admin"]}>
                        <Viewlevel />
                    </ProtectedRoute>
                } />
                <Route path="/admin/editlevel" element={
                    <ProtectedRoute requiredRole={["admin"]}>
                        <EditLevelPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/deletelevel" element={
                    <ProtectedRoute requiredRole={["admin"]}>
                        <Deletelevel />
                    </ProtectedRoute>
                } />

                <Route
                    path="/content"
                    element={
                        <ProtectedRoute requiredRole={["superadmin", "admin"]}>
                            <ViewPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create"
                    element={
                        <ProtectedRoute requiredRole={["superadmin", "admin"]}>
                            <FormPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/viewresource/:resourceId"
                    element={<ViewResource />}
                />

                {/* Superadmin routes */}
                <Route path="/superadmindashboard" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <Superadmindashboard />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/enablecourseslevels" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <EnableCoursesLevels />
                    </ProtectedRoute>
                } />

                <Route path="/superadmin/addadmin" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <AddAdmin />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/viewadmin" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <ViewAdmin />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/addtrainer" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <AddTrainer />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/viewtrainer" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <ViewTrainer />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/assigntrainer" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <AssignTrainer />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/assigntrainerlevels" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <TrainersCoursesPage />
                    </ProtectedRoute>
                } />
                <Route path="/superadmin/activeschools" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                        <ViewSchools />
                    </ProtectedRoute>
                } />

                {/* School routes */}
                <Route path="/schooldashboard" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <SchoolDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/school/addstudent" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <AddStudent />
                    </ProtectedRoute>
                } />
                <Route path="/school/viewstudent" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <ViewStudents />
                    </ProtectedRoute>
                } />
                <Route path="/school/addteacher" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <AddTeacher />
                    </ProtectedRoute>
                } />
                <Route path="/school/viewteachers" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <ViewTeachers />
                    </ProtectedRoute>
                } />
                <Route path="/school/assigncourse" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <AssignCourseToStudentTable />
                    </ProtectedRoute>
                } />
                <Route path="/school/assignteachers" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <Assignteachers />
                    </ProtectedRoute>
                } />
                <Route path="/school/assignstudents" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <AssignStudents />
                    </ProtectedRoute>
                } />
                <Route path="/school/studentdetails" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <StudentDetailsPage />
                    </ProtectedRoute>
                } />

                <Route path="/school/level" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <SchoolCourseContent />
                    </ProtectedRoute>
                } />

                <Route path="/school/students" element={
                    <ProtectedRoute requiredRole={["school"]}>
                        <SchoolStudents />
                    </ProtectedRoute>
                } />

                {/* Student routes */}
                <Route path="/studentdashboard" element={
                    <ProtectedRoute requiredRole={["student", "studentb2c"]}>
                        <Studentcourses />
                    </ProtectedRoute>
                } />

                <Route path="/student/level/term" element={
                    <ProtectedRoute requiredRole={["student", "studentb2c"]}>
                        <Studentcoursetopics />
                    </ProtectedRoute>
                } />

                {/* Teacher routes */}
                <Route path="/teacherdashboard" element={
                    <ProtectedRoute requiredRole={["teacher"]}>
                        <Teachercourses />
                    </ProtectedRoute>
                } />
                <Route path="/teacher/level" element={
                    <ProtectedRoute requiredRole={["teacher"]}>
                        <Teacherterms />
                    </ProtectedRoute>
                } />
                <Route path="/teacher/level/term" element={
                    <ProtectedRoute requiredRole={["teacher"]}>
                        <TeachercourseTopics />
                    </ProtectedRoute>
                } />

                {/* Trainer routes */}
                <Route path="/trainerdashboard" element={
                    <ProtectedRoute requiredRole={["trainer"]}>
                        <TrainerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/trainer/level" element={
                    <ProtectedRoute requiredRole={["trainer"]}>
                        <TrainerTopics />
                    </ProtectedRoute>
                } />

                {/* Editor (example: allow admin, superadmin, trainer) */}
                <Route path="/editor" element={
                    <ProtectedRoute requiredRole={["superadmin", "admin", "student"]}>
                        <TextEditor />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute requiredRole={["*"]}>
                        <Profile />
                    </ProtectedRoute>
                } />
            </Routes>
            <Footer />
        </Router>
    );
}