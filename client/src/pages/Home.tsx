import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { HeroSection } from '@/components/HeroSection';

export default function Home() {
  const [, navigate] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* About Event Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              About the <span className="gradient-text">Event</span>
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed mb-6">
              The AI Agent Challenge is a premium 2-hour college AI competition designed to identify and nurture the brightest minds in artificial intelligence. Participants showcase their problem-solving abilities by building intelligent solutions that address real-world challenges.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
              className="btn-primary"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Participate Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Why Participate?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Showcase Your Skills',
                description: 'Demonstrate your AI and problem-solving abilities on a premium platform.',
              },
              {
                title: 'Win Amazing Prizes',
                description: 'Compete for cash prizes, internships, and industry recognition.',
              },
              {
                title: 'Network & Learn',
                description: 'Connect with talented peers and learn from industry experts.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-4"
              >
                <h3 className="text-2xl font-bold text-primary">{item.title}</h3>
                <p className="text-foreground/80">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Event Highlights */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Event Highlights</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '2H',
                label: 'Duration',
                description: 'Fast-paced competition with intense problem-solving',
              },
              {
                number: 'Cash',
                label: 'Cash Prizes',
                description: 'Cash prizes for top performing teams',
              },
              {
                number: 'Unlimited',
                label: 'Possibilities',
                description: 'Use any AI/ML tools and libraries',
              },
            ].map((highlight, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-3"
              >
                <p className="text-5xl font-bold text-primary">{highlight.number}</p>
                <h3 className="text-xl font-bold">{highlight.label}</h3>
                <p className="text-foreground/80">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container text-center space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to <span className="gradient-text">Compete?</span>
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Join the AI Agent Challenge and showcase your problem-solving abilities. Explore the problem statement and rules to get started!
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://kec.ac.in', '_blank', 'noopener,noreferrer')}
              className="btn-primary"
            >
              🏫 Visit College Website
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
              className="btn-secondary"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

