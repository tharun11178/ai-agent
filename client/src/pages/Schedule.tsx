import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Schedule() {
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

  const scheduleEvents = [
    {
      phase: 'Arrival & Check-in',
      date: 'August 8, 2026',
      time: '10:00 AM IST',
      description: 'On-site check-in and seating setup for participants at the venue.',
      icon: Calendar,
      status: 'upcoming',
      details: [
        'On-site check-in & badge collection',
        'Team verification & seating',
        'Venue seating & network setup',
        'Participant welcome kit distribution',
      ],
    },
    {
      phase: 'Inauguration & Briefing',
      date: 'August 8, 2026',
      time: '10:30 AM IST',
      description: 'Welcome address, competition rules overview, judging criteria, and technical guidelines.',
      icon: Clock,
      status: 'upcoming',
      details: [
        'Inaugural speech & welcome address',
        'Rules & guidelines overview',
        'Judging criteria explanation',
        'Technical environment verification',
      ],
    },
    {
      phase: 'Problem Statement Release',
      date: 'August 8, 2026',
      time: '11:00 AM IST',
      description: 'Official release of problem statements and commencement of the competition clock.',
      icon: AlertCircle,
      status: 'upcoming',
      details: [
        'Official problem statement release',
        'Competition clock officially begins',
        '15-minute clarification window',
        'Mentor allocation to tracks',
      ],
    },
    {
      phase: 'Development Phase',
      date: 'August 8, 2026',
      time: '11:00 AM – 1:00 PM IST',
      description: 'Intense 2-hour development window for teams to build and test their AI agent solutions.',
      icon: Clock,
      status: 'upcoming',
      details: [
        'Core solution architecture & coding',
        'AI model & API integrations',
        'Testing & workflow debugging',
        'On-site technical mentor support',
      ],
    },
    {
      phase: 'Submission & Code Freeze',
      date: 'August 8, 2026',
      time: '1:00 PM – 1:15 PM IST',
      description: 'Code freeze, final project submission, and preliminary evaluator checks.',
      icon: CheckCircle,
      status: 'upcoming',
      details: [
        'Strict code freeze at 1:00 PM',
        'Final code & repository submission',
        'System integrity verification',
        'Demo order assignment',
      ],
    },
    {
      phase: 'Presentation & Live Demo',
      date: 'August 8, 2026',
      time: '1:15 PM – 2:15 PM IST',
      description: 'Teams present live demonstrations of their AI agents to the judging panel.',
      icon: Clock,
      status: 'upcoming',
      details: [
        'Live agent demonstration',
        'Technical architecture walkthrough',
        'Q&A session with judges',
        'Scoring & evaluation compilation',
      ],
    },
    {
      phase: 'Results & Closing Ceremony',
      date: 'August 8, 2026',
      time: '2:15 PM IST',
      description: 'On-the-spot announcement of winners, trophy and certificate distribution, and closing remarks.',
      icon: CheckCircle,
      status: 'upcoming',
      details: [
        'On-the-spot winner announcement',
        'Trophy & certificate distribution',
        'Special category awards presentation',
        'Official photo session & closing ceremony',
      ],
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
              Event <span className="gradient-text">Schedule</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Mark your calendars! Here's the complete single-day schedule for the AI Agent Challenge on August 8, 2026.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Complete Timeline</h2>
          </motion.div>

          {/* Timeline visualization */}
          <div className="space-y-8">
            {scheduleEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === scheduleEvents.length - 1;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Timeline connector line */}
                  {!isLast && (
                    <div className="absolute left-8 top-24 w-1 h-12 bg-gradient-to-b from-primary/50 to-primary/10" />
                  )}

                  {/* Timeline item */}
                  <div className="flex gap-6">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-primary/50 hover:border-primary transition-colors"
                      >
                        <Icon className="w-8 h-8 text-secondary" />
                      </motion.div>
                    </div>

                    {/* Event details */}
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="glass-card p-8 flex-1 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-primary mb-2">
                            {event.phase}
                          </h3>
                          <p className="text-foreground/80 mb-4">{event.description}</p>
                        </div>
                        <span className="px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold whitespace-nowrap">
                          {event.status}
                        </span>
                      </div>

                      {/* Date and time */}
                      <div className="flex flex-col sm:flex-row gap-6 py-4 border-t border-primary/10">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-secondary" />
                          <div>
                            <p className="text-sm text-foreground/60">Date</p>
                            <p className="font-semibold text-foreground">{event.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-secondary" />
                          <div>
                            <p className="text-sm text-foreground/60">Time</p>
                            <p className="font-semibold text-foreground">{event.time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details list */}
                      <div className="pt-4 border-t border-primary/10">
                        <p className="text-sm font-semibold text-foreground/80 mb-3">
                          Key Details:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {event.details.map((detail, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-foreground/70"
                            >
                              <span className="text-secondary mt-1">✓</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Important Dates Summary */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Important Dates at a Glance</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Event Date',
                date: 'Aug 8, 2026',
                color: 'from-primary/30 to-secondary/30',
              },
              {
                label: 'Check-in & Briefing',
                date: '10:00 AM IST',
                color: 'from-secondary/30 to-accent/30',
              },
              {
                label: 'Competition Start',
                date: '11:00 AM IST',
                color: 'from-accent/30 to-primary/30',
              },
              {
                label: 'Results & Ceremony',
                date: '2:15 PM IST',
                color: 'from-primary/30 to-accent/30',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`glass-card p-8 space-y-4 text-center bg-gradient-to-br ${item.color}`}
              >
                <p className="text-sm text-foreground/60 uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-primary">{item.date}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Schedule FAQs</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'Is this a one-day or multi-day event?',
                answer: 'The AI Agent Challenge is a single-day event taking place on August 8, 2026, featuring everything from briefing to live demos and results.',
              },
              {
                question: 'What time does check-in open?',
                answer: 'Check-in and venue setup open at 10:00 AM IST on August 8, 2026.',
              },
              {
                question: 'When will the problem statement be released?',
                answer: 'The problem statement will be released at exactly 11:00 AM IST on August 8, 2026, immediately after the briefing.',
              },
              {
                question: 'How will solutions be evaluated?',
                answer: 'Teams submit code by 1:00 PM IST and deliver a live demonstration to the judges between 1:15 PM and 2:15 PM IST.',
              },
              {
                question: 'When will results be announced?',
                answer: 'Results will be announced on the spot at 2:15 PM IST during the closing ceremony on August 8, 2026.',
              },
              {
                question: 'What should teams bring on the event day?',
                answer: 'Teams should bring laptops with preferred AI tools and development environments pre-configured.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-3 border-l-4 border-secondary"
              >
                <h3 className="text-lg font-bold text-secondary">{faq.question}</h3>
                <p className="text-foreground/80">{faq.answer}</p>
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
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-4">
              Don't Miss Out! <span className="gradient-text">Get Prepared</span>
            </h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Join us on August 8, 2026. Review rules and problem statements to prepare your team for the AI Agent Challenge.
            </p>
            <motion.a
              href="/problem-statement"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-block"
            >
              View Problem Statement
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
