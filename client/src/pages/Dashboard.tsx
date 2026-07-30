import { motion } from 'framer-motion';
import { Users, Bell, Send, Trophy, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
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

  const dashboardCards = [
    {
      icon: Users,
      title: 'Team Status',
      status: 'Active',
      details: 'Your team is registered and verified',
      color: 'text-accent',
    },
    {
      icon: Bell,
      title: 'Announcements',
      status: '2 New',
      details: 'Check latest updates and event notices',
      color: 'text-secondary',
    },
    {
      icon: Send,
      title: 'Submission',
      status: 'Not Submitted',
      details: 'Submit your solution during the event window',
      color: 'text-warning',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Event <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-foreground/80">
              Welcome to your AI Agent Challenge command center. Monitor your team status and track competition progress.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Dashboard Cards */}
      <section className="py-12 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-6 space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{card.title}</h3>
                        <p className="text-sm text-foreground/60">{card.details}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold whitespace-nowrap">
                      {card.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Team Information */}
      <section className="py-12 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-6">Team Information</h2>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide">Team Name</p>
                  <p className="text-2xl font-bold">Innovation Squad</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide">College</p>
                  <p className="text-lg text-foreground/90">Tech Institute of Excellence</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide">Department</p>
                  <p className="text-lg text-foreground/90">Computer Science & Engineering</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide">Team Lead</p>
                  <p className="text-lg font-semibold">John Doe</p>
                  <p className="text-sm text-foreground/60">john.doe@college.edu</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide">Team Members</p>
                  <ul className="space-y-1 text-foreground/80">
                    <li>• Jane Smith</li>
                    <li>• Mike Johnson</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Announcements */}
      <section className="py-12 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-6">Latest Announcements</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                title: 'Event Reminder',
                message: 'The AI Agent Challenge will start in 2 days. Make sure your team is ready!',
                time: '2 hours ago',
              },
              {
                title: 'Problem Statement Released',
                message: 'The problem statement is now available in the dashboard. Download it and start preparing.',
                time: '1 day ago',
              },
            ].map((announcement, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-6 space-y-3 border-l-4 border-secondary"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold">{announcement.title}</h3>
                  <span className="text-xs text-foreground/60">{announcement.time}</span>
                </div>
                <p className="text-foreground/80">{announcement.message}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container space-y-8"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Rules & Guidelines',
                description: 'Review event rules & evaluation criteria',
                action: () => (window.location.href = '/rules'),
              },
              {
                icon: Send,
                title: 'Submit Solution',
                description: 'Submit your code and demo',
                action: () => {},
              },
              {
                icon: Trophy,
                title: 'View Results',
                description: 'Check leaderboard and rankings',
                action: () => {},
              },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={i}
                  variants={itemVariants}
                  onClick={action.action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-6 space-y-3 hover:border-primary/40 transition-colors group text-left w-full"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-left">{action.title}</h3>
                  <p className="text-sm text-foreground/60 text-left">{action.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
