import { motion } from 'framer-motion';
import { Clock, Users, Target } from 'lucide-react';

export default function Events() {
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

  const rounds = [
    {
      number: 1,
      title: 'Problem Release & 15-Min Clarifications',
      duration: '0:00 - 0:15',
      description: 'Official unique problem statements released. 15-minute clarification window for team questions.',
      icon: Target,
    },
    {
      number: 2,
      title: 'Core AI Agent Development',
      duration: '0:15 - 1:45',
      description: 'Teams build innovative AI agent solutions using their chosen frameworks, models, and programming languages.',
      icon: Clock,
    },
    {
      number: 3,
      title: 'Submission & Live Demonstration',
      duration: '1:45 - 2:00',
      description: 'Teams submit solutions within the timeline and present live demonstrations to judges detailing architecture and workflow.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/5 to-transparent" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Event <span className="gradient-text">Timeline</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              A structured, high-intensity competition to design, build, and present AI agent solutions.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Rounds Timeline */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Event Rounds</h2>
          </motion.div>

          <div className="space-y-8">
            {rounds.map((round, i) => {
              const Icon = round.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-8 border-l-4 border-primary hover:border-secondary transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground/60">Round {round.number}</p>
                        <p className="text-2xl font-bold text-primary">{round.duration}</p>
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <h3 className="text-2xl font-bold">{round.title}</h3>
                      <p className="text-foreground/70">{round.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Event Details */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Event Details</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Duration', value: '2 Hours' },
              { label: 'Team Size', value: '1-2 Participants' },
              { label: 'Format', value: 'Onsite Competition' },
              { label: 'Judging Criteria', value: 'Innovation, Technical Depth & Demo' },
              { label: 'Allowed Tools', value: 'Any AI Models, Frameworks & Languages' },
              { label: 'Requirements', value: 'Bring Your Own Laptop' },
            ].map((detail, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-6 space-y-3"
              >
                <p className="text-sm text-foreground/60 uppercase tracking-wide">{detail.label}</p>
                <p className="text-2xl font-bold text-secondary">{detail.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Judging Criteria */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Judging Criteria</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Innovation & Approach',
                percentage: '40%',
                description: 'Originality, architecture design, and creative utilization of AI agent workflows.',
              },
              {
                title: 'Technical Implementation',
                percentage: '35%',
                description: 'Functionality, solution scalability, code optimization, and correctness.',
              },
              {
                title: 'Live Demo & Presentation',
                percentage: '25%',
                description: 'Clarity of presentation, architecture explanation, and live agent demonstration.',
              },
            ].map((criteria, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-4 text-center"
              >
                <div className="text-5xl font-bold text-primary">{criteria.percentage}</div>
                <h3 className="text-2xl font-bold">{criteria.title}</h3>
                <p className="text-foreground/70">{criteria.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
