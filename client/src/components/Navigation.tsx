import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Menu, X, Bot } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Events', path: '/events' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'Problem Statement', path: '/problem-statement' },
    { label: 'Rules', path: '/rules' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/50 border-b border-primary/10"
    >
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavClick('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:inline">
            AI Agent Challenge
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                location === item.path
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
              {location === item.path && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavClick('/register')}
          className="hidden sm:block btn-primary"
        >
          Register Now
        </motion.button>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-primary/10 bg-background/80 backdrop-blur-xl"
        >
          <div className="container py-4 space-y-2">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  location === item.path
                    ? 'bg-primary/20 text-primary'
                    : 'text-foreground/70 hover:bg-white/10'
                }`}
                whileHover={{ x: 4 }}
              >
                {item.label}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick('/register')}
              className="w-full btn-primary mt-4"
            >
              Register Now
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
