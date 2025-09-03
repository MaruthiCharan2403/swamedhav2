import { Link } from "react-router-dom";
const Footer = () => {
    return (
      <footer className="bg-white/80 backdrop-blur-md border-t py-6 px-6">
        {/* 
         <div className="max-w-6xl mx-auto ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-4xl font-bold">🚀</span>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                  Swamedha
                </h3>
              </div>
              <p className="text-gray-600">
                Empowering the next generation of creators, innovators, and problem-solvers through creative coding.
              </p>
              
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                Contact Us
              </h3>
              <p className="text-gray-600">Email: info@swamedha.com</p>
              <p className="text-gray-600">Phone: +91 123 456 7890</p>
            </div>
          </div> 
  
        </div>
        */}
          {/* Copyright Section */}
          <div className="text-center ">
            <p className="text-gray-600">
              &copy; 2020-2026 : Swamedha Educational Services. All rights reserved.
            </p>
          </div>
      </footer>
    );
  };
  
  export default Footer;