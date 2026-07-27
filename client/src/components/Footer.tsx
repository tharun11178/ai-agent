import { motion } from 'framer-motion';
import { Mail, Phone, Bot } from 'lucide-react';

export function Footer() {
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

  return (
    <footer className="relative border-t border-primary/10 bg-background/50 backdrop-blur-xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container py-16 space-y-12"
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold gradient-text">AI Agent Challenge</span>
            </div>
            <p className="text-foreground/60 text-sm leading-relaxed">
              A premium 2-hour AI competition where brilliant minds showcase their problem-solving abilities.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Home', href: '/' },
                { name: 'About', href: '/about' },
                { name: 'Events', href: '/events' },
                { name: 'Rules', href: '/rules' },
                { name: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-foreground/60 hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                <Phone className="w-4 h-4 text-primary" />
                <span>Tharun: <strong>+91 7032401370</strong></span>
              </li>
              <li className="flex items-center gap-2 text-foreground/80 hover:text-secondary transition-colors cursor-pointer">
                <Phone className="w-4 h-4 text-secondary" />
                <span>Praveen: <strong>+91 7013782068</strong></span>
              </li>
              <li className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors cursor-pointer">
                <Mail className="w-4 h-4" />
                aitheronmlsymposium@gmail.com
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0" />

        {/* Bottom Footer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/60"
        >
          <p>&copy; 2024 AI Agent Challenge. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Code of Conduct
            </a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
