import { motion } from 'framer-motion';
import { Mail, Phone, Bot } from 'lucide-react';

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <footer className="relative border-t border-blue-500/20 bg-[#0F172A]/90 backdrop-blur-xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container py-14 space-y-10"
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-extrabold tracking-wider text-blue-400 uppercase">
                Kuppam Engineering College
              </span>
              <span className="text-xs text-cyan-300 font-medium">
                Dept. of Artificial Intelligence & Machine Learning
              </span>
              <span className="text-xl font-black gradient-text-hero mt-1">
                AI AGENT CHALLENGE 2026
              </span>
            </div>
            <p className="text-gray-300/70 text-sm leading-relaxed">
              Think Beyond Code. Build Intelligent Agents. Shape the Future.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="font-bold text-white text-base">Quick Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Home', href: '/' },
                { name: 'About', href: '/about' },
                { name: 'Rules', href: '/rules' },
                { name: 'Schedule', href: '/schedule' },
                { name: 'Registration', href: '/register' },
                { name: 'FAQ & Contact', href: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center gap-1">
                    <span className="text-blue-500">•</span> {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://kec.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-white font-semibold transition-colors flex items-center gap-1 mt-2"
                >
                  🏫 Official College Website ↗
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="font-bold text-white text-base">Event Coordination</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-gray-200 hover:text-cyan-300 transition-colors">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>Tharun: <strong>+91 7032401370</strong></span>
              </li>
              <li className="flex items-center gap-2 text-gray-200 hover:text-cyan-300 transition-colors">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>Praveen: <strong>+91 7013782068</strong></span>
              </li>
              <li className="flex items-center gap-2 text-gray-300 hover:text-cyan-300 transition-colors">
                <Mail className="w-4 h-4 text-cyan-400" />
                aitheronmlsymposium@gmail.com
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/0" />

        {/* Bottom Footer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400"
        >
          <p>&copy; 2026 Kuppam Engineering College - Dept. of AI & ML. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/rules" className="hover:text-cyan-300 transition-colors">
              Rules & Guidelines
            </a>
            <a href="/schedule" className="hover:text-cyan-300 transition-colors">
              Event Schedule
            </a>
            <a href="https://kec.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
              KEC Portal
            </a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
