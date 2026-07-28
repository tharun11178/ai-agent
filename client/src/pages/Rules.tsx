import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Users, FileText, Code2, Clock, ShieldAlert, Send, Presentation, Laptop } from 'lucide-react';

export default function Rules() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const ruleCategories = [
    {
      title: 'Team & Logistics',
      icon: Users,
      rules: [
        'Team Size: 1-2 participants per team',
        'Bring your own laptops with required dev environments pre-installed',
        'Internet access is fully allowed during the event',
        'Any programming language, stack, or framework is allowed',
      ],
    },
    {
      title: 'Problem Statement Release',
      icon: FileText,
      rules: [
        'The problem statement will be revealed only after official commencement of the event',
        'Unique Problem Statement: Each participating team will be assigned a unique problem statement by the organizers',
      ],
    },
    {
      title: 'Development Restrictions & Tech Freedom',
      icon: Code2,
      rules: [
        'Teams are strictly prohibited from starting development before official problem release',
        'Development must begin only after the event starts',
        'Technology Freedom: Choose preferred AI models, frameworks, programming languages, architectures, APIs, and dev tools',
        'Solution Approach: No restrictions on implementation approach. Teams are encouraged to design innovative, scalable, and efficient AI agent solutions',
      ],
    },
    {
      title: 'Clarification Window',
      icon: Clock,
      rules: [
        'Questions related to the problem statement may be asked only during the first 15 minutes after release',
        'Clarifications provided by the organizers will be considered final and binding',
      ],
    },
    {
      title: 'Fair Competition & Conduct',
      icon: ShieldAlert,
      rules: [
        'All teams must develop their own original solution during the event',
        'Any form of plagiarism, unauthorized collaboration, or unfair practices will result in immediate disqualification',
      ],
    },
    {
      title: 'Submission Guidelines',
      icon: Send,
      rules: [
        'Teams must submit their complete solution within the specified event timeline',
        'Late submissions will not be accepted unless explicitly stated by the organizers',
      ],
    },
    {
      title: 'Presentation & Demonstration',
      icon: Presentation,
      rules: [
        'Each team must present a live demonstration of their AI agent solution',
        'Explain architecture, workflow, and key features within the allotted presentation time',
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-transparent" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Official Competition <span className="gradient-text">Rules</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Please review all rules carefully prior to the event. Compliance is mandatory for all participating teams.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Highlights Banner */}
      <section className="py-8 bg-primary/5 border-y border-primary/10">
        <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3 p-4">
            <Users className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground/90">Team Size: 1 - 2 Participants</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4">
            <Laptop className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground/90">Bring Your Own Laptop</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground/90">Any Tech Stack / AI Model</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4">
            <Clock className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground/90">15-Min Clarification Window</span>
          </div>
        </div>
      </section>

      {/* Rules Grid */}
      <section className="py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ruleCategories.map((category, i) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-8 space-y-6 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                  </div>

                  <ul className="space-y-3">
                    {category.rules.map((rule, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="text-secondary mt-1 flex-shrink-0">•</span>
                        <span className="text-foreground/80 leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Important Notes */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Important Notes</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                title: 'Academic Integrity & Fair Play',
                description: 'All work presented must be built during the event timeframe. Plagiarism, unauthorized external assistance, or pre-built complete solutions are strictly prohibited.',
              },
              {
                title: 'Hardware & Infrastructure',
                description: 'Participants are responsible for bringing their own laptop, chargers, and pre-installed software tools. Stable internet access will be provided at the venue.',
              },
              {
                title: 'Live Demonstration Requirement',
                description: 'Winning candidates will be evaluated based on their live demonstration, architectural breakdown, and response to judges during the presentation phase.',
              },
            ].map((note, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-3 border-l-4 border-secondary"
              >
                <h3 className="text-xl font-bold text-secondary">{note.title}</h3>
                <p className="text-foreground/80">{note.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container text-center space-y-6"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-4">Ready to Compete?</h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Confirm your understanding of the rules and register your team for the challenge.
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-block"
            >
              Register Your Team
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
