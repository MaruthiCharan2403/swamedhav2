import React from 'react';
import { motion } from "framer-motion";
import pdf1 from '/r1.pdf';
import pdf2 from '/r2.pdf';

export default function WhoAreWe() {
  return (
    <section className="min-h-screen flex flex-col items-center relative  text-white overflow-hidden pt-32"
>
      {/* Main content */}
      <div className="relative z-10 w-full">
        <motion.h1
          className="text-6xl sm:text-7xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mt-16 mb-6 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Who Are We?
        </motion.h1>
        
        <motion.div
          className="w-24 h-1 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-8"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 py-12">
          {/* First Quote Block */}
          <motion.div
            className="relative p-8 bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700 overflow-hidden group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.4 }
            }}
          >
            {/* Decorative quote marks */}
            <div className="absolute top-4 left-4 text-8xl font-serif text-pink-500/10">"</div>
            <div className="absolute bottom-4 right-4 text-8xl font-serif text-pink-500/10">"</div>
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <p className="text-xl italic text-white leading-relaxed text-center relative z-10">
              "Never doubt that a small group of thoughtful, committed citizens can change the world. Indeed, it is the only thing that ever has."
            </p>
            <div className="flex items-center justify-center mt-6">
              <span className="block w-12 h-0.5 bg-pink-500/70 rounded-full"></span>
              <p className="text-lg font-semibold text-white text-center mx-4">- Margaret Mead</p>
              <span className="block w-12 h-0.5 bg-pink-500/70 rounded-full"></span>
            </div>
          </motion.div>

          {/* Second Quote Block */}
          <motion.div
            className="relative p-8 bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700 overflow-hidden group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.4 }
            }}
          >
            {/* Decorative quote marks */}
            <div className="absolute top-4 left-4 text-8xl font-serif text-purple-500/10">"</div>
            <div className="absolute bottom-4 right-4 text-8xl font-serif text-purple-500/10">"</div>
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <p className="text-xl italic text-white leading-relaxed text-center relative z-10">
              "Inspired accordingly, we are a small group of Thoughtful and Committed People, who resolve to make the Mathematics world a better place for future citizens."
            </p>
            <div className="flex items-center justify-center mt-6">
              <span className="block w-24 h-0.5 bg-purple-500/70 rounded-full"></span>
            </div>
          </motion.div>
        </div>

        {/* Section title for PDFs */}
        <motion.div 
          className="flex flex-col items-center justify-center my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* <h2 className="text-3xl font-bold text-white mb-3">Our Resources</h2> */}
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </motion.div>

        {/* PDF Renderers Side by Side */}
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-6 mb-16">
          {/* First PDF */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm shadow-xl border border-gray-700/50 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            whileHover={{ 
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.4 }
            }}
          >
            <div className="px-4 py-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-b border-gray-700/50">
              {/* <h3 className="text-lg font-medium text-white">Mathematical Principles</h3> */}
            </div>
            <div className="p-4 bg-white">
              <iframe
                src={pdf1}
                className="w-full h-[500px] border rounded-lg"
                title="PDF 1"
              />
            </div>
          </motion.div>

          {/* Second PDF */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm shadow-xl border border-gray-700/50 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            whileHover={{ 
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.4 }
            }}
          >
            <div className="px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700/50">
              {/* <h3 className="text-lg font-medium text-white">Educational Framework</h3> */}
            </div>
            <div className="p-4 bg-white">
              <iframe
                src={pdf2}
                className="w-full h-[500px] border rounded-lg"
                title="PDF 2"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}