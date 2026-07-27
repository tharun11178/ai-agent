import { motion } from 'framer-motion';
import { Brain, Zap, Trophy, Users } from 'lucide-react';

export default function About() {
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

  const features = [
    {
      icon: Brain,
      title: 'Intelligent Problem Solving',
      description: 'Tackle real-world AI challenges that require critical thinking and innovative approaches.',
    },
    {
      icon: Zap,
      title: 'Rapid Development',
      description: 'Build, test, and deploy your AI solutions within a 2-hour timeframe.',
    },
    {
      icon: Trophy,
      title: 'Premium Cash Prizes',
      description: 'Compete for exciting cash prizes and recognition in the AI community.',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Work with talented peers and learn from industry experts.',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About the <span className="gradient-text">AI Agent Challenge</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              The AI Agent Challenge is a premier 2-hour college AI competition designed to identify and nurture the brightest minds in artificial intelligence. Participants showcase their problem-solving abilities by building intelligent solutions that address real-world challenges.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Objectives Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Event Objectives</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Identify exceptional talent in AI and machine learning',
              'Faster innovation and creative problem-solving',
              'Build a community of AI enthusiasts and professionals',
              'Provide hands-on experience with cutting-edge AI technologies',
            ].map((objective, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-6 space-y-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-lg text-foreground/90">{objective}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Why Participate?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-8 space-y-4 hover:border-secondary/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Learning Outcomes */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Learning Outcomes</h2>
            <p className="text-lg text-foreground/80 mb-12 max-w-3xl">
              By participating in the AI Agent Challenge, you will gain valuable experience and knowledge:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Technical Skills',
                items: [
                  'Advanced AI/ML implementation',
                  'Rapid prototyping techniques',
                  'Code optimization strategies',
                ],
              },
              {
                title: 'Problem Solving',
                items: [
                  'Complex problem decomposition',
                  'Creative solution design',
                  'Debugging under pressure',
                ],
              },
              {
                title: 'Professional Growth',
                items: [
                  'Networking with industry experts',
                  'Portfolio building',
                  'Career opportunities',
                ],
              },
            ].map((category, i) => (
              <motion.div key={i} variants={itemVariants} className="glass-card p-8 space-y-6">
                <h3 className="text-2xl font-bold text-primary">{category.title}</h3>
                <ul className="space-y-3">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
