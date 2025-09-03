import React, { useState } from "react";
import { motion } from "framer-motion";

const Courses = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    { id: "prarambh", name: "Prarambh", description: "Start your journey", color: "bg-orange-500", height: "h-16 md:h-24" },
    { id: "jignasu", name: "Jignasu", description: "Get curious and explore", color: "bg-green-500", height: "h-20 md:h-32" },
    { id: "outsahik", name: "Outsahik", description: "Practice your skills", color: "bg-blue-500", height: "h-24 md:h-40" },
    { id: "viveka", name: "Viveka", description: "Showcase your knowledge", color: "bg-purple-500", height: "h-28 md:h-48" },
    { id: "swadhyaya", name: "Swadhyaya", description: "Dive deeper into learning", color: "bg-red-500", height: "h-32 md:h-56" },
    { id: "pragna", name: "Pragna", description: "Master Intelligence & AI", color: "bg-yellow-500", height: "h-36 md:h-64" },
    { id: "swamedhavi", name: "Swamedhavi", description: "Become future-ready!", color: "bg-green-700", height: "h-40 md:h-72" },
  ];

  return (
    <div className="bg-gradient-to-br text-white min-h-screen flex flex-col justify-center items-center p-6 md:p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-24 h-24 md:w-32 md:h-32 bg-blue-500 opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 md:w-64 md:h-64 bg-purple-500 opacity-10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-28 h-28 md:w-40 md:h-40 bg-yellow-500 opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl w-full z-10 text-center">
        <h1 className="text-2xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          You don't have to see the whole staircase,
        </h1>
        <h2 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-red-300 via-red-500 to-red-600 text-transparent bg-clip-text">
          JUST TAKE THE FIRST STEP
        </h2>
      </div>

      {/* Responsive Staircase */}
      <div className="relative w-full max-w-4xl grid grid-cols-3 sm:grid-cols-4 md:flex justify-center items-end gap-2 md:gap-4 z-10 mt-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`relative group ${step.color} ${step.height} w-20 sm:w-24 md:w-32 rounded-t-lg shadow-lg 
                      ${hoveredStep === step.id ? "scale-105 z-20" : "hover:scale-105"}`}
            onMouseEnter={() => setHoveredStep(step.id)}
            onMouseLeave={() => setHoveredStep(null)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
          >
            {/* Glow effect on hover */}
            <motion.div
              className={`absolute inset-0 rounded-t-lg ${step.color} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-200`}
              whileHover={{ opacity: 0.4, scale: 1.1 }}
            ></motion.div>

            {/* Step Content */}
            <div className="flex flex-col justify-center items-center h-full p-2 md:p-4">
              <motion.div
                className="font-bold text-xs md:text-lg mb-1 text-center"
                whileHover={{ scale: 1.1 }}
              >
                {step.name}
              </motion.div>
              <motion.div
                className="text-[10px] md:text-sm font-medium text-center opacity-90"
                whileHover={{ scale: 1.05 }}
              >
                {step.description}
              </motion.div>

              {/* Step number indicator */}
              <div className="absolute -top-2 -left-2 w-5 h-5 md:w-8 md:h-8 rounded-full bg-white text-[10px] md:text-sm flex items-center justify-center text-gray-800 font-bold shadow-md">
                {index + 1}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Dots */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={`dot-${step.id}`}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              hoveredStep === step.id ? "bg-white scale-125" : step.color
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          ></motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Courses;
