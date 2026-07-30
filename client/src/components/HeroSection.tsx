import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { FuturisticRobotVisual } from './FuturisticRobotVisual';
import { Rocket, ExternalLink, ChevronDown, Sparkles, Trophy, Calendar, Users, Award, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  const [, navigate] = useLocation();

  const handleVisitCollege = () => {
    window.open('https://kec.ac.in', '_blank', 'noopener,noreferrer');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 md:px-6">
      {/* Subtle radial ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10"
      >
        {/* Left Side: Glassmorphism Hero Content Card */}
        <motion.div className="lg:col-span-7 space-y-6">
          {/* Glass Card Wrapper */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-4 sm:p-8 md:p-10 border border-blue-500/30 bg-[#0F172A]/70 backdrop-blur-2xl shadow-[0_0_50px_rgba(15,23,42,0.8)] relative overflow-hidden"
          >
            {/* Top Glowing Ambient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400" />

            <div className="space-y-6">
              {/* 👋 Welcome Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                <span className="text-lg">👋</span>
                <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-cyan-300">
                  Welcome to Everyone
                </span>
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              </motion.div>

              {/* Institution Header */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight gradient-text-kec">
                  KUPPAM ENGINEERING COLLEGE
                </h2>
                <p className="text-sm sm:text-base md:text-lg font-medium text-cyan-400/90 tracking-wide">
                  Department of Artificial Intelligence & Machine Learning
                </p>
              </motion.div>

              {/* Main Challenge Title */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
                  AI AGENT <br className="hidden sm:inline" />
                  <span className="gradient-text-hero">CHALLENGE 2026</span>
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.div
                variants={itemVariants}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1"
              >
                <p className="text-base sm:text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-200 to-cyan-300 leading-snug">
                  Think Beyond Code. Build Intelligent Agents. Shape the Future.
                </p>
                <p className="text-xs sm:text-sm text-gray-300/80">
                  Join the flagship AI event of Kuppam Engineering College. Solve real-world AI challenges, deploy autonomous agents, and compete for top prizes!
                </p>
              </motion.div>

              {/* Call to Action Button */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
              >
                {/* 🏫 Visit College Website Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVisitCollege}
                  className="btn-primary text-sm sm:text-base font-bold shadow-[0_0_30px_rgba(59,130,246,0.6)] border-blue-400/60 inline-flex items-center justify-center gap-2"
                >
                  <span>🏫 Visit College Website</span>
                  <ExternalLink className="w-4 h-4 text-cyan-300 ml-1" />
                </motion.button>
              </motion.div>

              {/* Event Quick Specs Grid - Overflow Safe Responsive Layout */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-5 border-t border-blue-500/20"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left gap-1 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 min-w-0 overflow-hidden">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
                  <div className="min-w-0 w-full flex-1">
                    <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Grand Prizes</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-300 truncate">Cash & Awards</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left gap-1 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 min-w-0 overflow-hidden">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                  <div className="min-w-0 w-full flex-1">
                    <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Team Size</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-300 truncate">1 - 2 Members</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left gap-1 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 min-w-0 overflow-hidden">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0 w-full flex-1">
                    <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Certification</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-300 truncate">All Participants</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Futuristic AI Robot Visual */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex justify-center">
          <FuturisticRobotVisual />
        </motion.div>
      </motion.div>

      {/* Down Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => {
          window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
        }}
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Scroll to Explore</span>
        <ChevronDown className="w-5 h-5 text-cyan-400" />
      </motion.div>
    </section>
  );
}
