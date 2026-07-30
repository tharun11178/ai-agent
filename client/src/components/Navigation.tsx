import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Menu, X, Cpu, GraduationCap, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Rules', path: '/rules' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'Scan Problem Statement', path: '/problem-statement' },
    { label: 'Contact', path: '/faq' },
  ];

  const handleNavClick = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(path);
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0F172A]/75 border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
    >
      <div className="container flex items-center justify-between h-20 px-4 md:px-6">
        {/* Left: Kuppam Engineering College Logo & Emblem */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavClick('/')}
        >
          {/* Logo Emblem Icon */}
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:border-blue-400/80 transition-all duration-300">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-wider uppercase text-blue-300 leading-tight">
              Kuppam Engineering College
            </span>
            <span className="text-[10px] text-cyan-400/90 font-medium tracking-wide">
              Dept of AI & Machine Learning
            </span>
          </div>
        </motion.div>

        {/* Center Title Branding */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-primary/20 backdrop-blur-md shadow-inner">
          <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase gradient-text-hero">
            AI AGENT CHALLENGE 2026
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 rounded-full shadow-[0_0_8px_#3B82F6]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Mobile Menu Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-primary/20 bg-[#0F172A]/95 backdrop-blur-2xl px-4 py-4"
        >
          <div className="space-y-2">
            <div className="py-2 px-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center mb-3">
              <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
                AI AGENT CHALLENGE 2026
              </span>
            </div>

            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location === item.path
                    ? 'bg-blue-600/30 text-white border border-blue-500/30'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
                whileHover={{ x: 4 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

