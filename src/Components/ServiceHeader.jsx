import React, { useState } from "react";
import { useSelector } from "react-redux";
import AdminHeader from "./ServiceHeader/AdminHeader";
import SuperAdminHeader from "./ServiceHeader/SuperAdminHeader";
import SchoolHeader from "./ServiceHeader/SchoolHeader";
import StudentHeader from "./ServiceHeader/StudentHeader";
import TeacherHeader from "./ServiceHeader/TeacherHeader";
import Studentb2cHeader from "./ServiceHeader/Studentb2cHeader";
import TrainerHeader from "./ServiceHeader/TrainerHeader";
export default function ServiceHeader({isMobileMenuOpen , setIsMenuOpen}) {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector(state=>state.auth.isAuthenticated);
    // console.log(isAuthenticated);
  
  return (
    <div>
    {isAuthenticated && 
      <div className="container lg:mx-auto lg:mt-1 lg:p-2 lg:pb-0 lg:border-t-2 lg:border-t-gray-600">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex justify-between">
        {/* <AdminHeader/> */}
        {user?.role === "superadmin" && <SuperAdminHeader  />}
        {user?.role === "admin" && <AdminHeader />}
        {user?.role === "school" && <SchoolHeader />}
        {user?.role==="student" && <StudentHeader/>}
        {user?.role==="teacher" && <TeacherHeader/>}
        {user?.role==="studentb2c" && <Studentb2cHeader/>}
        {user?.role==="trainer" && <TrainerHeader/>}
      </div>

      {/* Mobile Menu Button */}
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        
        <div className="lg:hidden mt-2 bg-black/50 text-white p-3 rounded">
         {/* <SuperAdminHeader/> */}
        {user?.role === "superadmin" && <SuperAdminHeader setIsMenuOpen={setIsMenuOpen}/>}
        {user?.role === "admin" && <AdminHeader setIsMenuOpen={setIsMenuOpen} />}
        {user?.role === "school" && <SchoolHeader setIsMenuOpen={setIsMenuOpen} />}
        {user?.role==="student" && <StudentHeader setIsMenuOpen={setIsMenuOpen} />}
        {user?.role==="teacher" && <TeacherHeader setIsMenuOpen={setIsMenuOpen} />}
        {user?.role==="studentb2c" && <Studentb2cHeader setIsMenuOpen={setIsMenuOpen} />}

        </div>
      )}
    </div>}
    </div>
  );
}
