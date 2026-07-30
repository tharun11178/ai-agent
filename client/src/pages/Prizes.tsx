import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';

export default function Prizes() {
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

  const prizes = [
    {
      rank: '1st Place',
      amount: 'Cash Prize',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      perks: [
        'Cash Prize',
        'Certificate of Excellence',
        'Internship Opportunity',
        'Featured on Website',
        'Tech Merchandise',
      ],
    },
    {
      rank: '2nd Place',
      amount: 'Cash Prize',
      icon: Medal,
      color: 'from-gray-400 to-gray-500',
      perks: [
        'Cash Prize',
        'Certificate of Merit',
        'Mentorship Program',
        'Featured on Website',
        'Tech Merchandise',
      ],
    },
    {
      rank: '3rd Place',
      amount: 'Cash Prize',
      icon: Star,
      color: 'from-orange-400 to-red-500',
      perks: [
        'Cash Prize',
        'Certificate of Achievement',
        'Learning Resources',
        'Featured on Website',
        'Tech Merchandise',
      ],
    },
  ];

  const specialAwards = [
    {
      title: 'Best Innovation Award',
      description: 'For the most creative and innovative solution',
      prize: 'Cash Prize',
    },
    {
      title: 'Best Code Quality Award',
      description: 'For the cleanest and most efficient code',
      prize: 'Cash Prize',
    },
    {
      title: 'Best Presentation Award',
      description: 'For the best demo and explanation',
      prize: 'Cash Prize',
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
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Exciting <span className="gradient-text">Prizes</span>
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Compete for premium rewards and recognition. Top performers will be rewarded with cash prizes, internship opportunities, tech merchandise, and more.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Prizes */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Prize Distribution</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {prizes.map((prize, i) => {
              const Icon = prize.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass-card p-8 space-y-6 relative overflow-hidden group"
                >
                  {/* Background glow */}
                  <div
                    className={`absolute inset-0 -z-10 bg-gradient-to-br ${prize.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/60 uppercase tracking-wide">Rank</p>
                      <p className="text-3xl font-bold">{prize.rank}</p>
                    </div>
                    <Icon className="w-12 h-12 text-primary opacity-50" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-foreground/60">Total Cash Prize</p>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${prize.color} bg-clip-text text-transparent`}>
                      {prize.amount}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-primary/10">
                    <p className="text-sm font-semibold text-foreground/80">Includes:</p>
                    <ul className="space-y-2">
                      {prize.perks.map((perk, j) => (
                        <li key={j} className="flex items-center gap-2 text-foreground/70">
                          <span className="text-secondary">✓</span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Special Awards */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Special Awards</h2>
            <p className="text-lg text-foreground/80 mb-12">
              In addition to the main prizes, we recognize exceptional achievements across different categories.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialAwards.map((award, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-4 hover:border-secondary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">{award.title}</h3>
                <p className="text-foreground/70">{award.description}</p>
                <div className="pt-4 border-t border-primary/10">
                  <p className="text-2xl font-bold text-secondary">{award.prize}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Prize Details */}
      <section className="py-20 border-t border-primary/10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container space-y-12"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-12">Prize Details</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                title: 'Cash Prizes',
                description: 'Winners will receive cash prizes transferred directly to their bank accounts within 7 days of the competition.',
              },
              {
                title: 'Internship Opportunities',
                description: 'Top performers will be offered internship positions with leading tech companies and startups.',
              },
              {
                title: 'Certificates',
                description: 'All participants will receive certificates of participation. Winners receive special certificates of achievement.',
              },
              {
                title: 'Tech Merchandise',
                description: 'Winners will receive exclusive tech merchandise including branded items and gadgets.',
              },
            ].map((detail, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card p-8 space-y-3 border-l-4 border-primary"
              >
                <h3 className="text-xl font-bold">{detail.title}</h3>
                <p className="text-foreground/80">{detail.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
