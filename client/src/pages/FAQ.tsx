import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Phone, Mail } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const faqs = [
    {
      question: 'Who can participate in the AI Agent Challenge?',
      answer: 'Any student or tech enthusiast eligible for the event can participate. Teams can participate individually (solo) or in pairs.',
    },
    {
      question: 'What is the team size limit?',
      answer: 'Teams consist of 1-2 participants. Solo participation is completely allowed and welcomed.',
    },
    {
      question: 'What are the rules regarding problem statements?',
      answer: 'Problem statements will be released only after the official commencement of the event. Each participating team will be assigned a unique problem statement by the organizers.',
    },
    {
      question: 'Is there a clarification window for problem statements?',
      answer: 'Yes, questions regarding the problem statement may be asked only during the first 15 minutes after its release. Clarifications by organizers are final.',
    },
    {
      question: 'What AI models, tools, or programming languages can we use?',
      answer: 'There are no technology restrictions. Teams are free to choose their preferred AI models, frameworks, programming languages, architectures, APIs, and development tools.',
    },
    {
      question: 'Do we need to bring our own equipment?',
      answer: 'Yes! Teams must bring their own laptops with their desired development environments and software tools pre-configured.',
    },
    {
      question: 'Is internet access allowed during the competition?',
      answer: 'Yes, internet access is fully allowed during the event.',
    },
    {
      question: 'How are solutions submitted and evaluated?',
      answer: 'Teams must submit their complete solution within the allotted event timeline. Each team will present a live demonstration of their AI agent solution explaining its architecture, workflow, and key features to the judges.',
    },
    {
      question: 'What happens if a team starts development early?',
      answer: 'Teams are strictly prohibited from starting development before the problem statement is officially announced. Early development or plagiarism results in disqualification.',
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
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Find answers to common questions regarding rules, team size, logistics, and competition guidelines.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container max-w-3xl space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className="w-5 h-5 text-primary" />
                </motion.div>
              </button>

              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-primary/10 px-8 py-6 bg-white/5"
                >
                  <p className="text-foreground/80 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container text-center space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-4">Have further questions?</h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-xl mx-auto">
              Contact our event coordination team for assistance and inquiries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8 text-left">
              <a
                href="tel:8309723299"
                className="glass-card p-6 flex items-center gap-4 hover:border-cyan-400/50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">R. Hemalatha</h4>
                  <p className="text-cyan-400 font-mono text-sm font-semibold">+91 83097 23299</p>
                  <p className="text-xs text-foreground/60">Event Coordinator</p>
                </div>
              </a>

              <a
                href="tel:7032401370"
                className="glass-card p-6 flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Tharun</h4>
                  <p className="text-primary font-mono text-sm font-semibold">+91 70324 01370</p>
                  <p className="text-xs text-foreground/60">Event Coordinator</p>
                </div>
              </a>

              <a
                href="tel:7013782068"
                className="glass-card p-6 flex items-center gap-4 hover:border-secondary/50 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Praveen</h4>
                  <p className="text-secondary font-mono text-sm font-semibold">+91 70137 82068</p>
                  <p className="text-xs text-foreground/60">Event Coordinator</p>
                </div>
              </a>
            </div>

            <motion.a
              href="/rules"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-block"
            >
              View Full Rules
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

