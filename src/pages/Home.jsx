// import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import rainbow from "../assets/Home/rainbow_methology.png";
import panchatantra from "../assets/Home/panchatantra.png";
import Courses from "./Courses";
import './Home.css';
const Homepage = () => {
  const navigate = useNavigate();


  const categories = [
    {
      id: 'animations',
      title: 'Animations',
      description: 'Learn sequencing & timing which are important for problem-solving',
      color: 'from-purple-500 to-pink-500',
      icon: '✨',
      pattern: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]'
    },
    {
      id: 'storytelling',
      title: 'Storytelling',
      description: 'Create interactive stories combining creativity with technology',
      color: 'from-cyan-500 to-blue-500',
      icon: '📚',
      pattern: 'bg-[linear-gradient(45deg,transparent_25%,#f3f4f6_25%,#f3f4f6_50%,transparent_50%,transparent_75%,#f3f4f6_75%)] bg-[length:20px_20px]'
    },
    {
      id: 'gameDev',
      title: 'Game Development',
      description: 'Design games and learn variables, loops, and conditional statements',
      color: 'from-green-400 to-emerald-500',
      icon: '🎮',
      pattern: 'bg-[repeating-linear-gradient(0deg,#f3f4f6,#f3f4f6_1px,transparent_1px,transparent_10px)]'
    },
    {
      id: 'webDesign',
      title: 'Web Designing',
      description: 'Learn HTML, CSS and how to structure content and create layouts',
      color: 'from-amber-400 to-orange-500',
      icon: '🌐',
      pattern: 'bg-[conic-gradient(at_top_right,#f3f4f6,transparent_120deg)] bg-[length:20px_20px]'
    },
    {
      id: 'mathApps',
      title: 'Math Applications',
      description: 'Understand mathematical concepts in a practical and interactive way',
      color: 'from-red-400 to-rose-500',
      icon: '🔢',
      pattern: 'bg-[radial-gradient(circle_at_center,#f3f4f6_2px,transparent_2px,#f3f4f6_1px,transparent_6px)] bg-[length:20px_20px]'
    },
    {
      id: 'mobileApps',
      title: 'Mobile App Development',
      description: 'Design user interfaces and bring ideas to real-world applications',
      color: 'from-indigo-400 to-purple-500',
      icon: '📱',
      pattern: 'bg-[repeating-radial-gradient(circle_at_center,#f3f4f6,#f3f4f6_1px,transparent_1px,transparent_10px)]'
    },
    {
      id: 'design',
      title: 'Designs & Art',
      description: 'Generate digital art and create interactive installations',
      color: 'from-pink-400 to-rose-500',
      icon: '🎨',
      pattern: 'bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[length:20px_20px]'
    }
  ];


  const enterHover = () => setCursorVariant("hover");
  const leaveHover = () => setCursorVariant("default");

  return (
    <div className="relative min-h-screen overflow-hidden mt-20 pt-20"
      style={{
        background: 'linear-gradient(45deg, #ff9a9e, #fad0c4, #fbc2eb, #a6c1ee, #84fab0, #8fd3f4, #a1c4fd, #c2e9fb, #f6d365, #fda085)',
        backgroundSize: '400% 400%',
        animation: 'rainbow 15s ease infinite',

      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Grid lines background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px] z-10 pointer-events-none"></div>

      {/* Hero section */}
      <motion.section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-purple-900/20 to-transparent z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-2 w-full max-w-5xl mx-auto">
          {/* Swamedha Text */}
          <motion.div
            className="flex-1 flex flex-col items-start justify-center"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text mb-4 drop-shadow-lg">
              Swamedha
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-white/90 mb-4 drop-shadow">
              Creative Coding for Kids
            </p>
            <p className="text-lg text-indigo-900/80 mb-6 max-w-md">
              Unlock your child's potential through creative coding. Build games, animations, apps, and more in a fun, interactive environment!
            </p>
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xl font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 transition-all duration-300 z-[12] "
              whileTap={{ scale: 0.9, rotate: 3 }}

              onClick={() => navigate('/login')}
            >
              Start Learning
            </motion.button>
          </motion.div>
          {/* Rainbow Image */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1, delay: 0.4 }}
          >
            <img
              src={rainbow}
              alt="Rainbow Methodology"
              className="w-60 md:w-96 rounded-2xl shadow-2xl border-4 border-white/30 bg-white/10 hover:scale-105 transition-transform duration-300"
              style={{
                boxShadow: "0 8px 40px 0 rgba(168,85,247,0.25), 0 1.5px 8px 0 rgba(34,211,238,0.15)"
              }}
            />
          </motion.div>
        </div>

        <Courses />

        {/* Rainbow stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className={`relative overflow-hidden rounded-2xl ${category.pattern}`}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              onMouseEnter={enterHover}
              onMouseLeave={leaveHover}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
              <div className="relative p-8 h-full flex flex-col">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                <p className="text-white/80">{category.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      {/* Animated code section */}
      <motion.section
        className="relative min-h-screen py-20 px-6 z-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-clip-text text-black">
                  Learning by Creating
                </span>
              </h2>
              <p className="text-xl text-white mb-8">
                Our hands-on approach teaches kids to code by building real projects. They'll learn essential programming concepts while having fun and exercising their creativity.
              </p>
              <ul className="space-y-4">
                {[
                  'Project-based learning',
                  'Expert guidance from coding educators',
                  'Age-appropriate challenges',
                  'Fosters problem-solving skills',
                  'Builds confidence and creativity'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center font-semibold text-white/80"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="mr-3 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                      ✓
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <motion.button
                className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={enterHover}
                onMouseLeave={leaveHover}
              >
                View Curriculum
              </motion.button>
            </motion.div>

            <motion.div
              className="lg:w-1/2 rounded-lg overflow-hidden"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-lg bg-gray-900 p-4 shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-sm text-gray-400">game.js</div>
                </div>

                <motion.pre
                  className="text-sm font-mono text-gray-300 overflow-x-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <motion.code>
                    <motion.span className="text-pink-400">function</motion.span>
                    <motion.span className="text-cyan-400"> setupGame</motion.span>
                    <motion.span>() {`{`}</motion.span>
                    <br />
                    <motion.span className="pl-4 text-yellow-400">const</motion.span>
                    <motion.span> player = {`{`}</motion.span>
                    <br />
                    <motion.span className="pl-8">x: 100,</motion.span>
                    <br />
                    <motion.span className="pl-8">y: 100,</motion.span>
                    <br />
                    <motion.span className="pl-8">speed: 5,</motion.span>
                    <br />
                    <motion.span className="pl-8">score: 0</motion.span>
                    <br />
                    <motion.span className="pl-4">{`}`};</motion.span>
                    <br /><br />
                    <motion.span className="pl-4 text-yellow-400">function</motion.span>
                    <motion.span className="text-green-400"> movePlayer</motion.span>
                    <motion.span>(direction) {`{`}</motion.span>
                    <br />
                    <motion.span className="pl-8 text-purple-400">if</motion.span>
                    <motion.span> (direction === </motion.span>
                    <motion.span className="text-orange-400">'right'</motion.span>
                    <motion.span>) {`{`}</motion.span>
                    <br />
                    <motion.span className="pl-12">player.x += player.speed;</motion.span>
                    <br />
                    <motion.span className="pl-8">{`}`} </motion.span>
                    <motion.span className="text-purple-400">else if</motion.span>
                    <motion.span> (direction === </motion.span>
                    <motion.span className="text-orange-400">'left'</motion.span>
                    <motion.span>) {`{`}</motion.span>
                    <br />
                    <motion.span className="pl-12">player.x -= player.speed;</motion.span>
                    <br />
                    <motion.span className="pl-8">{`}`}</motion.span>
                    <br />
                    <motion.span className="pl-4">{`}`}</motion.span>
                    <br /><br />
                    <motion.span className="pl-4 text-yellow-400">function</motion.span>
                    <motion.span className="text-green-400"> collectStar</motion.span>
                    <motion.span>() {`{`}</motion.span>
                    <br />
                    <motion.span className="pl-8">player.score += 10;</motion.span>
                    <br />
                    <motion.span className="pl-8 text-blue-400">console</motion.span>
                    <motion.span>.log(</motion.span>
                    <motion.span className="text-orange-400">'Star collected! Score: '</motion.span>
                    <motion.span> + player.score);</motion.span>
                    <br />
                    <motion.span className="pl-4">{`}`}</motion.span>
                    <br />
                    <motion.span>{`}`}</motion.span>
                  </motion.code>
                </motion.pre>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Homepage;