import React from 'react'

export default function WhoAreWe() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 transform transition-transform duration-500 hover:scale-105">
        <div className="p-8 md:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-60"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full opacity-60"></div>
          
          <div className="relative">
            <blockquote className="relative mb-12">
              <div className="text-7xl absolute -top-6 left-0 text-indigo-300 font-serif">"</div>
              <p className="text-xl md:text-2xl text-gray-700 italic font-light pl-12 pr-12 pt-6 pb-2">
                Never doubt that a small group of thoughtful, committed, citizens can change the world. Indeed, it is the only thing that ever has.
              </p>
              <div className="text-7xl absolute bottom-8 right-0 text-indigo-300 font-serif">"</div>
              <footer className="text-right mt-6 mr-12 text-gray-600 font-medium">
                ― Margaret Mead
              </footer>
            </blockquote>
            
            <div className="mt-16 pt-8 border-t border-indigo-200">
              <h2 className="text-2xl font-bold text-indigo-800 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-800 leading-relaxed">
                Inspired accordingly, we are a small group of 
                <span className="font-semibold text-indigo-700"> Thoughtful </span> 
                and 
                <span className="font-semibold text-purple-700"> Committed </span> 
                People, who resolve to make the technology world a better place for future citizens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}