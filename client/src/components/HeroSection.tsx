import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { HolographicSphere } from './HolographicSphere';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  const [, navigate] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-30" />
      </div>

      {/* Hero content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left content */}
        <motion.div className="space-y-8 z-10">
          {/* Main title */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="gradient-text">AI Agent</span>
              <br />
              <span className="text-white">Challenge</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants} className="space-y-3">
            <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed">
              Build Intelligent Solutions.
              <br />
              Compete. Innovate. Lead.
            </p>
            <p className="text-base md:text-lg text-foreground/60">
              A premium 2-hour AI competition where brilliant minds showcase their problem-solving abilities.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="btn-primary"
            >
              Register Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
              className="btn-secondary"
            >
              Explore Event
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 pt-8 border-t border-primary/10"
          >
            {[
              { number: '2H', label: 'Duration' },
              { number: '∞', label: 'Possibilities' },
              { number: '1–2', label: 'Team Size' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right content - Holographic Sphere */}
        <motion.div
          variants={itemVariants}
          className="hidden lg:flex items-center justify-center h-96 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl" />
          <HolographicSphere />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-primary/50" />
      </motion.div>
    </section>
  );
}
